#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import express from 'express';
import { exec } from 'child_process';
import { generateReactIcon } from '../templates/react-icon.js';
import { getProvider } from './providers.js';


export let app;

export const requireLocalOrigin = (req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  if (!origin) {
    return res.status(403).json({ error: 'Forbidden: Missing origin' });
  }
  try {
    const url = new URL(origin);
    const allowedHosts = ['127.0.0.1', 'localhost', '[::1]'];
    if (!allowedHosts.includes(url.hostname)) {
      return res.status(403).json({ error: 'Forbidden: Invalid origin' });
    }
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid origin URL' });
  }
  next();
};

export const resolveIconName = (baseName, pattern = "{name}Icon") => {
  if (typeof pattern !== 'string') pattern = "{name}Icon";
  let rawName = pattern.replaceAll("{name}", baseName);
  const parts = rawName.split(/[^a-zA-Z0-9]+/);
  const pascalParts = parts.map(part => {
    if (!part) return "";
    return part.charAt(0).toUpperCase() + part.slice(1);
  });
  let finalName = pascalParts.join("");
  if (/^[0-9]/.test(finalName)) {
    finalName = "Icon" + finalName;
  }
  return finalName;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const cwd = process.cwd();

const CONFIG_FILE = path.join(cwd, 'iconcodegen.json');

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {

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
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({ savePath, provider, iconNamePattern: "{name}Icon" }, null, 2));
      console.log(`\n✅ Configuration saved to iconcodegen.json`);
      console.log(`Icons will be saved to: ${savePath}`);
      console.log(`Using provider: ${provider}\n`);
      rl.close();
    });
  });
} else if (args[0] === 'prune') {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ Configuration not found. Please run `npx iconcodegen init` first.');
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  const savePath = path.resolve(cwd, config.savePath);
  
  const isDryRun = args.includes('--dry-run');
  console.log(`🔍 Scanning ${config.savePath} for barrel files...`);
  
  let indexPath = null;
  const indexExts = ['.ts', '.js', '.tsx', '.jsx'];
  for (const ext of indexExts) {
    const p = path.join(savePath, 'index' + ext);
    if (fs.existsSync(p)) {
      indexPath = p;
      break;
    }
  }

  if (!indexPath) {
    console.log(`✨ No barrel file found in ${config.savePath}.`);
    process.exit(0);
  }

  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  const lines = indexContent.split(/\r?\n/);
  const newLines = [];
  let prunedCount = 0;

  const exportRegex = /^export\s+\{\s*([a-zA-Z0-9_$]+)\s*\}\s+from\s+['"]\.\/([^'"/]+)['"];?\s*$/;
  const compExts = ['.tsx', '.jsx', '.ts', '.js'];

  for (const line of lines) {
    const match = exportRegex.exec(line);
    if (match) {
      const exportName = match[1];
      const baseNameExt = match[2];
      const baseFilePath = path.join(savePath, baseNameExt);
      
      let fileExists = false;
      for (const ext of compExts) {
        if (fs.existsSync(baseFilePath + ext)) {
          fileExists = true;
          break;
        }
      }

      if (!fileExists) {
        console.log(`🗑️  ${isDryRun ? '[DRY RUN] Would remove' : 'Removed'} dangling export: ${exportName} (file not found)`);
        prunedCount++;
        continue;
      }
    }
    newLines.push(line);
  }

  if (prunedCount === 0) {
    console.log(`✨ Barrel file is already clean. No dangling exports found.`);
  } else {
    if (!isDryRun) {
      fs.writeFileSync(indexPath, newLines.join('\n'), 'utf-8');
      console.log(`✅ Prune complete. Cleaned up ${prunedCount} missing export(s).`);
    } else {
      console.log(`✅ Dry run complete. Found ${prunedCount} missing export(s) to remove.`);
    }
  }
  process.exit(0);
} else if (args[0] === 'audit') {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ Configuration not found. Please run `npx iconcodegen init` first.');
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  const isDryRun = args.includes('--dry-run');
  const targetDirIndex = args.indexOf('--target');
  const targetDir = targetDirIndex > -1 ? args[targetDirIndex + 1] : './src';
  
  const { runAudit } = await import('./audit.js');
  runAudit(config, cwd, isDryRun, targetDir);
} else {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ Configuration not found. Please run `npx iconcodegen init` first.');
    process.exit(1);
  }

  function validateIconNamePattern(pattern) {
    if (pattern && typeof pattern === 'string' && !pattern.includes('{name}')) {
      throw new Error(`The pattern must contain the "{name}" token.`);
    }
    const testPattern = pattern || "{name}Icon";
    const testResolved = resolveIconName("TestIcon", testPattern);
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(testResolved)) {
      throw new Error(`The pattern "${testPattern}" produces an invalid JavaScript identifier.`);
    }
  }

  let currentConfig = null;
  let configLastMtime = 0;

  function getConfig() {
    try {
      const stats = fs.statSync(CONFIG_FILE);
      if (stats.mtimeMs > configLastMtime) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const newConfig = JSON.parse(raw);

        validateIconNamePattern(newConfig.iconNamePattern);

        const isReload = currentConfig !== null;
        currentConfig = newConfig;
        configLastMtime = stats.mtimeMs;
        
        if (isReload) {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          console.log(`\x1b[90m[${time}]\x1b[0m 🔄 Config hot-reloaded`);
        }
      }
    } catch (err) {
      if (!currentConfig) {
        console.error(`❌ Invalid iconcodegen.json: ${err.message}`);
        process.exit(1);
      }
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      console.warn(`\x1b[90m[${time}]\x1b[0m ⚠️ Config reload failed (${err.message}). Using last known good config.`);
      configLastMtime = fs.statSync(CONFIG_FILE).mtimeMs;
    }
    return currentConfig;
  }

  // Initial load to validate on startup
  const config = getConfig();

  // Actively watch the file so the terminal logs instantly on save (better DX)
  try {
    let watchTimeout;
    fs.watchFile(CONFIG_FILE, { interval: 500 }, (curr, prev) => {
      if (curr.mtimeMs > prev.mtimeMs) {
        clearTimeout(watchTimeout);
        watchTimeout = setTimeout(() => {
          getConfig();
        }, 150);
      }
    });
  } catch (err) {
    // Ignore watcher errors, fallback to the lazy check is already in place
  }

  const savePath = path.resolve(cwd, config.savePath);
  const providerName = config.provider || 'iconify';

  let activeProvider;
  try {
    activeProvider = await getProvider(providerName);
  } catch (err) {
    process.exit(1);
  }

  app = express();
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
    
    const currentConfig = getConfig();
    const iconName = overrideIconName || resolveIconName(baseName, currentConfig.iconNamePattern);
    const ext = customizations.language === 'js' ? 'jsx' : 'tsx';
    const fileName = `${iconName}.${ext}`;

    const enrichedCustomizations = {
      ...(customizations || {}),
      iconcodegenSource: `${activeProvider.name}:${icon_id}`
    };

    const componentCode = await generateReactIcon(iconName, svgContent, enrichedCustomizations);

    return { componentCode, fileName, iconName };
  }

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
      const currentConfig = getConfig();
      for (const id of icon_ids) {
        if (!id || typeof id !== 'string') continue;
        const parts = id.split(':');
        const prefix = parts.length > 1 ? parts[0] : '';
        const name = parts.length > 1 ? parts[1] : id;
        
        const baseName = name.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
                            .replace(/^([a-z])/, (m, chr) => chr.toUpperCase());
        const defaultName = resolveIconName(baseName, currentConfig.iconNamePattern);
        map.push({ id, prefix, baseName, defaultName, finalName: defaultName });
        nameCounts[defaultName] = (nameCounts[defaultName] || 0) + 1;
      }
      
      for (const item of map) {
        if (nameCounts[item.defaultName] > 1 && item.prefix) {
           const prefixCap = item.prefix.replace(/[^a-zA-Z0-9]+(.)/g, (m, c) => c.toUpperCase())
                                        .replace(/^([a-z])/, (m, c) => c.toUpperCase());
           item.finalName = resolveIconName(item.baseName + prefixCap, currentConfig.iconNamePattern);
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

}