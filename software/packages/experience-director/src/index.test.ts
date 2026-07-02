import { describe, expect, it } from 'vitest';
import {
  createAuraExperienceDirector,
  createAuraExperienceEngine,
  createAuraSurfaceSynchronizationEngine,
  createAuraThemeTransitionEngine,
  defaultAuraExperienceTimeline,
} from './index';

describe('AuraExperienceDirector', () => {
  it('starts the default AURA experience on the first scene', () => {
    const director = createAuraExperienceDirector();
    const state = director.start();

    expect(state.status).toBe('running');
    expect(state.scene.id).toBe('theme-familyGlow');
    expect(state.events[0]?.type).toBe('experience.started');
  });

  it('advances to the next scene', () => {
    const director = createAuraExperienceDirector();
    director.start();
    const state = director.next();

    expect(state.scene.id).toBe('theme-oceanSerenity');
    expect(state.sceneIndex).toBe(1);
  });

  it('auto-advances when ticking past scene duration', () => {
    const director = createAuraExperienceDirector();
    director.start();
    const state = director.tick(defaultAuraExperienceTimeline[0].durationMs + 100);

    expect(state.scene.id).toBe('theme-oceanSerenity');
    expect(state.elapsedMs).toBe(100);
  });

  it('supports jumping to a named scene', () => {
    const director = createAuraExperienceDirector();
    const state = director.goTo('theme-rainSafety');

    expect(state.scene.kind).toBe('theme');
    expect(state.scene.theme).toBe('rainSafety');
  });
});

describe('Studio v2 Sprint 3 Experience Engine', () => {
  it('registers all production themes required for Sprint 3', () => {
    const engine = createAuraExperienceEngine();
    const ids = engine.listThemes().map((theme) => theme.id);

    expect(ids).toContain('oceanSerenity');
    expect(ids).toContain('galaxyLounge');
    expect(ids).toContain('forestRetreat');
    expect(ids).toContain('cinemaMode');
    expect(ids).toContain('productivityMode');
    expect(ids).toContain('familyAdventure');
    expect(ids).toContain('wellnessMode');
    expect(ids).toContain('nightDrive');
  });

  it('creates live preview data with transition and synchronized surfaces', () => {
    const engine = createAuraExperienceEngine();
    const preview = engine.preview('wellnessMode', { vehicleState: 'parked', speedKph: 0 });

    expect(preview.theme.name).toBe('Wellness Mode');
    expect(preview.timeline).toHaveLength(1);
    expect(preview.transition.toThemeId).toBe('wellnessMode');
    expect(preview.synchronization.surfaces.length).toBeGreaterThanOrEqual(5);
  });

  it('protects driver-visible surfaces for passenger-only themes while driving', () => {
    const sync = createAuraSurfaceSynchronizationEngine();
    const plan = sync.synchronize('cinemaMode', {
      mode: 'commute',
      vehicleState: 'driving',
      speedKph: 52,
      weather: 'clear',
      occupants: 2,
      childPresent: false,
      driverAttention: 'mediumLoad',
    });

    expect(plan.safeForDriver).toBe(false);
    expect(plan.surfaces.find((surface) => surface.surfaceId === 'dashboard')?.state).toBe('ambient');
  });

  it('uses safety-cut transitions when unsafe themes are requested while driving', () => {
    const transitions = createAuraThemeTransitionEngine();
    const plan = transitions.plan('nightDrive', 'galaxyLounge', 'driving');

    expect(plan.easing).toBe('safetyCut');
    expect(plan.safetyNotes[0]).toContain('passenger-only');
  });
});
