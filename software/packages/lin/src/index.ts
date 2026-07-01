export type LinBusState = 'sleep' | 'wake' | 'active' | 'fault';
export type LinChecksumModel = 'classic' | 'enhanced';
export type LinFrameDirection = 'publisher' | 'subscriber' | 'diagnostic';

export interface LinFrameDefinition {
  id: number;
  name: string;
  length: number;
  checksum: LinChecksumModel;
  direction: LinFrameDirection;
  periodMs?: number;
}

export interface LinFrame {
  id: number;
  data: number[];
  checksum: number;
  timestamp: string;
}

export interface LinScheduleEntry {
  frameId: number;
  delayMs: number;
}

export interface LinScheduleTable {
  id: string;
  name: string;
  entries: LinScheduleEntry[];
}

export interface LinDriver {
  readonly channel: string;
  wake(): Promise<void> | void;
  sleep(): Promise<void> | void;
  sendHeader(frameId: number): Promise<void> | void;
  writeResponse(frame: LinFrame): Promise<void> | void;
  readResponse(frameId: number): Promise<LinFrame | undefined> | LinFrame | undefined;
}

export interface LinHealthSnapshot {
  state: LinBusState;
  channel: string;
  frames: LinFrameDefinition[];
  activeSchedule?: string;
  transmittedFrames: number;
  receivedFrames: number;
  messages: string[];
}

function now(): string {
  return new Date().toISOString();
}

function assertLinId(id: number): void {
  if (!Number.isInteger(id) || id < 0 || id > 0x3f) throw new Error(`Invalid LIN protected identifier: ${id}`);
}

function checksum(data: number[]): number {
  const sum = data.reduce((total, byte) => total + byte, 0);
  return (~(sum & 0xff)) & 0xff;
}

export class LinBus {
  private state: LinBusState = 'sleep';
  private readonly frames = new Map<number, LinFrameDefinition>();
  private readonly schedules = new Map<string, LinScheduleTable>();
  private activeSchedule?: LinScheduleTable;
  private transmittedFrames = 0;
  private receivedFrames = 0;

  constructor(private readonly driver: LinDriver) {}

  registerFrame(frame: LinFrameDefinition): void {
    assertLinId(frame.id);
    if (frame.length < 0 || frame.length > 8) throw new Error(`Invalid LIN frame length: ${frame.length}`);
    if (this.frames.has(frame.id)) throw new Error(`LIN frame already registered: ${frame.id}`);
    this.frames.set(frame.id, frame);
  }

  registerSchedule(schedule: LinScheduleTable): void {
    for (const entry of schedule.entries) {
      if (!this.frames.has(entry.frameId)) throw new Error(`Schedule references unknown LIN frame: ${entry.frameId}`);
    }
    this.schedules.set(schedule.id, schedule);
  }

  async wake(): Promise<void> {
    await this.driver.wake();
    this.state = 'wake';
  }

  async sleep(): Promise<void> {
    await this.driver.sleep();
    this.state = 'sleep';
  }

  activateSchedule(scheduleId: string): void {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) throw new Error(`LIN schedule not registered: ${scheduleId}`);
    this.activeSchedule = schedule;
    this.state = 'active';
  }

  createFrame(frameId: number, data: number[]): LinFrame {
    const definition = this.frames.get(frameId);
    if (!definition) throw new Error(`LIN frame not registered: ${frameId}`);
    if (data.length !== definition.length) throw new Error(`LIN frame ${frameId} expected ${definition.length} bytes`);
    for (const byte of data) {
      if (!Number.isInteger(byte) || byte < 0 || byte > 255) throw new Error(`Invalid LIN byte: ${byte}`);
    }
    return { id: frameId, data, checksum: checksum(data), timestamp: now() };
  }

  async publish(frameId: number, data: number[]): Promise<LinFrame> {
    if (this.state === 'sleep') throw new Error('LIN bus is asleep');
    const frame = this.createFrame(frameId, data);
    await this.driver.sendHeader(frameId);
    await this.driver.writeResponse(frame);
    this.transmittedFrames += 1;
    return frame;
  }

  async request(frameId: number): Promise<LinFrame | undefined> {
    if (this.state === 'sleep') throw new Error('LIN bus is asleep');
    await this.driver.sendHeader(frameId);
    const response = await this.driver.readResponse(frameId);
    if (response) this.receivedFrames += 1;
    return response;
  }

  health(): LinHealthSnapshot {
    return {
      state: this.state,
      channel: this.driver.channel,
      frames: [...this.frames.values()],
      activeSchedule: this.activeSchedule?.id,
      transmittedFrames: this.transmittedFrames,
      receivedFrames: this.receivedFrames,
      messages: [`${this.frames.size} LIN frames registered.`, `${this.schedules.size} schedule tables registered.`],
    };
  }
}

export class SimulatorLinDriver implements LinDriver {
  private awake = false;
  private readonly responses = new Map<number, LinFrame>();
  private readonly txLog: LinFrame[] = [];

  constructor(readonly channel = 'sim-lin-0') {}

  wake(): void {
    this.awake = true;
  }

  sleep(): void {
    this.awake = false;
  }

  sendHeader(frameId: number): void {
    if (!this.awake) throw new Error(`LIN driver ${this.channel} is asleep`);
    assertLinId(frameId);
  }

  writeResponse(frame: LinFrame): void {
    if (!this.awake) throw new Error(`LIN driver ${this.channel} is asleep`);
    this.txLog.push(frame);
  }

  readResponse(frameId: number): LinFrame | undefined {
    if (!this.awake) throw new Error(`LIN driver ${this.channel} is asleep`);
    return this.responses.get(frameId);
  }

  injectResponse(frame: LinFrame): void {
    this.responses.set(frame.id, frame);
  }

  transmitted(): LinFrame[] {
    return [...this.txLog];
  }
}

export function createLinBus(driver: LinDriver = new SimulatorLinDriver()): LinBus {
  return new LinBus(driver);
}
