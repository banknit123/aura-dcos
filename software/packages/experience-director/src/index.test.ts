import { describe, expect, it } from 'vitest';
import { createAuraExperienceDirector, defaultAuraExperienceTimeline } from './index';

describe('AuraExperienceDirector', () => {
  it('starts the default AURA experience on the first scene', () => {
    const director = createAuraExperienceDirector();
    const state = director.start();

    expect(state.status).toBe('running');
    expect(state.scene.id).toBe('welcome-awakening');
    expect(state.events[0]?.type).toBe('experience.started');
  });

  it('advances to the next scene', () => {
    const director = createAuraExperienceDirector();
    director.start();
    const state = director.next();

    expect(state.scene.id).toBe('commute-intelligence');
    expect(state.sceneIndex).toBe(1);
  });

  it('auto-advances when ticking past scene duration', () => {
    const director = createAuraExperienceDirector();
    director.start();
    const state = director.tick(defaultAuraExperienceTimeline[0].durationMs + 100);

    expect(state.scene.id).toBe('commute-intelligence');
    expect(state.elapsedMs).toBe(100);
  });

  it('supports jumping to a named scene', () => {
    const director = createAuraExperienceDirector();
    const state = director.goTo('rain-safety');

    expect(state.scene.kind).toBe('safety');
    expect(state.scene.theme).toBe('rainSafety');
  });
});
