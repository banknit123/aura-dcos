export type DiagnosticProtocol = 'uds' | 'obd-ii';
export type DiagnosticSessionType = 'default' | 'extended' | 'programming' | 'safety-system';
export type DiagnosticSecurityState = 'locked' | 'seed-issued' | 'unlocked';
export type DtcStatus = 'stored' | 'pending' | 'confirmed' | 'cleared';

export interface DiagnosticEcuIdentity {
  id: string;
  name: string;
  address: string;
  vin?: string;
  softwareVersion?: string;
  hardwareVersion?: string;
  supportedProtocols: DiagnosticProtocol[];
}

export interface DiagnosticRequest {
  id: string;
  protocol: DiagnosticProtocol;
  ecuId: string;
  service: string;
  subFunction?: string;
  payload?: number[];
  requestedAt: string;
}

export interface DiagnosticResponse {
  requestId: string;
  positive: boolean;
  service: string;
  payload: number[];
  reason?: string;
  respondedAt: string;
}

export interface DiagnosticTroubleCode {
  code: string;
  description: string;
  status: DtcStatus;
  ecuId: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface LiveDataParameter {
  pid: string;
  name: string;
  value: number | string | boolean;
  unit?: string;
  timestamp: string;
}

export interface DiagnosticTransport {
  send(request: DiagnosticRequest): Promise<DiagnosticResponse> | DiagnosticResponse;
}

export interface DiagnosticSnapshot {
  session: DiagnosticSessionType;
  securityState: DiagnosticSecurityState;
  ecus: DiagnosticEcuIdentity[];
  dtcs: DiagnosticTroubleCode[];
  messages: string[];
}

function now(): string {
  return new Date().toISOString();
}

export class DiagnosticSessionManager {
  private session: DiagnosticSessionType = 'default';
  private securityState: DiagnosticSecurityState = 'locked';

  getSession(): DiagnosticSessionType {
    return this.session;
  }

  getSecurityState(): DiagnosticSecurityState {
    return this.securityState;
  }

  start(session: DiagnosticSessionType): void {
    this.session = session;
    this.securityState = 'locked';
  }

  issueSeed(): number[] {
    this.securityState = 'seed-issued';
    return [0x12, 0x34, 0x56, 0x78];
  }

  unlock(key: number[]): boolean {
    const accepted = key.join(',') === '120,86,52,18';
    this.securityState = accepted ? 'unlocked' : 'locked';
    return accepted;
  }
}

export class DiagnosticsGateway {
  private readonly ecus = new Map<string, DiagnosticEcuIdentity>();
  private readonly dtcs = new Map<string, DiagnosticTroubleCode>();

  constructor(private readonly transport: DiagnosticTransport, private readonly sessionManager = new DiagnosticSessionManager()) {}

  registerEcu(ecu: DiagnosticEcuIdentity): void {
    if (this.ecus.has(ecu.id)) throw new Error(`ECU already registered: ${ecu.id}`);
    this.ecus.set(ecu.id, ecu);
  }

  listEcus(): DiagnosticEcuIdentity[] {
    return [...this.ecus.values()];
  }

  startSession(session: DiagnosticSessionType): void {
    this.sessionManager.start(session);
  }

  requestSecuritySeed(): number[] {
    return this.sessionManager.issueSeed();
  }

  unlockSecurity(key: number[]): boolean {
    return this.sessionManager.unlock(key);
  }

  async identifyEcu(ecuId: string): Promise<DiagnosticEcuIdentity> {
    const ecu = this.ecus.get(ecuId);
    if (!ecu) throw new Error(`ECU not registered: ${ecuId}`);
    await this.transport.send({ id: `identify-${ecuId}`, protocol: 'uds', ecuId, service: 'ReadDataByIdentifier', subFunction: 'F190', requestedAt: now() });
    return ecu;
  }

  async readDtc(ecuId: string): Promise<DiagnosticTroubleCode[]> {
    const response = await this.transport.send({ id: `dtc-${ecuId}`, protocol: 'uds', ecuId, service: 'ReadDTCInformation', subFunction: 'reportDTCByStatusMask', payload: [0xff], requestedAt: now() });
    if (!response.positive) return [];
    return [...this.dtcs.values()].filter((dtc) => dtc.ecuId === ecuId && dtc.status !== 'cleared');
  }

  async clearDtc(ecuId: string): Promise<boolean> {
    if (this.sessionManager.getSession() === 'default') throw new Error('DTC clear requires extended diagnostic session');
    const response = await this.transport.send({ id: `clear-dtc-${ecuId}`, protocol: 'uds', ecuId, service: 'ClearDiagnosticInformation', payload: [0xff, 0xff, 0xff], requestedAt: now() });
    if (response.positive) {
      for (const dtc of this.dtcs.values()) {
        if (dtc.ecuId === ecuId) this.dtcs.set(dtc.code, { ...dtc, status: 'cleared', lastSeenAt: now() });
      }
    }
    return response.positive;
  }

  async readObdLiveData(ecuId: string, pid: string): Promise<LiveDataParameter> {
    const response = await this.transport.send({ id: `obd-${ecuId}-${pid}`, protocol: 'obd-ii', ecuId, service: '01', subFunction: pid, requestedAt: now() });
    return { pid, name: `OBD PID ${pid}`, value: response.payload[0] ?? 0, timestamp: response.respondedAt };
  }

  recordDtc(dtc: Omit<DiagnosticTroubleCode, 'firstSeenAt' | 'lastSeenAt'> & Partial<Pick<DiagnosticTroubleCode, 'firstSeenAt' | 'lastSeenAt'>>): void {
    const timestamp = now();
    this.dtcs.set(dtc.code, { ...dtc, firstSeenAt: dtc.firstSeenAt ?? timestamp, lastSeenAt: dtc.lastSeenAt ?? timestamp });
  }

  snapshot(): DiagnosticSnapshot {
    return {
      session: this.sessionManager.getSession(),
      securityState: this.sessionManager.getSecurityState(),
      ecus: this.listEcus(),
      dtcs: [...this.dtcs.values()],
      messages: [`${this.ecus.size} diagnostic ECUs registered.`, `${this.dtcs.size} DTC records tracked.`],
    };
  }
}

export class SimulatorDiagnosticTransport implements DiagnosticTransport {
  private readonly requests: DiagnosticRequest[] = [];

  send(request: DiagnosticRequest): DiagnosticResponse {
    this.requests.push(request);
    return { requestId: request.id, positive: true, service: request.service, payload: request.protocol === 'obd-ii' ? [42] : [0x62, 0xf1, 0x90], respondedAt: now() };
  }

  history(): DiagnosticRequest[] {
    return [...this.requests];
  }
}

export function createDiagnosticsGateway(transport: DiagnosticTransport = new SimulatorDiagnosticTransport()): DiagnosticsGateway {
  return new DiagnosticsGateway(transport);
}
