export type CanFrameFormat = 'standard-11bit' | 'extended-29bit';
export type CanFrameType = 'data' | 'remote' | 'error';
export type CanBusMode = 'offline' | 'listen-only' | 'active' | 'bus-off';
export type CanPayloadByte = number;

export interface CanFrame {
  id: number;
  format: CanFrameFormat;
  type: CanFrameType;
  data: CanPayloadByte[];
  timestamp: string;
  channel: string;
  bitrateKbps?: number;
  flexibleDataRate?: boolean;
  bitrateSwitch?: boolean;
}

export interface CanFilter {
  id: number;
  mask: number;
  format?: CanFrameFormat;
  channel?: string;
}

export interface CanSignalDefinition {
  name: string;
  startBit: number;
  length: number;
  scale: number;
  offset: number;
  unit?: string;
}

export interface CanDecodedSignal {
  name: string;
  value: number;
  unit?: string;
}

export interface CanMessageDefinition {
  id: number;
  name: string;
  format: CanFrameFormat;
  dlc: number;
  cycleTimeMs?: number;
  signals: CanSignalDefinition[];
}

export interface CanBusStatistics {
  transmittedFrames: number;
  receivedFrames: number;
  droppedFrames: number;
  errorFrames: number;
  lastFrameAt?: string;
}

export interface CanDriver {
  readonly channel: string;
  readonly supportsFlexibleDataRate: boolean;
  open(): Promise<void> | void;
  close(): Promise<void> | void;
  transmit(frame: CanFrame): Promise<void> | void;
  receive(): Promise<CanFrame[]> | CanFrame[];
}

export interface CanCodec {
  encode(message: CanMessageDefinition, signals: Record<string, number>, channel: string): CanFrame;
  decode(message: CanMessageDefinition, frame: CanFrame): CanDecodedSignal[];
}

function now(): string {
  return new Date().toISOString();
}

function assertFrame(frame: CanFrame): void {
  const maxId = frame.format === 'standard-11bit' ? 0x7ff : 0x1fffffff;
  if (!Number.isInteger(frame.id) || frame.id < 0 || frame.id > maxId) {
    throw new Error(`Invalid CAN identifier ${frame.id} for ${frame.format}`);
  }
  const maxDlc = frame.flexibleDataRate ? 64 : 8;
  if (frame.data.length > maxDlc) throw new Error(`CAN payload exceeds DLC ${maxDlc}`);
  for (const byte of frame.data) {
    if (!Number.isInteger(byte) || byte < 0 || byte > 255) throw new Error(`Invalid CAN byte: ${byte}`);
  }
}

function matchesFilter(frame: CanFrame, filter: CanFilter): boolean {
  const formatMatch = !filter.format || filter.format === frame.format;
  const channelMatch = !filter.channel || filter.channel === frame.channel;
  return formatMatch && channelMatch && (frame.id & filter.mask) === (filter.id & filter.mask);
}

export class BasicCanCodec implements CanCodec {
  encode(message: CanMessageDefinition, signals: Record<string, number>, channel: string): CanFrame {
    const data = Array.from({ length: message.dlc }, () => 0);
    for (const signal of message.signals) {
      const physicalValue = signals[signal.name];
      if (physicalValue === undefined) continue;
      const raw = Math.round((physicalValue - signal.offset) / signal.scale);
      const byteIndex = Math.floor(signal.startBit / 8);
      if (byteIndex >= data.length) throw new Error(`Signal ${signal.name} exceeds message DLC`);
      data[byteIndex] = raw & 0xff;
    }
    const frame: CanFrame = {
      id: message.id,
      format: message.format,
      type: 'data',
      data,
      channel,
      timestamp: now(),
      flexibleDataRate: message.dlc > 8,
    };
    assertFrame(frame);
    return frame;
  }

  decode(message: CanMessageDefinition, frame: CanFrame): CanDecodedSignal[] {
    if (message.id !== frame.id || message.format !== frame.format) return [];
    return message.signals.map((signal) => {
      const byteIndex = Math.floor(signal.startBit / 8);
      const raw = frame.data[byteIndex] ?? 0;
      return { name: signal.name, value: raw * signal.scale + signal.offset, unit: signal.unit };
    });
  }
}

export class CanBus {
  private mode: CanBusMode = 'offline';
  private readonly filters: CanFilter[] = [];
  private readonly subscribers = new Set<(frame: CanFrame) => void>();
  private readonly statistics: CanBusStatistics = { transmittedFrames: 0, receivedFrames: 0, droppedFrames: 0, errorFrames: 0 };

  constructor(private readonly driver: CanDriver) {}

  get channel(): string {
    return this.driver.channel;
  }

  getMode(): CanBusMode {
    return this.mode;
  }

  getStatistics(): CanBusStatistics {
    return { ...this.statistics };
  }

  addFilter(filter: CanFilter): void {
    this.filters.push(filter);
  }

  subscribe(listener: (frame: CanFrame) => void): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  async open(mode: CanBusMode = 'active'): Promise<void> {
    await this.driver.open();
    this.mode = mode;
  }

  async close(): Promise<void> {
    await this.driver.close();
    this.mode = 'offline';
  }

  async transmit(frame: CanFrame): Promise<void> {
    if (this.mode !== 'active') throw new Error(`CAN bus ${this.channel} is not active`);
    assertFrame(frame);
    if (frame.flexibleDataRate && !this.driver.supportsFlexibleDataRate) {
      throw new Error(`Driver ${this.channel} does not support CAN-FD`);
    }
    await this.driver.transmit(frame);
    this.statistics.transmittedFrames += 1;
    this.statistics.lastFrameAt = frame.timestamp;
  }

  async poll(): Promise<CanFrame[]> {
    if (this.mode === 'offline') return [];
    const incoming = await this.driver.receive();
    const accepted: CanFrame[] = [];
    for (const frame of incoming) {
      try {
        assertFrame(frame);
        const allowed = this.filters.length === 0 || this.filters.some((filter) => matchesFilter(frame, filter));
        if (!allowed) {
          this.statistics.droppedFrames += 1;
          continue;
        }
        accepted.push(frame);
        this.statistics.receivedFrames += 1;
        this.statistics.lastFrameAt = frame.timestamp;
        for (const subscriber of this.subscribers) subscriber(frame);
      } catch {
        this.statistics.errorFrames += 1;
      }
    }
    return accepted;
  }
}

export class CanBusManager {
  private readonly buses = new Map<string, CanBus>();

  register(bus: CanBus): void {
    if (this.buses.has(bus.channel)) throw new Error(`CAN channel already registered: ${bus.channel}`);
    this.buses.set(bus.channel, bus);
  }

  get(channel: string): CanBus {
    const bus = this.buses.get(channel);
    if (!bus) throw new Error(`CAN channel not registered: ${channel}`);
    return bus;
  }

  list(): CanBus[] {
    return [...this.buses.values()];
  }

  async openAll(mode: CanBusMode = 'active'): Promise<void> {
    for (const bus of this.buses.values()) await bus.open(mode);
  }

  async closeAll(): Promise<void> {
    for (const bus of [...this.buses.values()].reverse()) await bus.close();
  }
}

export class SimulatorCanDriver implements CanDriver {
  readonly supportsFlexibleDataRate = true;
  private opened = false;
  private readonly rxQueue: CanFrame[] = [];
  private readonly txLog: CanFrame[] = [];

  constructor(readonly channel: string = 'sim-can-0') {}

  open(): void {
    this.opened = true;
  }

  close(): void {
    this.opened = false;
  }

  transmit(frame: CanFrame): void {
    if (!this.opened) throw new Error('Simulator CAN driver is closed');
    this.txLog.push(frame);
  }

  receive(): CanFrame[] {
    if (!this.opened) return [];
    return this.rxQueue.splice(0, this.rxQueue.length);
  }

  inject(frame: Omit<CanFrame, 'timestamp' | 'channel'> & Partial<Pick<CanFrame, 'timestamp' | 'channel'>>): void {
    this.rxQueue.push({ ...frame, timestamp: frame.timestamp ?? now(), channel: frame.channel ?? this.channel });
  }

  transmitted(): CanFrame[] {
    return [...this.txLog];
  }
}

export function createCanBusManager(): CanBusManager {
  return new CanBusManager();
}

export function createSimulatorCanBus(channel = 'sim-can-0'): CanBus {
  return new CanBus(new SimulatorCanDriver(channel));
}
