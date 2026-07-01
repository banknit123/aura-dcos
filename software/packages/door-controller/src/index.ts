export type DoorId = 'driver' | 'passenger' | 'rear-left' | 'rear-right' | 'tailgate';
export type DoorLockState = 'locked' | 'unlocked';

export interface DoorState { doorId: DoorId; lockState: DoorLockState; ajar: boolean; childLock?: boolean; }
export interface DoorCommand { doorId: DoorId | 'all'; lockState?: DoorLockState; childLock?: boolean; }
export interface DoorAdapter { read(): Promise<DoorState[]> | DoorState[]; apply(command: DoorCommand): Promise<DoorState[]> | DoorState[]; }

export class DoorController {
  constructor(private readonly adapter: DoorAdapter) {}
  read(): Promise<DoorState[]> | DoorState[] { return this.adapter.read(); }
  async apply(command: DoorCommand, vehicleSpeedKph: number): Promise<DoorState[]> {
    if (command.lockState === 'unlocked' && vehicleSpeedKph > 5) throw new Error('Door unlock command blocked while moving');
    return this.adapter.apply(command);
  }
}

export class SimulatorDoorAdapter implements DoorAdapter {
  private states: DoorState[] = [
    { doorId: 'driver', lockState: 'locked', ajar: false },
    { doorId: 'passenger', lockState: 'locked', ajar: false },
    { doorId: 'rear-left', lockState: 'locked', ajar: false, childLock: true },
    { doorId: 'rear-right', lockState: 'locked', ajar: false, childLock: true },
  ];
  read(): DoorState[] { return this.states.map((state) => ({ ...state })); }
  apply(command: DoorCommand): DoorState[] { const targets = command.doorId === 'all' ? this.states.map((s) => s.doorId) : [command.doorId]; this.states = this.states.map((state) => targets.includes(state.doorId) ? { ...state, ...command, doorId: state.doorId } : state); return this.read(); }
}

export function createDoorController(adapter: DoorAdapter = new SimulatorDoorAdapter()): DoorController { return new DoorController(adapter); }
