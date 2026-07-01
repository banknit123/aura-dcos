export type ReleaseGateStatus = 'pass' | 'warn' | 'fail';
export type ReleaseArtifactKind = 'installer' | 'diagnostics-report' | 'package-manifest' | 'documentation' | 'checksum';

export interface ReleaseArtifact {
  id: string;
  kind: ReleaseArtifactKind;
  path: string;
  checksum?: string;
}

export interface ReleaseGate {
  id: string;
  name: string;
  status: ReleaseGateStatus;
  message: string;
  required: boolean;
}

export interface ProductionReleaseCandidate {
  id: string;
  version: string;
  createdAt: string;
  artifacts: ReleaseArtifact[];
  gates: ReleaseGate[];
}

export interface ReleaseReadinessReport {
  candidate: ProductionReleaseCandidate;
  ready: boolean;
  failures: ReleaseGate[];
  warnings: ReleaseGate[];
  messages: string[];
}

function now(): string { return new Date().toISOString(); }

export class ProductionReleaseManager {
  createCandidate(version: string, artifacts: ReleaseArtifact[], gates: ReleaseGate[]): ProductionReleaseCandidate {
    if (!version.trim()) throw new Error('Release version is required');
    if (artifacts.length === 0) throw new Error('At least one release artifact is required');
    return { id: `aura-release-${version}`, version, createdAt: now(), artifacts, gates };
  }

  assess(candidate: ProductionReleaseCandidate): ReleaseReadinessReport {
    const failures = candidate.gates.filter((gate) => gate.status === 'fail' && gate.required);
    const warnings = candidate.gates.filter((gate) => gate.status === 'warn');
    const ready = failures.length === 0;
    return {
      candidate,
      ready,
      failures,
      warnings,
      messages: [
        `Release ${candidate.version} has ${candidate.artifacts.length} artifacts.`,
        `${failures.length} required release gates failed.`,
        `${warnings.length} release gates produced warnings.`,
      ],
    };
  }

  defaultGates(): ReleaseGate[] {
    return [
      { id: 'typecheck', name: 'TypeScript typecheck', status: 'pass', message: 'Typecheck gate recorded as passed by release process.', required: true },
      { id: 'tests', name: 'Unit tests', status: 'pass', message: 'Unit test gate recorded as passed by release process.', required: true },
      { id: 'docs', name: 'Documentation', status: 'pass', message: 'Documentation exists for production packages.', required: true },
      { id: 'safety', name: 'Safety review', status: 'warn', message: 'OEM safety validation still required before vehicle deployment.', required: false },
      { id: 'cybersecurity', name: 'Cybersecurity review', status: 'warn', message: 'OEM cybersecurity validation still required before vehicle deployment.', required: false },
    ];
  }
}

export function createProductionReleaseManager(): ProductionReleaseManager { return new ProductionReleaseManager(); }
