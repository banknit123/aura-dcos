import { existsSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const mode = process.argv[2] === 'build' ? 'build' : 'typecheck';
const root = process.cwd();
const workspaceRoots = [join(root, 'software', 'packages'), join(root, 'software', 'apps')];
const failures = [];

function workspaceDirs() {
  const dirs = [];
  for (const workspaceRoot of workspaceRoots) {
    if (!existsSync(workspaceRoot)) continue;
    for (const entry of readdirSync(workspaceRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = join(workspaceRoot, entry.name);
      if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'tsconfig.json'))) dirs.push(dir);
    }
  }
  return dirs;
}

function executable(name) {
  return process.platform === 'win32' ? `${name}.cmd` : name;
}

function run(command, args, cwd) {
  const result = spawnSync(executable(command), args, { cwd, stdio: 'inherit', shell: false });
  return result.status ?? 1;
}

for (const dir of workspaceDirs()) {
  const isStudio = dir.endsWith(join('software', 'apps', 'studio'));
  const tempConfig = join(dir, '.aura-tsconfig.json');
  const relativeBase = relative(dir, join(root, 'tsconfig.base.json')).replaceAll('\\', '/');
  const config = {
    extends: relativeBase,
    compilerOptions: {
      outDir: 'dist',
      rootDir: 'src',
      noEmit: mode === 'typecheck' || isStudio,
      declaration: !isStudio,
      jsx: isStudio ? 'react-jsx' : undefined,
      lib: isStudio ? ['DOM', 'DOM.Iterable', 'ES2022'] : ['ES2022'],
      isolatedModules: isStudio || undefined,
    },
    include: ['src/**/*.ts', 'src/**/*.tsx'],
    exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'dist', 'node_modules'],
  };

  if (!isStudio) {
    delete config.compilerOptions.jsx;
    delete config.compilerOptions.isolatedModules;
  }

  writeFileSync(tempConfig, `${JSON.stringify(config, null, 2)}\n`);
  const label = relative(root, dir).replaceAll('\\', '/');
  console.log(`\nAURA ${mode}: ${label}`);
  const status = run('npx', ['tsc', '-p', tempConfig], root);
  rmSync(tempConfig, { force: true });

  if (status !== 0) failures.push(label);

  if (status === 0 && mode === 'build' && isStudio) {
    const viteStatus = run('npx', ['vite', 'build'], dir);
    if (viteStatus !== 0) failures.push(`${label} vite`);
  }
}

if (failures.length > 0) {
  console.error(`\nAURA ${mode} failed:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nAURA ${mode} passed.`);
