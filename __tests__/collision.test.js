import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLI_PATH = path.resolve(__dirname, '../bin/cli.js');
const TEST_DIR = path.resolve(__dirname, 'temp-collision-test');
const CONFIG_FILE = path.join(TEST_DIR, 'iconcodegen.json');
const ICONS_DIR = path.join(TEST_DIR, 'icons');
const BARREL_FILE = path.join(ICONS_DIR, 'index.js'); // Assuming js for simplicity

describe('Collision Overwrite Behavior', () => {
  let cliProcess;

  beforeAll(async () => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ savePath: './icons', provider: 'iconify', iconNamePattern: '{name}Icon' }));
    
    // Start server
    cliProcess = exec(`node ${CLI_PATH} --headless -p 4005`, { cwd: TEST_DIR });
    
    // Wait for server to boot
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(() => {
    if (cliProcess) cliProcess.kill();
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('should overwrite physical files but silently skip barrel duplicates on collision', async () => {
    // 1. Download first icon (lucide:arrow-right)
    const res1 = await fetch('http://127.0.0.1:4005/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://127.0.0.1:4005' },
      body: JSON.stringify({ icon_id: 'lucide:arrow-right', customizations: { language: 'js', exportStyle: 'arrow' } })
    });
    expect(res1.status).toBe(200);

    const firstFileContent = fs.readFileSync(path.join(ICONS_DIR, 'ArrowRightIcon.jsx'), 'utf-8');
    const firstBarrelContent = fs.readFileSync(BARREL_FILE, 'utf-8');

    // 2. Download completely different icon but with same baseName (ph:arrow-right)
    const res2 = await fetch('http://127.0.0.1:4005/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://127.0.0.1:4005' },
      body: JSON.stringify({ icon_id: 'ph:arrow-right', customizations: { language: 'js', exportStyle: 'arrow' } })
    });
    expect(res2.status).toBe(200);

    const secondFileContent = fs.readFileSync(path.join(ICONS_DIR, 'ArrowRightIcon.jsx'), 'utf-8');
    const secondBarrelContent = fs.readFileSync(BARREL_FILE, 'utf-8');

    // Verification 1: File must be overwritten (physically changed)
    expect(firstFileContent).not.toEqual(secondFileContent);

    // Verification 2: Barrel file must remain completely unchanged (duplicate skipped)
    expect(firstBarrelContent).toEqual(secondBarrelContent);
    expect(firstBarrelContent.split('\n').filter(line => line.includes('export { ArrowRightIcon }')).length).toBe(1);
  });
});
