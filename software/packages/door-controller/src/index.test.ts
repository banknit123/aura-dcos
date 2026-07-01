import { describe, expect, it } from 'vitest';
import { createDoorController } from './index';

describe('DoorController', () => {
  it('blocks unlock while moving and allows unlock when stopped', async () => {
    const controller = createDoorController();
    await expect(controller.apply({ doorId: 'all', lockState: 'unlocked' }, 20)).rejects.toThrow('moving');
    const states = await controller.apply({ doorId: 'all', lockState: 'unlocked' }, 0);
    expect(states.every((state) => state.lockState === 'unlocked')).toBe(true);
  });
});
