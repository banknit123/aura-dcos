export type WindowId = 'driver' | 'passenger' | 'rear-left' | 'rear-right' | 'roof';
export interface WindowState { windowId: WindowId; positionPct: number; obstructionSensorHealthy: boolean; }
export interface WindowCommand { windowId: WindowId | 'all'; positionPct: number; }
export interface WindowAdapter { read(): Promise<WindowState[]> | WindowState[]; move(command: WindowCommand): Promise<WindowState[]> | WindowState[]; }

export class WindowController {
  constructor(private readonly adapter: WindowAdapter) {}
  read(): Promise<WindowState[]> | WindowState[] { return this.adapter.read(); }
  async move(command: WindowCommand): Promise<WindowState[]> {
    if (command.positionPct < 0 || command.positionPct > 100) throw new Error('Window position must be between 0 and 100');
    const states = await this.adapter.read();
    const targets = command.windowId === 'all' ? states : states.filter((state) => state.windowId === command.windowId);
    if (targets.some((state) => !state.obstructionSensorHealthy && command.positionPct > state.positionPct)) throw new Error('Window close blocked because obstruction sensor is unhealthy');
    return this.adapter.move(command);
  }
}

export class SimulatorWindowAdapter implements WindowAdapter {
  private states: WindowState[] = [
    { windowId: 'driver', positionPct: 0, obstructionSensorHealthy: true },
    { windowId: 'passenger', positionPct: 0, obstructionSensorHealthy: true },
    { windowId: 'rear-left', positionPct: 0, obstructionSensorHealthy: true },
    { windowId: 'rear-right', positionPct: 0, obstructionSensorHealthy: true },
  ];
  read(): WindowState[] { return this.states.map((state) => ({ ...state })); }
  move(command: WindowCommand): WindowState[] { const targets = command.windowId === 'all' ? this.states.map((s) => s.windowId) : [command.windowId]; this.states = this.states.map((state) => targets.includes(state.windowId) ? { ...state, positionPct: command.positionPct } : state); return this.read(); }
  setObstructionSensor(windowId: WindowId, healthy: boolean): void { this.states = this.states.map((state) => state.windowId === windowId ? { ...state, obstructionSensorHealthy: healthy } : state); }
}

export function createWindowController(adapter: WindowAdapter = new SimulatorWindowAdapter()): WindowController { return new WindowController(adapter); }
