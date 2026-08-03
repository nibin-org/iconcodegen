import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLI_PATH = path.resolve(__dirname, '../bin/cli.js');
const TEST_DIR = path.resolve(__dirname, 'temp-audit-test');
const CONFIG_FILE = path.join(TEST_DIR, 'iconcodegen.json');
const SRC_DIR = path.join(TEST_DIR, 'src');
const ICONS_DIR = path.join(SRC_DIR, 'components/icons');
const COMPONENT_FILE = path.join(SRC_DIR, 'components/Button.tsx');
const DYNAMIC_FILE = path.join(SRC_DIR, 'components/Picker.tsx');

const runCli = (args) => {
  return new Promise((resolve) => {
    exec(`node ${CLI_PATH} ${args}`, { cwd: TEST_DIR }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
};

describe('iconcodegen audit', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
    if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
    if (!fs.existsSync(path.dirname(COMPONENT_FILE))) fs.mkdirSync(path.dirname(COMPONENT_FILE), { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ savePath: './src/components/icons', provider: 'iconify' }));
  });

  afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('should find unused icons based on static analysis', async () => {
    // 1. Create two icons
    fs.writeFileSync(path.join(ICONS_DIR, 'UsedIcon.tsx'), '...');
    fs.writeFileSync(path.join(ICONS_DIR, 'UnusedIcon.tsx'), '...');
    // Create an index file (should be ignored by count)
    fs.writeFileSync(path.join(ICONS_DIR, 'index.ts'), '...');

    // 2. Create a source file that only imports UsedIcon
    const compSrc = `
      import React from 'react';
      import { UsedIcon } from './icons';
      export const Button = () => <UsedIcon />;
    `;
    fs.writeFileSync(COMPONENT_FILE, compSrc);

    // 3. Run audit
    const { stdout, error } = await runCli('audit');
    expect(error).toBeNull();
    
    // Check report
    expect(stdout).toContain('Found 2 total icons');
    expect(stdout).toContain('Found 1 explicitly imported');
    expect(stdout).toContain('1 icons found with no direct static import detected');
    
    // Check that rm command is printed for the unused icon
    expect(stdout).toContain('rm ./src/components/icons/UnusedIcon.tsx');
    expect(stdout).not.toContain('UsedIcon.tsx');
  });

  it('should abort completely if dynamic import is detected', async () => {
    // Inject dynamic import
    fs.writeFileSync(DYNAMIC_FILE, `
      const loadIcon = async () => {
        const Icon = await import('./icons');
      }
    `);

    const { stdout, error } = await runCli('audit');
    expect(error).toBeNull(); // Should exit 0
    expect(stdout).toContain('ABORTED: Dynamic usage detected');
    expect(stdout).toContain('Found a dynamic import (import(...))');
    expect(stdout).toContain('Skipping the unused-icon report');
    
    // Clean up dynamic file for next test
    fs.rmSync(DYNAMIC_FILE);
  });

  it('should abort completely if wildcard import is detected', async () => {
    // Inject wildcard import
    fs.writeFileSync(DYNAMIC_FILE, `
      import * as Icons from './icons';
    `);

    const { stdout, error } = await runCli('audit');
    expect(error).toBeNull();
    expect(stdout).toContain('ABORTED: Dynamic usage detected');
    expect(stdout).toContain('Found a wildcard import (import * as X)');
    expect(stdout).toContain('Skipping the unused-icon report');

    fs.rmSync(DYNAMIC_FILE);
  });
});
