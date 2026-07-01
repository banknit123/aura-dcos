import { describe, expect, it } from 'vitest';
import { createProductionReleaseManager } from './index';

describe('ProductionReleaseManager', () => {
  it('creates and assesses release candidates', () => {
    const manager = createProductionReleaseManager();
    const candidate = manager.createCandidate('1.0.0', [{ id: 'manifest', kind: 'package-manifest', path: 'dist/manifest.json' }], manager.defaultGates());
    const report = manager.assess(candidate);

    expect(candidate.id).toBe('aura-release-1.0.0');
    expect(report.ready).toBe(true);
    expect(report.warnings).toHaveLength(2);
  });

  it('blocks readiness when a required gate fails', () => {
    const manager = createProductionReleaseManager();
    const candidate = manager.createCandidate('1.0.1', [{ id: 'manifest', kind: 'package-manifest', path: 'dist/manifest.json' }], [
      { id: 'tests', name: 'Unit tests', status: 'fail', message: 'Tests failed.', required: true },
    ]);
    expect(manager.assess(candidate).ready).toBe(false);
  });
});
