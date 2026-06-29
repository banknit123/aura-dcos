import { describe, expect, it } from 'vitest';
import { createAuraConfigStore } from './index';

describe('AuraConfigStore', () => {
  it('stores, retrieves and snapshots configuration values', () => {
    const config = createAuraConfigStore({ mode: 'development' });
    config.set('speed', 42);

    expect(config.get('mode')).toBe('development');
    expect(config.get('speed')).toBe(42);
    expect(config.snapshot()).toEqual({ mode: 'development', speed: 42 });
  });

  it('returns fallback values for missing keys', () => {
    const config = createAuraConfigStore();
    expect(config.get('missing', 'fallback')).toBe('fallback');
  });
});
