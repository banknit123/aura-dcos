import { describe, expect, it } from 'vitest';
import { createAuraLaunchScene, createCinematicGraphicsEngine } from './index';

describe('CinematicGraphicsEngine', () => {
  it('registers surfaces, activates scene and plans frames', () => {
    const engine = createCinematicGraphicsEngine();
    engine.registerSurface({ id: 'display-roof', role: 'roof', width: 3840, height: 1200, refreshRateHz: 60, driverVisible: false });
    engine.registerSurface({ id: 'display-dashboard', role: 'dashboard', width: 1920, height: 720, refreshRateHz: 60, driverVisible: true });
    engine.registerSurface({ id: 'display-projection', role: 'projection', width: 1280, height: 1280, refreshRateHz: 60, driverVisible: true });
    engine.registerScene(createAuraLaunchScene({ roof: 'display-roof', dashboard: 'display-dashboard', projection: 'display-projection' }));

    engine.activate('aura-launch-cinematic');
    const frame = engine.planFrame(1000);

    expect(frame.sceneId).toBe('aura-launch-cinematic');
    expect(frame.surfaces).toHaveLength(3);
    expect(frame.surfaces.find((surface) => surface.surfaceId === 'display-dashboard')?.driverSafe).toBe(true);
  });

  it('blocks driver-visible unsafe effects', () => {
    const engine = createCinematicGraphicsEngine();
    engine.registerSurface({ id: 'dash', role: 'dashboard', width: 1920, height: 720, refreshRateHz: 60, driverVisible: true });
    engine.registerScene({
      id: 'unsafe',
      name: 'Unsafe',
      quality: 'balanced',
      durationMs: 1000,
      effects: [{ id: 'flash', name: 'Flash', fragment: 'flash', uniforms: {}, blendMode: 'screen', safeForDriver: false }],
      particleSystems: [],
      layers: [{ id: 'flash-layer', surfaceId: 'dash', zIndex: 1, opacity: 1, effectId: 'flash' }],
    });
    engine.activate('unsafe');
    expect(engine.planFrame(0).surfaces[0]?.driverSafe).toBe(false);
  });
});
