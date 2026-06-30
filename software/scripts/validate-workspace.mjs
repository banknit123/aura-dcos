import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const packageRoots = [join(root, 'software', 'packages'), join(root, 'software', 'apps')];
const requiredRootFiles = ['README.md', 'package.json'];
const errors = [];

for (const file of requiredRootFiles) {
  if (!existsSync(join(root, file))) errors.push(`Missing root file: ${file}`);
}

for (const packageRoot of packageRoots) {
  if (!existsSync(packageRoot)) {
    errors.push(`Missing workspace directory: ${packageRoot}`);
    continue;
  }

  for (const entry of readdirSync(packageRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const workspacePath = join(packageRoot, entry.name);
    const packageJsonPath = join(workspacePath, 'package.json');
    const tsconfigPath = join(workspacePath, 'tsconfig.json');

    if (!existsSync(packageJsonPath)) {
      errors.push(`Missing package.json: ${workspacePath}`);
      continue;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.name) errors.push(`Missing package name: ${packageJsonPath}`);
    if (!packageJson.scripts?.build) errors.push(`Missing build script: ${packageJsonPath}`);
    if (!packageJson.scripts?.typecheck) errors.push(`Missing typecheck script: ${packageJsonPath}`);

    if (!existsSync(tsconfigPath)) errors.push(`Missing tsconfig.json: ${workspacePath}`);
  }
}

if (errors.length > 0) {
  console.error('AURA workspace validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('AURA workspace validation passed.');
