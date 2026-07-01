import { describe, expect, it } from 'vitest';
import { createHvacController } from './index';

describe('HvacController', () => {
  it('applies safe cabin temperature commands', async () => {
    const controller = createHvacController();
    const state = await controller.apply({ zone: 'driver', temperatureC: 23, fanLevel: 3 });
    expect(state.temperatureC).toBe(23);
    expect(state.fanLevel).toBe(3);
  });

  it('rejects unsafe temperature requests', async () => {
    const controller = createHvacController();
    await expect(controller.apply({ zone: 'driver', temperatureC: 45 })).rejects.toThrow('safe cabin range');
  });
});
