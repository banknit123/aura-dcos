import { describe, expect, it } from 'vitest';
import { createAuraBrain } from './index';

describe('AuraBrain', () => {
  it('blocks entertainment and disables projection during critical state', () => {
    const brain = createAuraBrain();
    const decision = brain.decide({
      intent: 'emergency',
      risk: 'critical',
      driverAttention: 'critical',
      vehicleState: 'driving',
      childPresent: false,
      availableSurfaces: ['dashboard', 'projection', 'roof'],
    });

    expect(decision.risk).toBe('critical');
    expect(decision.actions.some((action) => action.target === 'projection' && action.value === 'off')).toBe(true);
    expect(decision.blockedActions.some((action) => action.target === 'roof' && action.value === 'entertainment')).toBe(true);
  });

  it('blocks dashboard entertainment while driving', () => {
    const brain = createAuraBrain();
    const decision = brain.decide({
      intent: 'entertain',
      risk: 'normal',
      driverAttention: 'lowLoad',
      vehicleState: 'driving',
      childPresent: true,
      availableSurfaces: ['dashboard', 'roof', 'rearCabin'],
    });

    expect(decision.blockedActions.some((action) => action.target === 'dashboard')).toBe(true);
  });
});
