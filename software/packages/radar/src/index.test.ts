import { describe, expect, it } from 'vitest';
import { createRadarManager } from './index';

describe('RadarManager', () => {
  it('discovers radar endpoints and reads object frames', async () => {
    const manager = createRadarManager();
    const radars = await manager.discover();
    const frame = await manager.readObjects('front-radar');

    expect(radars).toHaveLength(1);
    expect(frame.objects[0]?.class).toBe('vehicle');
    expect(manager.snapshot().latestFrames).toHaveLength(1);
  });
});
