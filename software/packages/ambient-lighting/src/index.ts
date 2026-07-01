export type LightingZone = 'dashboard' | 'doors' | 'floor' | 'roof' | 'rear' | 'all';
export interface RgbColor { r: number; g: number; b: number; }
export interface LightingState { zone: LightingZone; color: RgbColor; brightnessPct: number; scene?: string; }
export interface LightingCommand { zone: LightingZone; color?: RgbColor; brightnessPct?: number; scene?: string; }
export interface LightingAdapter { read(): Promise<LightingState[]> | LightingState[]; apply(command: LightingCommand): Promise<LightingState[]> | LightingState[]; }

function assertColor(color: RgbColor): void {
  for (const value of [color.r, color.g, color.b]) if (!Number.isInteger(value) || value < 0 || value > 255) throw new Error('RGB color values must be 0-255');
}

export class AmbientLightingController {
  constructor(private readonly adapter: LightingAdapter) {}
  read(): Promise<LightingState[]> | LightingState[] { return this.adapter.read(); }
  async apply(command: LightingCommand): Promise<LightingState[]> {
    if (command.color) assertColor(command.color);
    if (command.brightnessPct !== undefined && (command.brightnessPct < 0 || command.brightnessPct > 100)) throw new Error('Brightness must be 0-100');
    return this.adapter.apply(command);
  }
}

export class SimulatorLightingAdapter implements LightingAdapter {
  private states: LightingState[] = [
    { zone: 'dashboard', color: { r: 0, g: 160, b: 180 }, brightnessPct: 60, scene: 'oceanCalm' },
    { zone: 'doors', color: { r: 0, g: 160, b: 180 }, brightnessPct: 60, scene: 'oceanCalm' },
    { zone: 'floor', color: { r: 0, g: 80, b: 120 }, brightnessPct: 40, scene: 'oceanCalm' },
  ];
  read(): LightingState[] { return this.states.map((state) => ({ ...state, color: { ...state.color } })); }
  apply(command: LightingCommand): LightingState[] { const targets = command.zone === 'all' ? this.states.map((s) => s.zone) : [command.zone]; this.states = this.states.map((state) => targets.includes(state.zone) ? { ...state, ...command, zone: state.zone, color: command.color ?? state.color } : state); return this.read(); }
}

export function createAmbientLightingController(adapter: LightingAdapter = new SimulatorLightingAdapter()): AmbientLightingController { return new AmbientLightingController(adapter); }
