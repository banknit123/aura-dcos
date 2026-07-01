export type OemBusKind = 'can' | 'can-fd' | 'lin' | 'automotive-ethernet' | 'diagnostics' | 'simulator';
export type MappingDirection = 'read' | 'write' | 'read-write';
export type CompatibilitySeverity = 'info' | 'warning' | 'error';

export interface OemAdapterBlueprint {
  adapterId: string;
  oem: string;
  vehiclePlatform: string;
  modelYear: number;
  buses: OemBusKind[];
  requiredSignals: string[];
  supportedCommands: string[];
}

export interface GeneratedAdapterFile {
  path: string;
  content: string;
}

export interface GeneratedAdapterScaffold {
  adapterId: string;
  packageName: string;
  files: GeneratedAdapterFile[];
  messages: string[];
}

export interface SignalMappingTemplate {
  auraSignal: string;
  sourceBus: OemBusKind;
  sourceAddress: string;
  sourceSignal: string;
  unit?: string;
  direction: MappingDirection;
  required: boolean;
}

export interface DiagnosticsConnectorTemplate {
  ecuId: string;
  protocol: 'uds' | 'obd-ii';
  address: string;
  supportedServices: string[];
}

export interface EcuScannerTemplate {
  scannerId: string;
  buses: OemBusKind[];
  expectedEcus: string[];
}

export interface CompatibilityIssue {
  severity: CompatibilitySeverity;
  code: string;
  message: string;
}

export interface CompatibilityReport {
  adapterId: string;
  compatible: boolean;
  score: number;
  issues: CompatibilityIssue[];
  missingSignals: string[];
  missingCommands: string[];
}

function packageSafe(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export class OemAdapterGenerator {
  generate(blueprint: OemAdapterBlueprint): GeneratedAdapterScaffold {
    if (!blueprint.adapterId.trim()) throw new Error('OEM adapter id is required');
    if (!blueprint.oem.trim()) throw new Error('OEM name is required');
    if (blueprint.buses.length === 0) throw new Error('At least one OEM bus must be declared');

    const packageName = `@aura-dcos/${packageSafe(blueprint.adapterId)}`;
    return {
      adapterId: blueprint.adapterId,
      packageName,
      files: [
        { path: 'package.json', content: JSON.stringify({ name: packageName, version: '0.1.0', type: 'module' }, null, 2) },
        { path: 'src/index.ts', content: `export const adapterId = '${blueprint.adapterId}';\nexport const oem = '${blueprint.oem}';\nexport const vehiclePlatform = '${blueprint.vehiclePlatform}';\n` },
        { path: 'adapter.manifest.json', content: JSON.stringify(blueprint, null, 2) },
      ],
      messages: [`Generated adapter scaffold for ${blueprint.oem} ${blueprint.vehiclePlatform}.`, `${blueprint.requiredSignals.length} required signals declared.`],
    };
  }
}

export class SignalMappingTemplateBuilder {
  createRequiredSignal(auraSignal: string, sourceBus: OemBusKind, sourceAddress: string, sourceSignal: string, unit?: string): SignalMappingTemplate {
    return { auraSignal, sourceBus, sourceAddress, sourceSignal, unit, direction: 'read', required: true };
  }

  createCommandMapping(auraSignal: string, sourceBus: OemBusKind, sourceAddress: string, sourceSignal: string): SignalMappingTemplate {
    return { auraSignal, sourceBus, sourceAddress, sourceSignal, direction: 'write', required: true };
  }
}

export class CompatibilityAnalyzer {
  analyze(blueprint: OemAdapterBlueprint, mappings: SignalMappingTemplate[], diagnostics: DiagnosticsConnectorTemplate[]): CompatibilityReport {
    const mappedSignals = new Set(mappings.map((mapping) => mapping.auraSignal));
    const missingSignals = blueprint.requiredSignals.filter((signal) => !mappedSignals.has(signal));
    const commandMappings = new Set(mappings.filter((mapping) => mapping.direction !== 'read').map((mapping) => mapping.auraSignal));
    const missingCommands = blueprint.supportedCommands.filter((command) => !commandMappings.has(command));
    const issues: CompatibilityIssue[] = [];

    for (const signal of missingSignals) issues.push({ severity: 'error', code: 'missing-signal', message: `Required signal is not mapped: ${signal}` });
    for (const command of missingCommands) issues.push({ severity: 'warning', code: 'missing-command', message: `Supported command is not mapped: ${command}` });
    if (diagnostics.length === 0) issues.push({ severity: 'warning', code: 'missing-diagnostics', message: 'No diagnostics connector templates declared.' });

    const errorCount = issues.filter((issue) => issue.severity === 'error').length;
    const warningCount = issues.filter((issue) => issue.severity === 'warning').length;
    const score = Math.max(0, 100 - errorCount * 30 - warningCount * 10);
    return { adapterId: blueprint.adapterId, compatible: errorCount === 0, score, issues, missingSignals, missingCommands };
  }
}

export class EcuScannerTemplateBuilder {
  create(scannerId: string, buses: OemBusKind[], expectedEcus: string[]): EcuScannerTemplate {
    if (buses.length === 0) throw new Error('ECU scanner requires at least one bus');
    return { scannerId, buses, expectedEcus };
  }
}

export class DiagnosticsConnectorBuilder {
  createUdsConnector(ecuId: string, address: string, supportedServices: string[] = ['ReadDataByIdentifier', 'ReadDTCInformation']): DiagnosticsConnectorTemplate {
    return { ecuId, protocol: 'uds', address, supportedServices };
  }

  createObdConnector(ecuId: string, address: string, supportedServices: string[] = ['01', '03', '04']): DiagnosticsConnectorTemplate {
    return { ecuId, protocol: 'obd-ii', address, supportedServices };
  }
}

export function createOemAdapterGenerator(): OemAdapterGenerator { return new OemAdapterGenerator(); }
export function createSignalMappingTemplateBuilder(): SignalMappingTemplateBuilder { return new SignalMappingTemplateBuilder(); }
export function createCompatibilityAnalyzer(): CompatibilityAnalyzer { return new CompatibilityAnalyzer(); }
export function createEcuScannerTemplateBuilder(): EcuScannerTemplateBuilder { return new EcuScannerTemplateBuilder(); }
export function createDiagnosticsConnectorBuilder(): DiagnosticsConnectorBuilder { return new DiagnosticsConnectorBuilder(); }
