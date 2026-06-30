import { describe, expect, it } from 'vitest';
import { createDefaultOutputManager } from './index';

describe('OutputManager', () => {
  it('creates launch plans for default output devices', () => {
    const manager = createDefaultOutputManager();
    const plans = manager.planLaunch('http://localhost:5173/');

    expect(manager.list()).toHaveLength(5);
    expect(plans.find((plan) => plan.role === 'dashboard')?.url).toContain('?output=dashboard');
    expect(plans.find((plan) => plan.role === 'roof')?.fullscreen).toBe(true);
  });
});
