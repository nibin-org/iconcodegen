import { describe, it, expect } from 'vitest';
import { resolveIconName } from '../bin/naming.js';

describe('resolveIconName', () => {
  it('should default to {name}Icon if pattern is not provided', () => {
    expect(resolveIconName('ArrowRight')).toBe('ArrowRightIcon');
    expect(resolveIconName('ArrowRight', undefined)).toBe('ArrowRightIcon');
  });

  it('should support prefixes, suffixes, and exact matches', () => {
    expect(resolveIconName('ArrowRight', '{name}Icon')).toBe('ArrowRightIcon');
    expect(resolveIconName('ArrowRight', 'App{name}')).toBe('AppArrowRight');
    expect(resolveIconName('ArrowRight', '{name}')).toBe('ArrowRight');
  });

  it('should safely prepend Icon if the result starts with a number', () => {
    expect(resolveIconName('ArrowRight', '123{name}')).toBe('Icon123ArrowRight');
  });

  it('should return empty string on completely invalid resolving pattern', () => {
    expect(resolveIconName('ArrowRight', '---')).toBe('');
  });
});
