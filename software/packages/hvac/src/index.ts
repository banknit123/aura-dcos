export type HvacZone = 'driver' | 'passenger' | 'rear' | 'all';
export type HvacMode = 'off' | 'auto' | 'heat' | 'cool' | 'defog' | 'vent';

export interface HvacState {
  zone: HvacZone;
  mode: HvacMode;
  temperatureC: number;
  fanLevel: number;
  recirculation: boolean;
}

export interface HvacCommand {
  zone: HvacZone;
  mode?: HvacMode;
  temperatureC?: number;
  fanLevel?: number;
  recirculation?: boolean;
}

export interface HvacAdapter {
  read(): Promise<HvacState[]> | HvacState[];
  apply(command: HvacCommand): Promise<HvacState> | HvacState;
}

export class HvacController {
  constructor(private readonly adapter: HvacAdapter, private readonly minTempC = 16, private readonly maxTempC = 30) {}

  read(): Promise<HvacState[]> | HvacState[] {
    return this.adapter.read();
  }

  async apply(command: HvacCommand): Promise<HvacState> {
    if (command.temperatureC !== undefined && (command.temperatureC < this.minTempC || command.temperatureC > this.maxTempC)) {
      throw new Error(`HVAC temperature outside safe cabin range: ${command.temperatureC}`);
    }
    if (command.fanLevel !== undefined && (command.fanLevel < 0 || command.fanLevel > 7)) {
      throw new Error(`HVAC fan level outside supported range: ${command.fanLevel}`);
    }
    return this.adapter.apply(command);
  }
}

export class SimulatorHvacAdapter implements HvacAdapter {
  private states: HvacState[] = [
    { zone: 'driver', mode: 'auto', temperatureC: 22, fanLevel: 2, recirculation: false },
    { zone: 'passenger', mode: 'auto', temperatureC: 22, fanLevel: 2, recirculation: false },
  ];

  read(): HvacState[] {
    return this.states.map((state) => ({ ...state }));
  }

  apply(command: HvacCommand): HvacState {
    const targets = command.zone === 'all' ? this.states.map((state) => state.zone) : [command.zone];
    this.states = this.states.map((state) => targets.includes(state.zone) ? { ...state, ...command, zone: state.zone } : state);
    return this.states.find((state) => state.zone === (command.zone === 'all' ? 'driver' : command.zone)) as HvacState;
  }
}

export function createHvacController(adapter: HvacAdapter = new SimulatorHvacAdapter()): HvacController {
  return new HvacController(adapter);
}
