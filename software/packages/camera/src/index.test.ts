import { describe, expect, it } from 'vitest';
import { createCameraManager } from './index';

describe('CameraManager', () => {
  it('discovers cameras and captures frame references', async () => {
    const manager = createCameraManager();
    const cameras = await manager.discover();
    const frame = await manager.capture('front-camera');

    expect(cameras).toHaveLength(2);
    expect(frame.cameraId).toBe('front-camera');
    expect(manager.snapshot().lastFrames).toHaveLength(1);
  });
});
