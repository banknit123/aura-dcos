export type AudioZone = 'driver' | 'passenger' | 'rear' | 'all';
export interface AmplifierState { zone: AudioZone; gainDb: number; muted: boolean; voiceDuckingPct: number; }
export interface AmplifierCommand { zone: AudioZone; gainDb?: number; muted?: boolean; voiceDuckingPct?: number; }
export interface AmplifierAdapter { read(): Promise<AmplifierState[]> | AmplifierState[]; apply(command: AmplifierCommand): Promise<AmplifierState[]> | AmplifierState[]; }

export class AudioAmplifierController {
  constructor(private readonly adapter: AmplifierAdapter) {}
  read(): Promise<AmplifierState[]> | AmplifierState[] { return this.adapter.read(); }
  async apply(command: AmplifierCommand): Promise<AmplifierState[]> {
    if (command.gainDb !== undefined && (command.gainDb < -60 || command.gainDb > 12)) throw new Error('Amplifier gain outside supported range');
    if (command.voiceDuckingPct !== undefined && (command.voiceDuckingPct < 0 || command.voiceDuckingPct > 100)) throw new Error('Voice ducking must be 0-100');
    return this.adapter.apply(command);
  }
}

export class SimulatorAmplifierAdapter implements AmplifierAdapter {
  private states: AmplifierState[] = [
    { zone: 'driver', gainDb: 0, muted: false, voiceDuckingPct: 30 },
    { zone: 'passenger', gainDb: 0, muted: false, voiceDuckingPct: 30 },
    { zone: 'rear', gainDb: 0, muted: false, voiceDuckingPct: 30 },
  ];
  read(): AmplifierState[] { return this.states.map((state) => ({ ...state })); }
  apply(command: AmplifierCommand): AmplifierState[] { const targets = command.zone === 'all' ? this.states.map((s) => s.zone) : [command.zone]; this.states = this.states.map((state) => targets.includes(state.zone) ? { ...state, ...command, zone: state.zone } : state); return this.read(); }
}

export function createAudioAmplifierController(adapter: AmplifierAdapter = new SimulatorAmplifierAdapter()): AudioAmplifierController { return new AudioAmplifierController(adapter); }
