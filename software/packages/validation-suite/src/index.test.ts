import { describe, expect, it } from 'vitest';
import { createAuraValidationSuite, createDefaultCybersecurityChecklist, createDefaultSafetyChecklist } from './index';

describe('AuraValidationSuite', () => {
  it('passes a complete integration profile', () => {
    const suite = createAuraValidationSuite();
    const safety = createDefaultSafetyChecklist().map((item) => ({ ...item, passed: true }));
    const cyber = createDefaultCybersecurityChecklist().map((item) => ({ ...item, passed: true }));

    const report = suite.validate({
      profileId: 'reference-oem-suv-2032',
      requiredSignals: ['vehicle.speedKph', 'hvac.cabinTempC'],
      mappedSignals: ['vehicle.speedKph', 'hvac.cabinTempC'],
      exposedCommands: ['setTemperature'],
      gatewayProtectedCommands: ['setTemperature'],
      diagnosticsConnectors: ['body-ecu'],
      otaConfigured: true,
      safetyChecklist: safety,
      cybersecurityChecklist: cyber,
    });

    expect(report.ready).toBe(true);
    expect(report.score).toBe(100);
    expect(report.findings).toHaveLength(0);
  });

  it('detects missing signals and unsafe commands', () => {
    const suite = createAuraValidationSuite();
    const report = suite.validate({
      profileId: 'bad-profile',
      requiredSignals: ['vehicle.speedKph'],
      mappedSignals: [],
      exposedCommands: ['unlockDoors'],
      gatewayProtectedCommands: [],
      diagnosticsConnectors: [],
      otaConfigured: false,
      safetyChecklist: [],
      cybersecurityChecklist: [],
    });

    expect(report.ready).toBe(false);
    expect(report.findings.some((finding) => finding.domain === 'signals')).toBe(true);
    expect(report.findings.some((finding) => finding.domain === 'commands')).toBe(true);
  });
});
