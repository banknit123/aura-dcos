export type GraphicsSurfaceRole = 'dashboard' | 'hud' | 'roof' | 'door' | 'floor' | 'rearCabin' | 'projection' | 'passenger';
export type GraphicsQuality = 'eco' | 'balanced' | 'cinematic' | 'ultra';
export type BlendMode = 'opaque' | 'alpha' | 'additive' | 'screen';
export type TransitionCurve = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cinematic';

export interface GraphicsSurface {
  id: string;
  role: GraphicsSurfaceRole;
  width: number;
  height: number;
  refreshRateHz: number;
  driverVisible: boolean;
}

export interface ShaderEffect {
  id: string;
  name: string;
  fragment: string;
  uniforms: Record<string, number | string | boolean>;
  blendMode: BlendMode;
  safeForDriver: boolean;
}

export interface ParticleSystem {
  id: string;
  name: string;
  maxParticles: number;
  emissionRate: number;
  lifetimeMs: number;
  safeForDriver: boolean;
}

export interface CinematicLayer {
  id: string;
  surfaceId: string;
  zIndex: number;
  opacity: number;
  effectId?: string;
  particleSystemId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CinematicScene {
  id: string;
  name: string;
  quality: GraphicsQuality;
  durationMs: number;
  layers: CinematicLayer[];
  effects: ShaderEffect[];
  particleSystems: ParticleSystem[];
}

export interface SceneTransition {
  fromSceneId: string;
  toSceneId: string;
  durationMs: number;
  curve: TransitionCurve;
}

export interface FramePlan {
  sceneId: string;
  timestampMs: number;
  surfaces: Array<{ surfaceId: string; layers: CinematicLayer[]; estimatedCost: number; driverSafe: boolean }>;
  totalEstimatedCost: number;
  quality: GraphicsQuality;
}

export interface GraphicsEngineSnapshot {
  surfaces: GraphicsSurface[];
  scenes: CinematicScene[];
  activeSceneId?: string;
  messages: string[];
}

function qualityBudget(quality: GraphicsQuality): number {
  return quality === 'eco' ? 120 : quality === 'balanced' ? 240 : quality === 'cinematic' ? 420 : 680;
}

function layerCost(layer: CinematicLayer, scene: CinematicScene): number {
  const effect = scene.effects.find((item) => item.id === layer.effectId);
  const particles = scene.particleSystems.find((item) => item.id === layer.particleSystemId);
  return 10 + (effect ? 40 : 0) + (particles ? Math.ceil(particles.maxParticles / 100) : 0) + Math.ceil(layer.opacity * 10);
}

export class CinematicGraphicsEngine {
  private readonly surfaces = new Map<string, GraphicsSurface>();
  private readonly scenes = new Map<string, CinematicScene>();
  private activeSceneId?: string;

  registerSurface(surface: GraphicsSurface): void {
    if (surface.width <= 0 || surface.height <= 0 || surface.refreshRateHz <= 0) throw new Error(`Invalid graphics surface: ${surface.id}`);
    this.surfaces.set(surface.id, surface);
  }

  registerScene(scene: CinematicScene): void {
    if (scene.durationMs <= 0) throw new Error(`Invalid cinematic scene duration: ${scene.id}`);
    for (const layer of scene.layers) {
      if (!this.surfaces.has(layer.surfaceId)) throw new Error(`Scene layer references unknown surface: ${layer.surfaceId}`);
      if (layer.opacity < 0 || layer.opacity > 1) throw new Error(`Layer opacity must be 0-1: ${layer.id}`);
    }
    this.scenes.set(scene.id, scene);
  }

  activate(sceneId: string): CinematicScene {
    const scene = this.scenes.get(sceneId);
    if (!scene) throw new Error(`Cinematic scene not registered: ${sceneId}`);
    this.activeSceneId = sceneId;
    return scene;
  }

  planFrame(timestampMs: number): FramePlan {
    if (!this.activeSceneId) throw new Error('No active cinematic scene');
    const scene = this.scenes.get(this.activeSceneId) as CinematicScene;
    const surfaces = [...this.surfaces.values()].map((surface) => {
      const layers = scene.layers.filter((layer) => layer.surfaceId === surface.id).sort((a, b) => a.zIndex - b.zIndex);
      const estimatedCost = layers.reduce((total, layer) => total + layerCost(layer, scene), 0);
      const driverSafe = layers.every((layer) => {
        const effect = scene.effects.find((item) => item.id === layer.effectId);
        const particles = scene.particleSystems.find((item) => item.id === layer.particleSystemId);
        return !surface.driverVisible || ((effect?.safeForDriver ?? true) && (particles?.safeForDriver ?? true));
      });
      return { surfaceId: surface.id, layers, estimatedCost, driverSafe };
    });
    const totalEstimatedCost = surfaces.reduce((total, surface) => total + surface.estimatedCost, 0);
    if (totalEstimatedCost > qualityBudget(scene.quality)) throw new Error(`Cinematic scene exceeds ${scene.quality} quality budget`);
    return { sceneId: scene.id, timestampMs, surfaces, totalEstimatedCost, quality: scene.quality };
  }

  transition(transition: SceneTransition): CinematicScene {
    if (transition.durationMs <= 0) throw new Error('Scene transition duration must be positive');
    if (this.activeSceneId !== transition.fromSceneId) throw new Error(`Transition source is not active: ${transition.fromSceneId}`);
    return this.activate(transition.toSceneId);
  }

  snapshot(): GraphicsEngineSnapshot {
    return {
      surfaces: [...this.surfaces.values()],
      scenes: [...this.scenes.values()],
      activeSceneId: this.activeSceneId,
      messages: [`${this.surfaces.size} graphics surfaces registered.`, `${this.scenes.size} cinematic scenes registered.`],
    };
  }
}

export function createCinematicGraphicsEngine(): CinematicGraphicsEngine {
  return new CinematicGraphicsEngine();
}

export function createAuraLaunchScene(surfaceIds: { roof: string; dashboard: string; projection: string }): CinematicScene {
  return {
    id: 'aura-launch-cinematic',
    name: 'AURA Launch Cinematic',
    quality: 'cinematic',
    durationMs: 90000,
    effects: [
      { id: 'aurora-gradient', name: 'Aurora Gradient', fragment: 'aurora-gradient-frag', uniforms: { intensity: 0.75, speed: 0.25 }, blendMode: 'screen', safeForDriver: false },
      { id: 'driver-status-glow', name: 'Driver Status Glow', fragment: 'status-glow-frag', uniforms: { intensity: 0.35 }, blendMode: 'alpha', safeForDriver: true },
    ],
    particleSystems: [
      { id: 'cabin-sparks', name: 'Cabin Light Sparks', maxParticles: 800, emissionRate: 120, lifetimeMs: 3000, safeForDriver: false },
    ],
    layers: [
      { id: 'roof-aurora', surfaceId: surfaceIds.roof, zIndex: 1, opacity: 1, effectId: 'aurora-gradient', particleSystemId: 'cabin-sparks' },
      { id: 'dashboard-status', surfaceId: surfaceIds.dashboard, zIndex: 1, opacity: 0.8, effectId: 'driver-status-glow' },
      { id: 'projection-companion-light', surfaceId: surfaceIds.projection, zIndex: 2, opacity: 0.9, effectId: 'driver-status-glow' },
    ],
  };
}
