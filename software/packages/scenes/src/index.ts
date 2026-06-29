export interface SceneStep {
  target: string;
  action: string;
  delayMs: number;
  durationMs: number;
  payload?: Record<string, string | number | boolean>;
}

export interface SceneDefinition {
  id: string;
  name: string;
  description: string;
  steps: SceneStep[];
}

export class SceneEngine {
  private readonly scenes = new Map<string, SceneDefinition>();

  register(scene: SceneDefinition): void {
    if (this.scenes.has(scene.id)) {
      throw new Error(`Scene already registered: ${scene.id}`);
    }
    this.scenes.set(scene.id, scene);
  }

  get(sceneId: string): SceneDefinition {
    const scene = this.scenes.get(sceneId);
    if (!scene) throw new Error(`Scene not registered: ${sceneId}`);
    return scene;
  }

  list(): SceneDefinition[] {
    return [...this.scenes.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  plan(sceneId: string): SceneStep[] {
    return [...this.get(sceneId).steps].sort((a, b) => a.delayMs - b.delayMs);
  }
}

export function createSceneEngine(): SceneEngine {
  return new SceneEngine();
}
