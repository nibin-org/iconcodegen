import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLI_PATH = path.resolve(__dirname, '../bin/cli.js');
const TEST_DIR = path.resolve(__dirname, 'temp-config-test');
const CONFIG_FILE = path.join(TEST_DIR, 'iconcodegen.json');

describe('CLI Startup Config Validation', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  const runCli = (configObj) => {
    return new Promise((resolve) => {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(configObj));
      // Run the CLI script with node. We use timeout to stop it if it boots successfully.
      exec(`timeout 1 node ${CLI_PATH}`, { cwd: TEST_DIR }, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      });
    });
  };

  it('should reject pattern missing the {name} token (static collision)', async () => {
    const { error, stderr } = await runCli({ savePath: './icons', provider: 'iconify', iconNamePattern: 'StaticName' });
    expect(error).not.toBeNull();
    expect(stderr).toContain('must contain the "{name}" token');
  });

  it('should fallback securely to default `{name}Icon` if no config field exists', async () => {
    // If it succeeds, it boots up the express server, then gets killed by timeout, which yields code 124 in bash.
    // Node exec will return an error object with code 124 for timeout, but NO stderr for our config error.
    const { stderr } = await runCli({ savePath: './icons', provider: 'iconify' });
    expect(stderr).not.toContain('Invalid iconNamePattern');
  });
});
