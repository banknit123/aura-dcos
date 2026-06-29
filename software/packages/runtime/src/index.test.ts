import { describe, expect, it } from 'vitest';
import { createAuraContainer, createAuraServiceRegistry } from './index';

describe('AuraServiceRegistry', () => {
  it('registers and resolves services', () => {
    const registry = createAuraServiceRegistry();
    registry.register('logger', { name: 'logger' });

    expect(registry.has('logger')).toBe(true);
    expect(registry.resolve<{ name: string }>('logger').name).toBe('logger');
    expect(registry.list()).toEqual(['logger']);
  });
});

describe('AuraContainer', () => {
  it('creates singleton service instances from factories', () => {
    const container = createAuraContainer();
    container.bind('counter', () => ({ createdAt: Date.now() }));

    const first = container.get<{ createdAt: number }>('counter');
    const second = container.get<{ createdAt: number }>('counter');

    expect(first).toBe(second);
  });
});
