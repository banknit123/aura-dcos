export type ValidationSeverity = 'info' | 'warning' | 'error';
export type ValidationDomain = 'signals' | 'commands' | 'diagnostics' | 'ota' | 'safety' | 'cybersecurity' | 'profile';

export interface ValidationFinding {
  id: string;
  domain: ValidationDomain;
  severity: ValidationSeverity;
  message: string;
  remediation: string;
}

export interface ValidationChecklistItem {
  id: string;
  domain: ValidationDomain;
  label: string;
  passed: boolean;
  required: boolean;
}

export interface ValidationInputProfile {
  profileId: string;
  requiredSignals: string[];
  mappedSignals: string[];
  exposedCommands: string[];
  gatewayProtectedCommands: string[];
  diagnosticsConnectors: string[];
  otaConfigured: boolean;
  safetyChecklist: ValidationChecklistItem[];
  cybersecurityChecklist: ValidationChecklistItem[];
}

export interface ValidationReport {
  profileId: string;
  ready: boolean;
  score: number;
  findings: ValidationFinding[];
  checklist: ValidationChecklistItem[];
  messages: string[];
}

function finding(id: string, domain: ValidationDomain, severity: ValidationSeverity, message: string, remediation: string): ValidationFinding {
  return { id, domain, severity, message, remediation };
}

export class AuraValidationSuite {
  validate(input: ValidationInputProfile): ValidationReport {
    const findings: ValidationFinding[] = [];
    const missingSignals = input.requiredSignals.filter((signal) => !input.mappedSignals.includes(signal));
    for (const signal of missingSignals) {
      findings.push(finding(`missing-signal-${signal}`, 'signals', 'error', `Required signal is not mapped: ${signal}`, 'Add a signal mapping in the OEM adapter or vehicle profile.'));
    }

    const unsafeCommands = input.exposedCommands.filter((command) => !input.gatewayProtectedCommands.includes(command));
    for (const command of unsafeCommands) {
      findings.push(finding(`unsafe-command-${command}`, 'commands', 'error', `Command is exposed without secure gateway protection: ${command}`, 'Route the command through Secure Vehicle Gateway policy.'));
    }

    if (input.diagnosticsConnectors.length === 0) {
      findings.push(finding('diagnostics-missing', 'diagnostics', 'warning', 'No diagnostics connectors configured.', 'Add UDS or OBD-II diagnostics connector templates for relevant ECUs.'));
    }

    if (!input.otaConfigured) {
      findings.push(finding('ota-not-configured', 'ota', 'warning', 'OTA lifecycle is not configured.', 'Configure OTA manifest and parked install policy.'));
    }

    const checklist = [...input.safetyChecklist, ...input.cybersecurityChecklist];
    for (const item of checklist) {
      if (!item.passed && item.required) {
        findings.push(finding(`checklist-${item.id}`, item.domain, 'error', `Required checklist item failed: ${item.label}`, 'Complete the required validation checklist item before release.'));
      } else if (!item.passed) {
        findings.push(finding(`checklist-${item.id}`, item.domain, 'warning', `Checklist item not complete: ${item.label}`, 'Complete this item before production deployment.'));
      }
    }

    const errors = findings.filter((item) => item.severity === 'error').length;
    const warnings = findings.filter((item) => item.severity === 'warning').length;
    const score = Math.max(0, 100 - errors * 25 - warnings * 8);
    return {
      profileId: input.profileId,
      ready: errors === 0,
      score,
      findings,
      checklist,
      messages: [`${input.requiredSignals.length} required signals checked.`, `${input.exposedCommands.length} exposed commands checked.`, `${errors} errors and ${warnings} warnings found.`],
    };
  }
}

export function createAuraValidationSuite(): AuraValidationSuite {
  return new AuraValidationSuite();
}

export function createDefaultSafetyChecklist(): ValidationChecklistItem[] {
  return [
    { id: 'driver-distraction-review', domain: 'safety', label: 'Driver distraction review completed', passed: false, required: true },
    { id: 'vehicle-command-policy', domain: 'safety', label: 'Vehicle command policy reviewed', passed: false, required: true },
    { id: 'hil-plan', domain: 'safety', label: 'Hardware-in-loop validation plan exists', passed: false, required: false },
  ];
}

export function createDefaultCybersecurityChecklist(): ValidationChecklistItem[] {
  return [
    { id: 'secure-gateway-review', domain: 'cybersecurity', label: 'Secure gateway review completed', passed: false, required: true },
    { id: 'ota-signing-review', domain: 'cybersecurity', label: 'OTA signing and rollback review completed', passed: false, required: true },
    { id: 'adapter-threat-model', domain: 'cybersecurity', label: 'OEM adapter threat model completed', passed: false, required: false },
  ];
}
