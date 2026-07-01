import { describe, expect, it } from 'vitest';
import { createAuraCinematicEngine } from './index';

describe('AuraCinematicEngine', () => {
  it('renders a cinematic plan for a requested theme and surface', () => {
    const engine = createAuraCinematicEngine();
    const plan = engine.render({
      theme: 'oceanSerenity',
      surfaceRole: 'roof',
      vehicleState: 'parked',
      speedKph: 0,
      weather: 'clear',
      driverAttention: 'parked',
      childPresent: true,
      risk: 'normal',
    });

    expect(plan.theme.id).toBe('oceanSerenity');
    expect(plan.cssClass).toContain('cinematic-oceanSerenity');
    expect(plan.brightness).toBeGreaterThan(0);
  });

  it('forces Rain Safety visuals during critical risk', () => {
    const engine = createAuraCinematicEngine();
    const plan = engine.render({
      theme: 'galaxyLounge',
      surfaceRole: 'dashboard',
      vehicleState: 'driving',
      speedKph: 85,
      weather: 'rain',
      driverAttention: 'critical',
      childPresent: false,
      risk: 'critical',
    });

    expect(plan.theme.id).toBe('rainSafety');
    expect(plan.motion).toBe('none');
    expect(plan.notes.some((note) => note.includes('Critical risk'))).toBe(true);
  });

  it('flags unsafe high-motion driver-visible themes while driving', () => {
    const engine = createAuraCinematicEngine();
    const plan = engine.render({
      theme: 'neonCity',
      surfaceRole: 'dashboard',
      vehicleState: 'driving',
      speedKph: 40,
      weather: 'clear',
      driverAttention: 'mediumLoad',
      childPresent: false,
      risk: 'normal',
    });

    expect(plan.safeForDriver).toBe(false);
    expect(plan.notes.length).toBeGreaterThan(0);
  });
});
