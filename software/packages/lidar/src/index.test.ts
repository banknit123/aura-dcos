import { describe, expect, it } from 'vitest';
import { createLidarManager } from './index';

describe('LidarManager', () => {
  it('discovers LiDAR endpoints and captures point-cloud references', async () => {
    const manager = createLidarManager();
    const lidars = await manager.discover();
    const cloud = await manager.capturePointCloud('roof-lidar');

    expect(lidars).toHaveLength(1);
    expect(cloud.pointCount).toBeGreaterThan(0);
    expect(manager.snapshot().latestClouds).toHaveLength(1);
  });
});
