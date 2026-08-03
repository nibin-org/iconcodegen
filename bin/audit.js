import fs from 'fs';
import path from 'path';
import * as parser from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default || traverseModule;

// Simple recursive directory walker
export function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.')) {
        walkDir(path.join(dir, file), fileList);
      }
    } else {
      if (/\.(js|jsx|ts|tsx)$/.test(file)) {
        fileList.push(path.join(dir, file));
      }
    }
  }
  return fileList;
}

export function runAudit(config, cwd, isDryRun, targetDir = './src') {
  const savePath = path.resolve(cwd, config.savePath);
  const searchDir = path.resolve(cwd, targetDir);
  
  if (!fs.existsSync(searchDir)) {
    console.error(`❌ Target directory not found: ${targetDir}`);
    process.exit(1);
  }

  // To match imports effectively, we look for parts of the savePath.
  // We'll use the basename of the savePath as a naive check, but ideally
  // we check if the import path ends with the save path's trailing parts.
  const savePathParts = config.savePath.replace(/^\.\/?/, '').split('/');
  // We will just look for the last part to be somewhat flexible with aliases (e.g. @/components/icons)
  // But a more robust way is to just let the user know we're checking strings containing it.
  const targetFolder = savePathParts[savePathParts.length - 1];

  console.log(`\n🔍 Scanning ${targetDir} for imported icons...`);

  const allFiles = walkDir(searchDir);
  
  let hasDynamicOrWildcard = false;
  let abortFile = null;
  let abortReason = null;
  const usedIcons = new Set();

  for (const file of allFiles) {
    // Skip the barrel file and generated icons themselves
    if (file.startsWith(savePath)) continue;

    const content = fs.readFileSync(file, 'utf-8');
    let ast;
    try {
      ast = parser.parse(content, { 
        sourceType: 'module', 
        plugins: ['jsx', 'typescript'] 
      });
    } catch (e) {
      // Skip files that fail to parse
      continue;
    }

    traverse(ast, {
      ImportDeclaration(p) {
        if (p.node.source.value.includes(targetFolder)) {
          for (const spec of p.node.specifiers) {
            if (spec.type === 'ImportNamespaceSpecifier') {
              hasDynamicOrWildcard = true;
              abortFile = file;
              abortReason = 'wildcard import (import * as X)';
              p.stop();
            } else if (spec.type === 'ImportSpecifier') {
              usedIcons.add(spec.imported.name);
            }
          }
        }
      },
      ImportExpression(p) {
        if (p.node.source.type === 'StringLiteral' && p.node.source.value.includes(targetFolder)) {
          hasDynamicOrWildcard = true;
          abortFile = file;
          abortReason = 'dynamic import (import(...))';
          p.stop();
        } else if (p.node.source.type === 'TemplateLiteral') {
          const hasPath = p.node.source.quasis.some(q => q.value.raw.includes(targetFolder));
          if (hasPath) {
            hasDynamicOrWildcard = true;
            abortFile = file;
            abortReason = 'dynamic import (import(...))';
            p.stop();
          }
        }
      }
    });

    if (hasDynamicOrWildcard) break;
  }

  if (hasDynamicOrWildcard) {
    console.log(`\n⚠️  ABORTED: Dynamic usage detected.`);
    const relFile = path.relative(cwd, abortFile);
    console.log(`Found a ${abortReason} in: ./${relFile}\n`);
    console.log(`This project uses dynamic or wildcard icon selection, which this scanner cannot\nanalyze safely.\n`);
    console.log(`Audit results would be unreliable and could suggest deleting icons that are\nactually in use. Skipping the unused-icon report for this project.`);
    process.exit(0);
  }

  // Diff against physical files
  let generatedIcons = [];
  if (fs.existsSync(savePath)) {
    generatedIcons = fs.readdirSync(savePath)
      .filter(f => f !== 'index.ts' && f !== 'index.js' && /\.(tsx|jsx|ts|js)$/.test(f))
      .map(f => f.replace(/\.(tsx|jsx|ts|js)$/, ''));
  }

  console.log(`📦 Found ${generatedIcons.length} total icons in ${config.savePath}`);
  
  const unused = generatedIcons.filter(icon => !usedIcons.has(icon));
  const validUsedCount = generatedIcons.length - unused.length;

  console.log(`✅ Found ${validUsedCount} explicitly imported in your code.`);

  if (unused.length === 0) {
    console.log(`\n✨ Perfect! No unused icons found.`);
    process.exit(0);
  }

  console.log(`\n⚠️  ${unused.length} icons found with no direct static import detected.`);
  console.log(`Please verify manually before removing, especially if you use dynamic selection.\n`);
  
  console.log(`  ⚠️  IMPORTANT: This scanner only matches import paths containing the`);
  console.log(`  literal string "${targetFolder}" (e.g. '@/components/${targetFolder}', '../${targetFolder}'). If`);
  console.log(`  your project imports icons through an alias that does NOT contain`);
  console.log(`  that word (e.g. '@/ui/svg-pack'), this tool cannot see those imports`);
  console.log(`  and WILL incorrectly list those icons as unused. If you use custom`);
  console.log(`  path aliases, verify manually — do not trust this report blindly.\n`);
  
  console.log(`[LIMITATIONS] The scanner ONLY detects static named imports:`);
  console.log(`  ✅ Detects: import { ArrowIcon } from '@/icons'`);
  console.log(`  ❌ Ignores: import * as Icons from '@/icons' (Wildcards)`);
  console.log(`  ❌ Ignores: import(iconName) (Dynamic Imports)`);
  console.log(`  ❌ Ignores: Re-exported barrel chains across monorepo boundaries\n`);

  console.log(`To manually remove these ${unused.length} potentially unused icons, review and run:\n`);
  
  const rmArgs = unused.map(icon => `${config.savePath}/${icon}.tsx`).join(' \\\n     ');
  console.log(`  rm ${rmArgs}\n`);
  console.log(`(Tip: Run \`npx iconcodegen prune\` afterward to clean up index.ts)`);

  process.exit(0);
}
