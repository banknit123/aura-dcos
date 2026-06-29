export type SurfaceKind = 'dashboard' | 'windshield' | 'roof' | 'floor' | 'door' | 'console' | 'rearCabin' | 'projection';
export type SurfacePriority = 'low' | 'medium' | 'high' | 'critical';
export type SurfaceState = 'off' | 'ambient' | 'informative' | 'interactive' | 'emergency';

export interface AuraSurface {
  id: string;
  name: string;
  kind: SurfaceKind;
  priority: SurfacePriority;
  state: SurfaceState;
  energy: number;
  visibleToDriver: boolean;
}

export interface SurfaceUpdate {
  state?: SurfaceState;
  energy?: number;
  priority?: SurfacePriority;
}

function normaliseEnergy(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

export class AuraSurfaceRegistry {
  private surfaces = new Map<string, AuraSurface>();

  register(surface: AuraSurface): void {
    if (this.surfaces.has(surface.id)) {
      throw new Error(`Surface already registered: ${surface.id}`);
    }
    this.surfaces.set(surface.id, { ...surface, energy: normaliseEnergy(surface.energy) });
  }

  update(id: string, update: SurfaceUpdate): AuraSurface {
    const existing = this.get(id);
    const next: AuraSurface = {
      ...existing,
      ...update,
      energy: update.energy === undefined ? existing.energy : normaliseEnergy(update.energy),
    };
    this.surfaces.set(id, next);
    return next;
  }

  get(id: string): AuraSurface {
    const surface = this.surfaces.get(id);
    if (!surface) throw new Error(`Surface not registered: ${id}`);
    return surface;
  }

  list(): AuraSurface[] {
    return [...this.surfaces.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  setGlobalEnergy(energy: number): void {
    for (const surface of this.surfaces.values()) {
      this.update(surface.id, { energy });
    }
  }
}

export function createAuraSurfaceRegistry(): AuraSurfaceRegistry {
  return new AuraSurfaceRegistry();
}
