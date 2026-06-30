import { type VehicleSignal } from '@aura-dcos/integrations';

export type PlatformBusKind = 'can' | 'automotiveEthernet' | 'ros2' | 'androidAutomotive' | 'simulator';
export type PlatformHealth = 'ready' | 'degraded' | 'offline';
export type SecurityDecision = 'allow' | 'deny' | 'audit';
export type OtaState = 'idle' | 'checking' | 'available' | 'installing' | 'failed';

export interface PlatformGatewayStatus {
  id: string;
  kind: PlatformBusKind;
  health: PlatformHealth;
  message: string;
}

export interface PlatformCommand {
  target: 'display' | 'companion' | 'hvac' | 'lighting' | 'seat' | 'system';
  action: string;
  payload: Record<string, string | number | boolean>;
  safetyCritical: boolean;
}

export interface SecurityPolicyInput {
  command: PlatformCommand;
  vehicleState: 'parked' | 'driving';
  driverAttention: 'parked' | 'lowLoad' | 'mediumLoad' | 'highLoad' | 'critical';
}

export interface SecurityPolicyResult {
  decision: SecurityDecision;
  reason: string;
}

export interface TelemetryEvent {
  id: string;
  severity: 'info' | 'warn' | 'error';
  source: string;
  message: string;
  timestamp: string;
}

export interface OtaUpdateStatus {
  state: OtaState;
  currentVersion: string;
  availableVersion?: string;
  message: string;
}

export interface VehiclePlatformGateway {
  readonly id: string;
  readonly kind: PlatformBusKind;
  status(): PlatformGatewayStatus;
  readSignals(): Promise<VehicleSignal[]>;
  sendCommand(command: PlatformCommand): Promise<PlatformGatewayStatus>;
}

function now(): string {
  return new Date().toISOString();
}

export class AuraSecurityPolicyEngine {
  evaluate(input: SecurityPolicyInput): SecurityPolicyResult {
    if (input.driverAttention === 'critical' && !input.command.safetyCritical) {
      return { decision: 'deny', reason: 'Non-safety command blocked while driver attention is critical.' };
    }

    if (input.vehicleState === 'driving' && input.command.target === 'display' && input.command.action === 'enableImmersiveVideo') {
      return { decision: 'deny', reason: 'Driver-visible immersive video is blocked while driving.' };
    }

    if (input.command.safetyCritical) {
      return { decision: 'audit', reason: 'Safety-critical command allowed with audit telemetry.' };
    }

    return { decision: 'allow', reason: 'Command is permitted by the current platform policy.' };
  }
}

export class AuraTelemetryBuffer {
  private readonly events: TelemetryEvent[] = [];

  record(source: string, severity: TelemetryEvent['severity'], message: string): TelemetryEvent {
    const event = { id: `${source}-${Date.now()}-${this.events.length}`, source, severity, message, timestamp: now() };
    this.events.unshift(event);
    this.events.splice(50);
    return event;
  }

  list(): TelemetryEvent[] {
    return [...this.events];
  }
}

export class AuraOtaManager {
  private statusValue: OtaUpdateStatus = {
    state: 'idle',
    currentVersion: '0.1.0-prototype',
    message: 'OTA manager idle for prototype platform.',
  };

  status(): OtaUpdateStatus {
    return { ...this.statusValue };
  }

  checkForUpdate(availableVersion?: string): OtaUpdateStatus {
    this.statusValue = availableVersion
      ? { state: 'available', currentVersion: this.statusValue.currentVersion, availableVersion, message: `Update ${availableVersion} available.` }
      : { state: 'idle', currentVersion: this.statusValue.currentVersion, message: 'No update available.' };
    return this.status();
  }
}

export class SimulatorPlatformGateway implements VehiclePlatformGateway {
  readonly id = 'simulator-platform-gateway';
  readonly kind = 'simulator' as const;
  private readonly telemetry = new AuraTelemetryBuffer();

  constructor(private readonly signals: VehicleSignal[] = []) {}

  status(): PlatformGatewayStatus {
    return { id: this.id, kind: this.kind, health: 'ready', message: 'Simulator platform gateway ready.' };
  }

  async readSignals(): Promise<VehicleSignal[]> {
    this.telemetry.record(this.id, 'info', `Read ${this.signals.length} simulator platform signals.`);
    return this.signals.map((signal) => ({ ...signal }));
  }

  async sendCommand(command: PlatformCommand): Promise<PlatformGatewayStatus> {
    this.telemetry.record(this.id, command.safetyCritical ? 'warn' : 'info', `Command ${command.action} sent to ${command.target}.`);
    return this.status();
  }

  telemetryEvents(): TelemetryEvent[] {
    return this.telemetry.list();
  }
}

export function createAuraSecurityPolicyEngine(): AuraSecurityPolicyEngine {
  return new AuraSecurityPolicyEngine();
}

export function createAuraTelemetryBuffer(): AuraTelemetryBuffer {
  return new AuraTelemetryBuffer();
}

export function createAuraOtaManager(): AuraOtaManager {
  return new AuraOtaManager();
}
