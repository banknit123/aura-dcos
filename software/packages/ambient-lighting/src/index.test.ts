import { describe, expect, it } from 'vitest';
import { createAmbientLightingController } from './index';

describe('AmbientLightingController', () => {
  it('applies lighting scene commands', async () => {
    const controller = createAmbientLightingController();
    const states = await controller.apply({ zone: 'all', scene: 'nightCity', brightnessPct: 30 });
    expect(states.every((state) => state.scene === 'nightCity')).toBe(true);
  });

  it('rejects invalid brightness', async () => {
    const controller = createAmbientLightingController();
    await expect(controller.apply({ zone: 'dashboard', brightnessPct: 150 })).rejects.toThrow('Brightness');
  });
});
