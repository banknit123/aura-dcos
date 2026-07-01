import { describe, expect, it } from 'vitest';
import { createWindowController } from './index';

describe('WindowController', () => {
  it('moves windows within supported range', async () => {
    const controller = createWindowController();
    const states = await controller.move({ windowId: 'driver', positionPct: 50 });
    expect(states.find((state) => state.windowId === 'driver')?.positionPct).toBe(50);
  });

  it('rejects invalid window position', async () => {
    const controller = createWindowController();
    await expect(controller.move({ windowId: 'driver', positionPct: 150 })).rejects.toThrow('between 0 and 100');
  });
});
