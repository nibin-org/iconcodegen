#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import express from 'express';
import { exec } from 'child_process';
import { generateReactIcon } from '../templates/react-icon.js';
import { getProvider } from './providers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const cwd = process.cwd();

const CONFIG_FILE = path.join(cwd, 'iconcodegen.json');

const args = process.argv.slice(2);

let isHeadless = false;
let startPort = 3000;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--headless') isHeadless = true;
  if (args[i] === '--port' || args[i] === '-p') {
    startPort = parseInt(args[i+1], 10) || 3000;
  }
}

if (args[0] === 'init') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Where would you like to save your icons? (default: ./src/components/icons) ', (answer) => {
    const savePath = answer.trim() || './src/components/icons';
    rl.question('Which icon provider do you want to use? [iconify | untitled-ui] (default: iconify) ', (answer2) => {
      const provider = answer2.trim() || 'iconify';
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({ savePath, provider }, null, 2));
      console.log(`\n✅ Configuration saved to iconcodegen.json`);
      console.log(`Icons will be saved to: ${savePath}`);
      console.log(`Using provider: ${provider}\n`);
      rl.close();
    });
  });
} else {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ Configuration not found. Please run `npx iconcodegen init` first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  const savePath = path.resolve(cwd, config.savePath);
  const providerName = config.provider || 'iconify';

  let activeProvider;
  try {
    activeProvider = await getProvider(providerName);
  } catch (err) {
    process.exit(1);
  }

  const app = express();
  app.use(express.json());
  
  // Serve public folder
  app.use(express.static(path.join(projectRoot, 'public')));

  async function fetchAndGenerateCode(icon_id, customizations, overrideIconName = null) {
    if (!icon_id) throw new Error('icon_id is required');

    const [prefix, name] = icon_id.split(':');
    
    const svgContent = await activeProvider.getSvg(icon_id);
    if (!svgContent) {
      throw new Error(`Failed to fetch icon: ${icon_id} not found.`);
    }

    const baseName = name.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
                        .replace(/^([a-z])/, (m, chr) => chr.toUpperCase());
    const iconName = overrideIconName || `${baseName}Icon`;
    const ext = customizations.language === 'js' ? 'jsx' : 'tsx';
    const fileName = `${iconName}.${ext}`;

    const componentCode = await generateReactIcon(iconName, svgContent, customizations || {});

    return { componentCode, fileName, iconName };
  }

  const requireLocalOrigin = (req, res, next) => {
    const origin = req.headers.origin || req.headers.referer;
    if (origin) {
      try {
        const url = new URL(origin);
        if (url.hostname !== '127.0.0.1') {
          return res.status(403).json({ error: 'Forbidden: Invalid origin' });
        }
      } catch (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid origin URL' });
      }
    }
    next();
  };

  function updateIndexFile(targetPath, newExports, customizations) {
    if (!newExports || newExports.length === 0) return;
    const ext = customizations?.language === 'js' ? 'js' : 'ts';
    const indexPath = path.join(targetPath, `index.${ext}`);
    let indexContent = '';
    if (fs.existsSync(indexPath)) {
      indexContent = fs.readFileSync(indexPath, 'utf-8');
    }
    
    let updated = false;
    for (const { iconName, fileName } of newExports) {
      const baseNameExt = fileName.replace(/\.[jt]sx?$/, '');
      const exportStatement = `export { ${iconName} } from './${baseNameExt}';`;
      if (!indexContent.includes(`{ ${iconName} }`)) {
        if (indexContent && !indexContent.endsWith('\n')) {
          indexContent += '\n';
        }
        indexContent += exportStatement + '\n';
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(indexPath, indexContent, 'utf-8');
    }
  }

  app.post('/api/download', requireLocalOrigin, async (req, res) => {
    try {
      const { icon_id, customizations } = req.body;
      const { componentCode, fileName, iconName } = await fetchAndGenerateCode(icon_id, customizations);

      if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
      }

      const filePath = path.join(savePath, fileName);
      fs.writeFileSync(filePath, componentCode, 'utf-8');

      updateIndexFile(savePath, [{ iconName, fileName }], customizations);

      res.json({ success: true, message: `Saved ${fileName}`, fileName, filePath });
    } catch (err) {
      console.error(err);
      const status = err.message.includes('required') ? 400 : (err.message.includes('not found') ? 404 : 500);
      res.status(status).json({ error: err.message });
    }
  });

  app.post('/api/generate-snippet', requireLocalOrigin, async (req, res) => {
    try {
      const { icon_id, customizations } = req.body;
      const { componentCode } = await fetchAndGenerateCode(icon_id, customizations);

      res.json({ success: true, code: componentCode });
    } catch (err) {
      console.error(err);
      const status = err.message.includes('required') ? 400 : (err.message.includes('not found') ? 404 : 500);
      res.status(status).json({ error: err.message });
    }
  });

  app.post('/api/batch-generate', requireLocalOrigin, async (req, res) => {
    try {
      const { icon_ids, customizations } = req.body;
      if (!Array.isArray(icon_ids) || icon_ids.length === 0) {
        return res.status(400).json({ error: 'icon_ids must be a non-empty array' });
      }

      const map = [];
      const nameCounts = {};
      for (const id of icon_ids) {
        if (!id || typeof id !== 'string') continue;
        const parts = id.split(':');
        const prefix = parts.length > 1 ? parts[0] : '';
        const name = parts.length > 1 ? parts[1] : id;
        
        const baseName = name.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
                            .replace(/^([a-z])/, (m, chr) => chr.toUpperCase());
        const defaultName = `${baseName}Icon`;
        map.push({ id, prefix, baseName, defaultName, finalName: defaultName });
        nameCounts[defaultName] = (nameCounts[defaultName] || 0) + 1;
      }
      
      for (const item of map) {
        if (nameCounts[item.defaultName] > 1 && item.prefix) {
           const prefixCap = item.prefix.replace(/[^a-zA-Z0-9]+(.)/g, (m, c) => c.toUpperCase())
                                        .replace(/^([a-z])/, (m, c) => c.toUpperCase());
           item.finalName = `${item.baseName}${prefixCap}Icon`;
        }
      }

      if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
      }

      const written = [];
      const failed = [];
      const newExports = [];

      for (const item of map) {
        try {
          const { componentCode, fileName, iconName } = await fetchAndGenerateCode(item.id, customizations, item.finalName);
          const filePath = path.join(savePath, fileName);
          fs.writeFileSync(filePath, componentCode, 'utf-8');
          written.push(item.id);
          newExports.push({ iconName, fileName });
        } catch (err) {
          failed.push({ id: item.id, error: err.message });
        }
      }

      updateIndexFile(savePath, newExports, customizations);

      res.json({ success: true, written, failed });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/filters', async (req, res) => {
    try {
      if (typeof activeProvider.getFilters === 'function') {
        const filters = await activeProvider.getFilters();
        res.json(filters);
      } else {
        res.json({ packs: [], styles: [] });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const q = req.query.query || '';
      const limit = parseInt(req.query.limit) || 100;
      const start = parseInt(req.query.start) || 0;
      
      const options = {
        packs: req.query.packs ? req.query.packs.split(',').filter(Boolean) : [],
        styles: req.query.styles ? req.query.styles.split(',').filter(Boolean) : []
      };

      const icons = await activeProvider.search(q, limit, options, start);
      res.json({ icons });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/svg', async (req, res) => {
    try {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({ error: 'icon id is required' });
      }
      let svg = await activeProvider.getSvg(id);
      if (!svg) return res.status(404).json({ error: 'Not found' });
      
      if (req.query.color) {
        svg = svg.replace(/currentColor/gi, req.query.color);
      }
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svg);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/config', (req, res) => {
    res.json({ provider: activeProvider.name });
  });

  function startServer(port) {
    const server = app.listen(port, '127.0.0.1', () => {
      console.log(`\n🚀 iconcodegen is running at http://127.0.0.1:${port}`);
      console.log(`📂 Saving icons to: ${config.savePath}`);
      console.log(`📚 Documentation: https://iconcodegen.vercel.app\n`);
      
      if (!isHeadless) {
        const url = `http://127.0.0.1:${port}`;
        const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
        exec(`${startCmd} ${url}`).on('error', () => {
           console.log(`Failed to open browser automatically. Please visit ${url}`);
        });
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  }

  startServer(startPort);
}