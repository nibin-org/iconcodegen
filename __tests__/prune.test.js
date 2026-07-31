import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLI_PATH = path.resolve(__dirname, '../bin/cli.js');
const TEST_DIR = path.resolve(__dirname, 'temp-prune-test');
const CONFIG_FILE = path.join(TEST_DIR, 'iconcodegen.json');
const ICONS_DIR = path.join(TEST_DIR, 'icons');
const BARREL_FILE = path.join(ICONS_DIR, 'index.ts');

const runCli = (args) => {
  return new Promise((resolve) => {
    exec(`node ${CLI_PATH} ${args}`, { cwd: TEST_DIR }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
};

describe('iconcodegen prune', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
    if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ savePath: './icons', provider: 'iconify' }));
  });

  afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('should preserve valid exports and manually written invalid exports if they do not match the regex', async () => {
    fs.writeFileSync(path.join(ICONS_DIR, 'ValidIcon.tsx'), '...');
    fs.writeFileSync(path.join(ICONS_DIR, 'ValidIcon2.tsx'), '...');

    const initialBarrel = `
export { ValidIcon } from './ValidIcon';
export { ValidIcon2 } from './ValidIcon2';
export { MissingIcon } from './MissingIcon';
// export { CommentedOut } from './CommentedOut';
export { A, B } from './MissingMulti';
export { Helper } from './Helper';
`.trim();

    fs.writeFileSync(BARREL_FILE, initialBarrel);

    const { stdout, error } = await runCli('prune');
    expect(error).toBeNull();
    expect(stdout).toContain('Removed dangling export: MissingIcon');
    expect(stdout).toContain('Removed dangling export: Helper');
    expect(stdout).toContain('Cleaned up 2 missing export(s)');

    const result = fs.readFileSync(BARREL_FILE, 'utf-8');
    
    // Kept valid icons
    expect(result).toContain("export { ValidIcon } from './ValidIcon';");
    expect(result).toContain("export { ValidIcon2 } from './ValidIcon2';");
    
    // Kept ignored shapes
    expect(result).toContain("// export { CommentedOut } from './CommentedOut';");
    expect(result).toContain("export { A, B } from './MissingMulti';");

    // Pruned standard exports pointing to missing files
    expect(result).not.toContain("export { MissingIcon }");
    expect(result).not.toContain("export { Helper }");
  });

  it('should support --dry-run without modifying the file', async () => {
    fs.writeFileSync(BARREL_FILE, "export { DeletedIcon } from './DeletedIcon';");
    const { stdout, error } = await runCli('prune --dry-run');
    
    expect(error).toBeNull();
    expect(stdout).toContain('[DRY RUN] Would remove dangling export: DeletedIcon');
    expect(stdout).toContain('Found 1 missing export(s) to remove');

    const result = fs.readFileSync(BARREL_FILE, 'utf-8');
    expect(result).toContain("export { DeletedIcon } from './DeletedIcon';"); // File remains unchanged
  });

  it('should report gracefully if barrel is already clean', async () => {
    fs.writeFileSync(BARREL_FILE, "export { ValidIcon } from './ValidIcon';");
    const { stdout, error } = await runCli('prune');
    
    expect(error).toBeNull();
    expect(stdout).toContain('Barrel file is already clean. No dangling exports found.');
  });
});
