import { describe, expect, it } from 'vitest';
import { createOtaUpdateManager } from './index';

describe('OtaUpdateManager', () => {
  it('prepares and installs verified packages when parked', async () => {
    const manager = createOtaUpdateManager();
    manager.addCampaign({ id: 'camp-1', package: { id: 'pkg-1', version: '1.0.1', target: 'aura', sizeBytes: 100, signature: 'sim-signed:abc' }, state: 'available', progressPct: 0 });
    await manager.prepare('camp-1');
    const installed = await manager.install('camp-1', 0);
    expect(installed.state).toBe('installed');
  });

  it('blocks install while moving', async () => {
    const manager = createOtaUpdateManager();
    manager.addCampaign({ id: 'camp-2', package: { id: 'pkg-2', version: '1.0.2', target: 'aura', sizeBytes: 100, signature: 'sim-signed:abc' }, state: 'available', progressPct: 0 });
    await expect(manager.install('camp-2', 10)).rejects.toThrow('parked');
  });
});
