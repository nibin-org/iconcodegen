import { describe, it, expect, vi } from 'vitest';
import { requireLocalOrigin } from '../bin/cli.js';

describe('CSRF Origin Middleware (Fail-Closed)', () => {
  it('should explicitly reject requests with no Origin or Referer header (403)', () => {
    const req = { headers: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireLocalOrigin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Missing origin' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should explicitly reject requests with a malicious Origin (403)', () => {
    const req = { headers: { origin: 'https://evil.com' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireLocalOrigin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Invalid origin' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() successfully for valid localhost Origin', () => {
    const req = { headers: { origin: 'http://127.0.0.1:3005' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireLocalOrigin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
