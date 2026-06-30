import { describe, expect, it } from 'vitest';
import { createCabinSyncStore } from './index';

describe('CabinSyncStore', () => {
  it('updates state and increments version', async () => {
    const store = createCabinSyncStore({ scene: 'welcome', speed: 0 });
    const versions: number[] = [];

    store.listen((_state, version) => versions.push(version));
    const snapshot = await store.update({ speed: 50 });

    expect(snapshot.version).toBe(1);
    expect(snapshot.state.speed).toBe(50);
    expect(versions).toEqual([1]);
  });
});
