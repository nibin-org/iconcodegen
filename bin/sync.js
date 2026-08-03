import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';

const traverse = traverseModule.default || traverseModule;
const generate = generateModule.default || generateModule;

function resolveIconName(baseName, pattern = "{name}Icon") {
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
}

// Ensure the first letter is capitalized
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str) {
  return str.split(/[-_]+/).map(capitalize).join('');
}

export function runSync(config, cwd, isDryRun) {
  const savePath = path.resolve(cwd, config.savePath || './src/components/icons');
  
  if (!fs.existsSync(savePath)) {
    console.log(`❌ Directory not found: ${savePath}`);
    return;
  }

  // 1. Clean up stale *.tmp files before anything else
  const allFiles = fs.readdirSync(savePath);
  for (const file of allFiles) {
    if (file.endsWith('.tmp')) {
      const tmpPath = path.join(savePath, file);
      if (!isDryRun) {
        fs.unlinkSync(tmpPath);
      }
    }
  }

  // Reload the directory contents after cleanup
  const activeFiles = fs.readdirSync(savePath)
    .filter(file => file.match(/\.(tsx|ts|jsx|js)$/))
    .filter(file => !file.endsWith('.d.ts'));

  const pattern = config.iconNamePattern || "{name}Icon";
  
  const results = {
    keep: [],
    rename: [],
    collision: [],
    duplicate: [],
    legacy: [],
    error: [],
    unsupported: []
  };

  // PASS 1: Fast-Scan and Group by Identity
  const identityGroups = new Map();

  for (const file of activeFiles) {
    const filePath = path.join(savePath, file);
    
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      results.error.push({ file, reason: 'Failed to read file' });
      continue;
    }

    const sourceMatch = content.match(/\/\/\s*@iconcodegen-source:\s*([a-zA-Z0-9\-:]+)/);
    const hasBanner = content.includes('THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY.');

    if (!sourceMatch) {
      results.legacy.push(file);
      continue;
    }

    if (!hasBanner) {
      results.unsupported.push({ file, reason: 'Missing AUTO-GENERATED banner' });
      continue;
    }

    const metadataSource = sourceMatch[1].trim();
    if (!identityGroups.has(metadataSource)) {
      identityGroups.set(metadataSource, []);
    }
    identityGroups.get(metadataSource).push(file);
  }

  // PASS 2: Elect Winners and Process AST
  for (const [metadataSource, files] of identityGroups.entries()) {
    const parts = metadataSource.split(':');
    const baseId = parts[parts.length - 1];
    const baseName = toCamelCase(baseId);
    const targetComponentName = resolveIconName(baseName, pattern);
    
    let winner = files[0];
    const exactMatchIndex = files.findIndex(f => f === `${targetComponentName}${path.extname(f)}`);
    if (exactMatchIndex !== -1) {
      winner = files[exactMatchIndex];
    } else {
      files.sort();
      winner = files[0];
    }

    for (const file of files) {
      if (file !== winner) {
        results.duplicate.push({ file, metadata: metadataSource });
      }
    }

    const ext = path.extname(winner);
    const targetFilename = `${targetComponentName}${ext}`;
    const filePath = path.join(savePath, winner);

    if (winner === targetFilename) {
      results.keep.push(winner);
      continue;
    }

    const targetPath = path.join(savePath, targetFilename);
    if (fs.existsSync(targetPath)) {
      results.collision.push({ file: winner, target: targetFilename });
      continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let ast;
    try {
      ast = parse(fileContent, {
        sourceType: 'module',
        plugins: [['typescript', { isTSX: true }], 'jsx'],
      });
    } catch (err) {
      results.unsupported.push({ file: winner, reason: 'Syntax error / unparseable' });
      continue;
    }

    let renamed = false;
    let validStructure = false;
    let exportCount = 0;
    let returnsSvg = false;
    let oldComponentName = null;

    const isSvgJSX = (node) => 
      node && node.type === 'JSXElement' && 
      node.openingElement.name.type === 'JSXIdentifier' && 
      node.openingElement.name.name === 'svg';

    traverse(ast, {
      TSTypeReference(path) {
        if (path.node.typeArguments && !path.node.typeParameters) {
          path.node.typeParameters = path.node.typeArguments;
        }
      },
      ExportNamedDeclaration(path) {
        exportCount++;
        const declaration = path.node.declaration;
        if (declaration) {
          let functionBody = null;
          
          if (declaration.type === 'FunctionDeclaration') {
            validStructure = true;
            oldComponentName = declaration.id.name;
            declaration.id.name = targetComponentName;
            renamed = true;
            functionBody = declaration.body;
          } else if (declaration.type === 'VariableDeclaration') {
            const declarator = declaration.declarations[0];
            if (declarator && (declarator.init.type === 'ArrowFunctionExpression' || declarator.init.type === 'FunctionExpression')) {
              validStructure = true;
              oldComponentName = declarator.id.name;
              declarator.id.name = targetComponentName;
              renamed = true;
              functionBody = declarator.init.body;
              
              if (isSvgJSX(functionBody)) {
                returnsSvg = true;
                functionBody = null; 
              }
            }
          }

          if (functionBody && functionBody.type === 'BlockStatement') {
            for (const statement of functionBody.body) {
              if (statement.type === 'ReturnStatement') {
                if (isSvgJSX(statement.argument)) {
                  returnsSvg = true;
                }
                break;
              }
            }
          }
        }
      }
    });

    if (exportCount !== 1 || !validStructure || !renamed || !returnsSvg) {
      results.unsupported.push({ file: winner, reason: 'Invalid semantic structure for safe rename (must return <svg>)' });
      continue;
    }

    results.rename.push({ 
      file: winner, 
      target: targetFilename, 
      ast, 
      code: fileContent,
      oldComponentName,
      newComponentName: targetComponentName
    });
  }

  // PASS 3: Pre-flight Index File Check
  // Block any renames that have manual or aliased references in the barrel file
  results.blocked = [];
  const exts = ['ts', 'js'];
  let barrelFile = null;
  for (const ext of exts) {
    const p = path.join(savePath, `index.${ext}`);
    if (fs.existsSync(p)) {
      barrelFile = p;
      break;
    }
  }

  if (barrelFile && results.rename.length > 0) {
    const barrelContent = fs.readFileSync(barrelFile, 'utf-8');
    let barrelAst;
    try {
      barrelAst = parse(barrelContent, { sourceType: 'module', plugins: ['typescript'] });
    } catch (e) {}

    if (barrelAst) {
      const pendingRenames = new Map();
      for (const item of results.rename) {
        pendingRenames.set(`./${item.file.replace(/\.[jt]sx?$/, '')}`, item);
      }

      const blockList = new Set();

      traverse(barrelAst, {
        ExportNamedDeclaration(path) {
          if (!path.node.source) return;
          const sourceValue = path.node.source.value;
          
          if (pendingRenames.has(sourceValue)) {
            const item = pendingRenames.get(sourceValue);
            // Is it a clean 1:1 export?
            const isClean = path.node.specifiers.length === 1 &&
                            path.node.specifiers[0].local.name === path.node.specifiers[0].exported.name &&
                            path.node.specifiers[0].exported.name === item.oldComponentName;
            
            if (!isClean) {
              blockList.add(sourceValue);
            }
          }
        },
        ExportAllDeclaration(path) {
          if (!path.node.source) return;
          const sourceValue = path.node.source.value;
          if (pendingRenames.has(sourceValue)) {
            blockList.add(sourceValue);
          }
        }
      });

      const safeRenames = [];
      for (const item of results.rename) {
        const sourceValue = `./${item.file.replace(/\.[jt]sx?$/, '')}`;
        if (blockList.has(sourceValue)) {
          results.blocked.push({ file: item.file, reason: 'Manual or aliased export reference found in index.ts' });
        } else {
          safeRenames.push(item);
        }
      }
      results.rename = safeRenames;
    }
  }

  // --- EXECUTE PHASE ---
  
  console.log('\nIconcodegen Sync' + (isDryRun ? ' (DRY RUN)' : ''));
  console.log('-'.repeat(50));

  results.keep.forEach(f => console.log(`[KEEP]       ${f} (Up to date)`));
  
  const indexEdits = new Map();

  for (const item of results.rename) {
    if (isDryRun) {
      console.log(`[RENAME]     ${item.file} → ${item.target}`);
      indexEdits.set(item.oldComponentName, {
        newName: item.newComponentName,
        oldFile: `./${item.file.replace(/\.[jt]sx?$/, '')}`,
        newFile: `./${item.target.replace(/\.[jt]sx?$/, '')}`
      });
      continue;
    }

    const tmpPath = path.join(savePath, `${item.target}.${process.pid}.tmp`);
    const finalPath = path.join(savePath, item.target);
    const oldPath = path.join(savePath, item.file);

    try {
      const generated = generate(item.ast, { retainLines: true }, item.code);
      fs.writeFileSync(tmpPath, generated.code, 'utf-8');
      fs.renameSync(tmpPath, finalPath);
      fs.unlinkSync(oldPath);
      console.log(`[RENAME]     ${item.file} → ${item.target}`);
      
      indexEdits.set(item.oldComponentName, {
        newName: item.newComponentName,
        oldFile: `./${item.file.replace(/\.[jt]sx?$/, '')}`,
        newFile: `./${item.target.replace(/\.[jt]sx?$/, '')}`
      });
    } catch (err) {
      console.log(`[ERROR]      Failed to rename ${item.file}: ${err.message}`);
      if (fs.existsSync(tmpPath)) {
        try { fs.unlinkSync(tmpPath); } catch(e) {}
      }
    }
  }

  // Update Barrel File (index.ts / index.js)
  if (barrelFile && indexEdits.size > 0) {
    const barrelContent = fs.readFileSync(barrelFile, 'utf-8');
    let barrelAst;
    try {
      barrelAst = parse(barrelContent, { sourceType: 'module', plugins: ['typescript'] });
    } catch (e) {}

    if (barrelAst) {
      const lines = barrelContent.split('\n');
      const edits = [];

      traverse(barrelAst, {
        ExportNamedDeclaration(path) {
          if (!path.node.source) return;
          if (path.node.specifiers.length !== 1) return;
          
          const specifier = path.node.specifiers[0];
          
          if (specifier.local.name !== specifier.exported.name) return;
          
          const oldName = specifier.exported.name;
          const sourceValue = path.node.source.value;
          
          if (indexEdits.has(oldName)) {
            const { newName, newFile } = indexEdits.get(oldName);
            const lineIndex = path.node.loc.start.line - 1;
            const originalLine = lines[lineIndex];
            
            let newLine = originalLine.replace(oldName, newName);
            newLine = newLine.replace(sourceValue, newFile);
            
            edits.push({ lineIndex, newLine });
          }
        }
      });

      if (edits.length > 0) {
        if (isDryRun) {
          console.log(`[INDEX]      Will rewrite ${edits.length} export(s) in ${path.basename(barrelFile)}`);
        } else {
          for (const edit of edits) {
            lines[edit.lineIndex] = edit.newLine;
          }
          fs.writeFileSync(barrelFile, lines.join('\n'), 'utf-8');
          console.log(`[INDEX]      Rewrote ${edits.length} export(s) in ${path.basename(barrelFile)}`);
        }
      }
    }
  }

  results.collision.forEach(c => console.log(`[COLLISION]  ${c.file} (Target ${c.target} already exists)`));
  results.blocked.forEach(b => console.log(`[BLOCKED]    ${b.file} (${b.reason})`));
  results.duplicate.forEach(d => console.log(`[DUPLICATE]  ${d.file} (Shares metadata with another file)`));
  results.unsupported.forEach(u => console.log(`[UNSUPPORTED] ${u.file} (${u.reason})`));
  results.error.forEach(e => console.log(`[ERROR]      ${e.file} (${e.reason})`));

  console.log('-'.repeat(50));
  console.log(`Summary: ${results.rename.length} Rename, ${results.collision.length} Collision, ${results.blocked.length} Blocked, ${results.duplicate.length} Duplicate, ${results.unsupported.length} Unsupported, ${results.keep.length} Keep`);
  if (results.legacy.length > 0) {
    console.log(`⚠️ ${results.legacy.length} legacy files skipped. (No metadata found).`);
  }
  console.log('');
}
