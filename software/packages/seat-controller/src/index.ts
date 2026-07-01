export type SeatId = 'driver' | 'passenger' | 'rear-left' | 'rear-right';
export type SeatMotionPolicy = 'park-only' | 'low-speed' | 'anytime';

export interface SeatPosition {
  seatId: SeatId;
  foreAftMm: number;
  heightMm: number;
  reclineDeg: number;
  lumbarPct: number;
}

export interface SeatPreset {
  id: string;
  name: string;
  position: SeatPosition;
  policy: SeatMotionPolicy;
}

export interface SeatAdapter {
  read(seatId: SeatId): Promise<SeatPosition> | SeatPosition;
  move(position: SeatPosition): Promise<SeatPosition> | SeatPosition;
}

export class SeatController {
  private readonly presets = new Map<string, SeatPreset>();

  constructor(private readonly adapter: SeatAdapter) {}

  savePreset(preset: SeatPreset): void {
    this.presets.set(preset.id, preset);
  }

  async applyPreset(presetId: string, vehicleSpeedKph: number): Promise<SeatPosition> {
    const preset = this.presets.get(presetId);
    if (!preset) throw new Error(`Seat preset not registered: ${presetId}`);
    if (preset.policy === 'park-only' && vehicleSpeedKph > 0) throw new Error('Seat preset requires vehicle parked');
    if (preset.policy === 'low-speed' && vehicleSpeedKph > 10) throw new Error('Seat preset requires low speed');
    return this.adapter.move(preset.position);
  }
}

export class SimulatorSeatAdapter implements SeatAdapter {
  private positions = new Map<SeatId, SeatPosition>([['driver', { seatId: 'driver', foreAftMm: 0, heightMm: 0, reclineDeg: 15, lumbarPct: 50 }]]);
  read(seatId: SeatId): SeatPosition { return this.positions.get(seatId) ?? { seatId, foreAftMm: 0, heightMm: 0, reclineDeg: 15, lumbarPct: 50 }; }
  move(position: SeatPosition): SeatPosition { this.positions.set(position.seatId, position); return position; }
}

export function createSeatController(adapter: SeatAdapter = new SimulatorSeatAdapter()): SeatController { return new SeatController(adapter); }
