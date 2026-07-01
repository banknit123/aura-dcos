import { describe, expect, it } from 'vitest';
import { createVehicleIntegrationStudioModel } from './index';

describe('VehicleIntegrationStudioModel', () => {
  it('creates default integration panels', () => {
    const model = createVehicleIntegrationStudioModel();
    const snapshot = model.snapshot();
    expect(snapshot.panels).toHaveLength(7);
    expect(model.panel('signals').title).toBe('Signal Watch');
    expect(snapshot.ready).toBe(true);
  });
});
