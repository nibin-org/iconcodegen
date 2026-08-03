import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runSync } from '../bin/sync.js';

vi.mock('fs');

describe('Sync Engine Phase 2', () => {
  const cwd = '/mock/cwd';
  const savePath = '/mock/cwd/src/icons';
  const config = { savePath: './src/icons', iconNamePattern: 'Prefix{name}Icon' };

  let logs = [];
  const originalConsoleLog = console.log;

  beforeEach(() => {
    vi.clearAllMocks();
    logs = [];
    console.log = (...args) => logs.push(args.join(' '));
    fs.existsSync.mockReturnValue(true); // Directory exists
    fs.readdirSync.mockReturnValue([]);
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  // Helper to mock the fast-fail stream read
  function mockFile(filename, content, barrelContent = null) {
    const files = barrelContent ? [filename, 'index.ts'] : [filename];
    fs.readdirSync.mockReturnValue(files);
    
    fs.readFileSync.mockImplementation((p) => {
      if (p.endsWith(filename)) return content;
      if (barrelContent && p.endsWith('index.ts')) return barrelContent;
      return '';
    });
    fs.existsSync.mockImplementation((p) => {
      if (p === savePath) return true;
      if (barrelContent && p.endsWith('index.ts')) return true;
      return false;
    });
  }

  it('should rename a valid generated file (Arrow Function) and update index.ts surgically', () => {
    const code = `
// @iconcodegen-source: iconify:lucide:activity
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY.
import * as React from "react";
export const ActivityIcon = (props) => <svg {...props} />;
`;
    const barrel = `export { ArrowIcon } from './ArrowIcon';
export { ActivityIcon } from './ActivityIcon';  // <- this one gets renamed
export { Helper } from './Helper';
// export { Old } from './Old';
export { A, B } from './MissingMulti';`;

    mockFile('ActivityIcon.tsx', code, barrel);
    
    runSync(config, cwd, false, false);
    
    // Check ast rewriting via temp file
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    const [tmpPath, tmpContent] = fs.writeFileSync.mock.calls[0];
    expect(tmpPath).toMatch(/PrefixActivityIcon\.tsx\.\d+\.tmp/);
    expect(tmpContent).toContain('export const PrefixActivityIcon = (props) =>');
    
    // Check index.ts update
    const [indexPath, indexContent] = fs.writeFileSync.mock.calls[1];
    expect(indexPath).toBe(path.join(savePath, 'index.ts'));
    
    const expectedBarrel = `export { ArrowIcon } from './ArrowIcon';
export { PrefixActivityIcon } from './PrefixActivityIcon';  // <- this one gets renamed
export { Helper } from './Helper';
// export { Old } from './Old';
export { A, B } from './MissingMulti';`;
    
    expect(indexContent).toBe(expectedBarrel);
    
    // Atomic rename sequence
    expect(fs.renameSync).toHaveBeenCalledWith(tmpPath, path.join(savePath, 'PrefixActivityIcon.tsx'));
    expect(fs.unlinkSync).toHaveBeenCalledWith(path.join(savePath, 'ActivityIcon.tsx'));
    
    expect(logs.some(l => l.includes('[RENAME]     ActivityIcon.tsx → PrefixActivityIcon.tsx'))).toBe(true);
    expect(logs.some(l => l.includes('[INDEX]      Rewrote 1 export(s) in index.ts'))).toBe(true);
  });

  it('should safely abort if the file has multiple exports [UNSUPPORTED]', () => {
    const code = `
// @iconcodegen-source: iconify:lucide:activity
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY.
import * as React from "react";
export const ActivityIcon = (props) => <svg {...props} />;
export const Helper = () => null;
`;
    mockFile('Activity.tsx', code);
    
    runSync(config, cwd, false, false);
    
    expect(fs.renameSync).not.toHaveBeenCalled();
    expect(logs.some(l => l.includes('[UNSUPPORTED] Activity.tsx (Invalid semantic structure'))).toBe(true);
  });

  it('should safely abort if the file is missing the banner [UNSUPPORTED]', () => {
    const code = `
// @iconcodegen-source: iconify:lucide:activity
import * as React from "react";
export const ActivityIcon = (props) => <svg {...props} />;
`;
    mockFile('Activity.tsx', code);
    
    runSync(config, cwd, false, false);
    
    expect(fs.renameSync).not.toHaveBeenCalled();
    expect(logs.some(l => l.includes('[UNSUPPORTED] Activity.tsx (Missing AUTO-GENERATED banner)'))).toBe(true);
  });

  it('should ignore files without metadata [LEGACY]', () => {
    const code = `
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY.
import * as React from "react";
export const ActivityIcon = (props) => <svg {...props} />;
`;
    mockFile('Activity.tsx', code);
    
    runSync(config, cwd, false, false);
    
    expect(fs.renameSync).not.toHaveBeenCalled();
    expect(logs.some(l => l.includes('1 legacy files skipped'))).toBe(true);
  });

  it('should abort rename if an aliased export exists in index.ts [BLOCKED]', () => {
    const code = `
// @iconcodegen-source: iconify:lucide:activity
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY.
import * as React from "react";
export const ActivityIcon = (props) => <svg {...props} />;
`;
    // index.ts contains an aliased export for ActivityIcon
    const barrel = `export { ActivityIcon as AliasedActivity } from './OldActivity';`;
    mockFile('OldActivity.tsx', code, barrel);
    
    runSync(config, cwd, false, false);
    
    // No disk mutations should happen
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(fs.renameSync).not.toHaveBeenCalled();
    
    expect(logs.some(l => l.includes('[BLOCKED]    OldActivity.tsx (Manual or aliased export reference found in index.ts)'))).toBe(true);
  });

  it('should handle collisions gracefully [COLLISION]', () => {
    const code = `
// @iconcodegen-source: iconify:lucide:activity
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY.
import * as React from "react";
export const ActivityIcon = (props) => <svg {...props} />;
`;
    fs.readdirSync.mockReturnValueOnce(['OldActivity.tsx']).mockReturnValueOnce(['OldActivity.tsx']);
    fs.openSync.mockReturnValue(1);
    fs.readSync.mockImplementation((fd, buffer) => {
      const b = Buffer.from(code);
      b.copy(buffer);
      return b.length;
    });
    fs.readFileSync.mockReturnValue(code);
    
    fs.existsSync.mockImplementation((p) => {
      if (p === savePath) return true;
      if (p.includes('PrefixActivityIcon.tsx')) return true;
      return false;
    });

    runSync(config, cwd, false, false);

    expect(fs.writeFileSync).not.toHaveBeenCalled(); // No writes!
    expect(fs.renameSync).not.toHaveBeenCalled();
    expect(logs.some(l => l.includes('[COLLISION]  OldActivity.tsx'))).toBe(true);
  });

  it('should flag the second identical metadata as duplicate [DUPLICATE]', () => {
    const code = `
// @iconcodegen-source: iconify:lucide:activity
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY.
import * as React from "react";
export const ActivityIcon = (props) => <svg {...props} />;
`;
    fs.readdirSync.mockReturnValueOnce(['One.tsx', 'Two.tsx']).mockReturnValueOnce(['One.tsx', 'Two.tsx']);
    fs.openSync.mockReturnValue(1);
    fs.readSync.mockImplementation((fd, buffer) => {
      const b = Buffer.from(code);
      b.copy(buffer);
      return b.length;
    });
    fs.readFileSync.mockReturnValue(code);
    fs.existsSync.mockImplementation((p) => p === savePath);

    runSync(config, cwd, false, false);

    // First one gets renamed
    expect(logs.some(l => l.includes('[RENAME]     One.tsx → PrefixActivityIcon.tsx'))).toBe(true);
    // Second one is duplicate
    expect(logs.some(l => l.includes('[DUPLICATE]  Two.tsx (Shares metadata'))).toBe(true);
    // Only one write/rename should have occurred
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it('should preview changes without mutating in --dry-run mode', () => {
    const code = `
// @iconcodegen-source: iconify:lucide:activity
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT IT MANUALLY.
import * as React from "react";
export const ActivityIcon = (props) => <svg {...props} />;
`;
    mockFile('OldActivity.tsx', code);
    
    runSync(config, cwd, true, false); // isDryRun = true
    
    // No disk mutations
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(fs.renameSync).not.toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
    
    expect(logs.some(l => l.includes('[RENAME]     OldActivity.tsx → PrefixActivityIcon.tsx'))).toBe(true);
    expect(logs.some(l => l.includes('(DRY RUN)'))).toBe(true);
  });

});
