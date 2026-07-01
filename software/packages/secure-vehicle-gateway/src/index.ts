export type GatewayDecision = 'allow' | 'deny' | 'audit';
export type GatewayRisk = 'low' | 'medium' | 'high' | 'critical';

export interface GatewayCommand {
  id: string;
  target: string;
  action: string;
  risk: GatewayRisk;
  requiresParked?: boolean;
  requiresTrustedEcu?: boolean;
}

export interface GatewayContext {
  vehicleSpeedKph: number;
  trustedEcus: string[];
  targetEcu?: string;
  operator: string;
}

export interface GatewayResult {
  decision: GatewayDecision;
  command: GatewayCommand;
  reason: string;
  auditRequired: boolean;
}

export interface GatewayAuditEvent {
  commandId: string;
  decision: GatewayDecision;
  reason: string;
  operator: string;
  timestamp: string;
}

function now(): string { return new Date().toISOString(); }

export class SecureVehicleGateway {
  private readonly auditLog: GatewayAuditEvent[] = [];

  authorize(command: GatewayCommand, context: GatewayContext): GatewayResult {
    let result: GatewayResult;
    if (command.requiresParked && context.vehicleSpeedKph > 0) {
      result = { decision: 'deny', command, reason: 'Command requires parked vehicle.', auditRequired: true };
    } else if (command.requiresTrustedEcu && (!context.targetEcu || !context.trustedEcus.includes(context.targetEcu))) {
      result = { decision: 'deny', command, reason: 'Command target ECU is not trusted.', auditRequired: true };
    } else if (command.risk === 'critical' || command.risk === 'high') {
      result = { decision: 'audit', command, reason: 'High-risk command allowed with audit.', auditRequired: true };
    } else {
      result = { decision: 'allow', command, reason: 'Command allowed by secure gateway.', auditRequired: false };
    }
    if (result.auditRequired) this.auditLog.push({ commandId: command.id, decision: result.decision, reason: result.reason, operator: context.operator, timestamp: now() });
    return result;
  }

  auditEvents(): GatewayAuditEvent[] { return [...this.auditLog]; }
}

export function createSecureVehicleGateway(): SecureVehicleGateway { return new SecureVehicleGateway(); }
