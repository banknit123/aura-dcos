export type CabinMode = 'commute' | 'family' | 'business' | 'relax' | 'entertainment' | 'safety';
export type VehicleState = 'parked' | 'driving';

export interface AuraCabinContext {
  mode: CabinMode;
  vehicleState: VehicleState;
  speedKph: number;
  weather: 'clear' | 'rain' | 'fog';
  occupants: number;
  childPresent: boolean;
}

export interface AuraCabinSnapshot {
  context: AuraCabinContext;
  updatedAt: string;
}

export class AuraDigitalTwin {
  private context: AuraCabinContext;

  constructor(initialContext: AuraCabinContext) {
    this.context = { ...initialContext };
  }

  update(update: Partial<AuraCabinContext>): AuraCabinSnapshot {
    this.context = { ...this.context, ...update };
    return this.snapshot();
  }

  snapshot(): AuraCabinSnapshot {
    return {
      context: { ...this.context },
      updatedAt: new Date().toISOString(),
    };
  }

  riskLevel(): 'normal' | 'elevated' | 'critical' {
    let score = 0;
    if (this.context.vehicleState === 'driving') score += 1;
    if (this.context.speedKph > 60) score += 2;
    if (this.context.weather !== 'clear') score += 1;
    if (this.context.mode === 'safety') score += 3;

    if (score >= 5) return 'critical';
    if (score >= 3) return 'elevated';
    return 'normal';
  }
}

export function createAuraDigitalTwin(initialContext: AuraCabinContext): AuraDigitalTwin {
  return new AuraDigitalTwin(initialContext);
}
