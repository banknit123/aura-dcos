import { describe, expect, it } from 'vitest';
import { createDisplayRouter } from './index';

describe('DisplayRouter', () => {
  it('routes a request to an available target', () => {
    const router = createDisplayRouter();
    router.registerTarget({ id: 'dash-one', role: 'dashboard', name: 'Dashboard', available: true });

    const route = router.route({
      id: 'speed-card',
      role: 'dashboard',
      contentType: 'driverCluster',
      priority: 'high',
    });

    expect(route.displayId).toBe('dash-one');
  });
});
