import { describe, expect, it } from 'vitest';
import { createCompatibilityAnalyzer, createDiagnosticsConnectorBuilder, createEcuScannerTemplateBuilder, createOemAdapterGenerator, createSignalMappingTemplateBuilder } from './index';

describe('OemAdapterToolkit', () => {
  const blueprint = {
    adapterId: 'reference-oem-suv-adapter',
    oem: 'Reference OEM',
    vehiclePlatform: 'SUV-2032',
    modelYear: 2032,
    buses: ['can-fd', 'lin', 'automotive-ethernet'] as const,
    requiredSignals: ['vehicle.speedKph', 'hvac.cabinTempC'],
    supportedCommands: ['setTemperature'],
  };

  it('generates an OEM adapter scaffold', () => {
    const scaffold = createOemAdapterGenerator().generate(blueprint);

    expect(scaffold.packageName).toBe('@aura-dcos/reference-oem-suv-adapter');
    expect(scaffold.files.map((file) => file.path)).toContain('adapter.manifest.json');
  });

  it('builds signal mapping and diagnostics templates', () => {
    const mappingBuilder = createSignalMappingTemplateBuilder();
    const diagnosticBuilder = createDiagnosticsConnectorBuilder();
    const speed = mappingBuilder.createRequiredSignal('vehicle.speedKph', 'can-fd', '0x120', 'VehicleSpeed', 'km/h');
    const uds = diagnosticBuilder.createUdsConnector('body-ecu', '0x710');

    expect(speed.required).toBe(true);
    expect(uds.supportedServices).toContain('ReadDTCInformation');
  });

  it('reports compatibility gaps', () => {
    const mappingBuilder = createSignalMappingTemplateBuilder();
    const mappings = [
      mappingBuilder.createRequiredSignal('vehicle.speedKph', 'can-fd', '0x120', 'VehicleSpeed', 'km/h'),
      mappingBuilder.createCommandMapping('setTemperature', 'lin', '0x22', 'SetTemperature'),
    ];

    const report = createCompatibilityAnalyzer().analyze(blueprint, mappings, []);

    expect(report.compatible).toBe(false);
    expect(report.missingSignals).toContain('hvac.cabinTempC');
    expect(report.issues.some((issue) => issue.code === 'missing-diagnostics')).toBe(true);
  });

  it('creates ECU scanner templates', () => {
    const scanner = createEcuScannerTemplateBuilder().create('reference-scanner', ['can-fd'], ['body-ecu']);
    expect(scanner.expectedEcus).toEqual(['body-ecu']);
  });
});
