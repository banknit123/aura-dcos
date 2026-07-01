import { describe, expect, it } from 'vitest';
import { createAudioAmplifierController } from './index';

describe('AudioAmplifierController', () => {
  it('applies voice ducking to all zones', async () => {
    const controller = createAudioAmplifierController();
    const states = await controller.apply({ zone: 'all', voiceDuckingPct: 70 });
    expect(states.every((state) => state.voiceDuckingPct === 70)).toBe(true);
  });

  it('rejects unsafe gain values', async () => {
    const controller = createAudioAmplifierController();
    await expect(controller.apply({ zone: 'driver', gainDb: 30 })).rejects.toThrow('gain');
  });
});
