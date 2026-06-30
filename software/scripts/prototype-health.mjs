import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const checks = [
  ['Studio app', 'software/apps/studio/src/main.tsx'],
  ['AURA Director', 'software/apps/studio/src/AuraDirector.tsx'],
  ['AURA Brain panel', 'software/apps/studio/src/BrainPanel.tsx'],
  ['Companion panel', 'software/apps/studio/src/CompanionPanel.tsx'],
  ['Calibration output', 'software/apps/studio/src/CalibrationOutput.tsx'],
  ['Output manager', 'software/packages/output-manager/src/index.ts'],
  ['AURA Brain engine', 'software/packages/brain/src/index.ts'],
  ['Companion engine', 'software/packages/companion/src/index.ts'],
  ['Profile store', 'software/packages/profile-store/src/index.ts'],
  ['Hardware guide', 'docs/software/phase-g-hardware-run-guide.md'],
  ['Windows launcher', 'software/scripts/run-studio-windows.bat'],
  ['macOS launcher', 'software/scripts/run-studio-mac.sh'],
];

const missing = checks.filter(([, path]) => !existsSync(join(root, path)));

console.log('AURA Prototype Health Check');
console.log('===========================');
for (const [name, path] of checks) {
  const ok = existsSync(join(root, path));
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} - ${path}`);
}

if (missing.length > 0) {
  console.error('\nPrototype health check failed.');
  process.exit(1);
}

console.log('\nPrototype health check passed.');
