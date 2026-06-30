import { type VehicleSignal, type VehicleSignalKind } from '@aura-dcos/integrations';

export type SimulatorScenario = 'parkedFamily' | 'rainCommute' | 'fatigueDrive' | 'safetyAlert';

export interface SimulatorFrame {
  atMs: number;
  signals: VehicleSignal[];
}

export interface SimulatorRunResult {
  scenario: SimulatorScenario;
  frameCount: number;
  signals: VehicleSignal[];
}

function now(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

function signal(id: string, kind: VehicleSignalKind, value: string | number | boolean, confidence: number, offsetMs: number): VehicleSignal {
  return { id, kind, value, confidence, timestamp: now(offsetMs) };
}

const SCENARIOS: Record<SimulatorScenario, SimulatorFrame[]> = {
  parkedFamily: [
    { atMs: 0, signals: [signal('speed', 'speed', 0, 100, 0), signal('door-open', 'door', true, 95, 0)] },
    { atMs: 500, signals: [signal('seatbelt-front', 'seatbelt', true, 90, 500)] },
  ],
  rainCommute: [
    { atMs: 0, signals: [signal('speed', 'speed', 42, 100, 0), signal('weather-rain', 'weather', 'rain', 92, 0)] },
    { atMs: 800, signals: [signal('speed', 'speed', 66, 100, 800)] },
  ],
  fatigueDrive: [
    { atMs: 0, signals: [signal('speed', 'speed', 78, 100, 0), signal('seatbelt-front', 'seatbelt', true, 96, 0)] },
    { atMs: 1200, signals: [signal('fatigue', 'fatigue', true, 84, 1200)] },
  ],
  safetyAlert: [
    { atMs: 0, signals: [signal('speed', 'speed', 82, 100, 0), signal('weather-rain', 'weather', 'rain', 95, 0)] },
    { atMs: 600, signals: [signal('door-open', 'door', true, 87, 600)] },
  ],
};

export class AuraVehicleSimulator {
  listScenarios(): SimulatorScenario[] {
    return Object.keys(SCENARIOS) as SimulatorScenario[];
  }

  framesFor(scenario: SimulatorScenario): SimulatorFrame[] {
    return SCENARIOS[scenario].map((frame) => ({
      atMs: frame.atMs,
      signals: frame.signals.map((item) => ({ ...item })),
    }));
  }

  replay(scenario: SimulatorScenario): SimulatorRunResult {
    const frames = this.framesFor(scenario);
    return {
      scenario,
      frameCount: frames.length,
      signals: frames.flatMap((frame) => frame.signals),
    };
  }
}

export function createAuraVehicleSimulator(): AuraVehicleSimulator {
  return new AuraVehicleSimulator();
}
