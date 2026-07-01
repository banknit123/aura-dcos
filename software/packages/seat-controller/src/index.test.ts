import { describe, expect, it } from 'vitest';
import { createSeatController } from './index';

describe('SeatController', () => {
  it('applies parked presets and blocks moving presets while driving', async () => {
    const controller = createSeatController();
    controller.savePreset({ id: 'driver-comfort', name: 'Driver Comfort', policy: 'park-only', position: { seatId: 'driver', foreAftMm: 20, heightMm: 5, reclineDeg: 18, lumbarPct: 60 } });
    await expect(controller.applyPreset('driver-comfort', 20)).rejects.toThrow('parked');
    const position = await controller.applyPreset('driver-comfort', 0);
    expect(position.reclineDeg).toBe(18);
  });
});
