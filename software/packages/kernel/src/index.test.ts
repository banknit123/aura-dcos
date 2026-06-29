import { describe, expect, it } from 'vitest';
import { createAuraKernel, type AuraModule } from './index';

function module(name: string, events: string[], dependencies: string[] = []): AuraModule {
  return {
    name,
    version: '0.1.0',
    dependencies,
    start() {
      events.push(`start:${name}`);
    },
    stop() {
      events.push(`stop:${name}`);
    },
  };
}

describe('AuraKernel', () => {
  it('starts modules in dependency order and stops in reverse order', async () => {
    const events: string[] = [];
    const kernel = createAuraKernel();

    kernel.register(module('surface-manager', events, ['events']));
    kernel.register(module('events', events));

    await kernel.start();
    await kernel.stop();

    expect(events).toEqual([
      'start:events',
      'start:surface-manager',
      'stop:surface-manager',
      'stop:events',
    ]);
  });

  it('fails when a dependency is missing', async () => {
    const events: string[] = [];
    const kernel = createAuraKernel();
    kernel.register(module('surface-manager', events, ['events']));

    await expect(kernel.start()).rejects.toThrow('Missing dependency');
    expect(kernel.getState()).toBe('failed');
  });
});
