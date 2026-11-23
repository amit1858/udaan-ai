import { createRequire } from 'node:module';
import { access, lstat, mkdir, readFile, realpath, rename, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.env.LOCAL_RUNTIME_ROOT;
if (!root || !path.isAbsolute(root)) throw new Error('Set absolute private LOCAL_RUNTIME_ROOT.');
const repository = await realpath(path.resolve(import.meta.dirname, '..', '..', '..'));
const relativeRoot = path.relative(repository, await realpath(root));
if (!relativeRoot || (!path.isAbsolute(relativeRoot) && relativeRoot !== '..'
  && !relativeRoot.startsWith('..' + path.sep))) {
  throw new Error('Runtime dependencies must be outside the repository.');
}
const source = path.join(root, 'source');
const require = createRequire(import.meta.url);
const { parse } = require(path.join(source, 'node_modules', '.pnpm', 'yaml@2.9.1', 'node_modules', 'yaml'));
const lock = parse(await readFile(path.join(source, 'pnpm-lock.yaml'), 'utf8'));
const output = path.join(root, 'dependencies');
const replacement = {
  '@anthropic-ai/sdk': '1.9.0', openai: '7.57.0', standardwebhooks: '1.1.1', terser: '5.51.2',
  '@babel/generator': '7.29.14', '@babel/helper-string-parser': '7.29.14',
  '@babel/helper-wrap-function': '7.29.14', '@babel/parser': '7.29.14',
  '@babel/plugin-transform-block-scoping': '7.29.13',
  '@babel/plugin-transform-computed-properties': '7.29.7',
  '@babel/plugin-transform-duplicate-keys': '7.29.7',
  '@babel/plugin-transform-explicit-resource-management': '7.29.7',
  '@babel/plugin-transform-export-namespace-from': '7.29.7',
  '@babel/plugin-transform-for-of': '7.29.13',
  '@babel/plugin-transform-modules-systemjs': '7.29.8',
  '@babel/plugin-transform-regenerator': '7.29.8',
  '@babel/plugin-transform-spread': '7.29.11',
  '@babel/traverse': '7.29.14', '@babel/types': '7.29.14',
};
const dependencies = {};
const workspaces = [];
const requiredImporters = new Set([
  'artifacts/api-server', 'artifacts/udaan-ai',
  'lib/api-client-react', 'lib/api-zod', 'lib/db',
]);
for (const [relative, importer] of Object.entries(lock.importers)) {
  if (!requiredImporters.has(relative)) continue;
  const directory = path.join(source, ...relative.split('/'));
  const manifest = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
  workspaces.push({ name: manifest.name, directory });
  const entries = { ...importer.dependencies };
  if (relative === 'artifacts/udaan-ai') Object.assign(entries, importer.devDependencies);
  if (relative === 'artifacts/api-server') {
    for (const name of ['prisma', 'tsx', 'esbuild']) entries[name] = importer.devDependencies[name];
  }
  for (const [name, descriptor] of Object.entries(entries)) {
    if (!descriptor || descriptor.version.startsWith('link:')) continue;
    const version = replacement[name] ?? descriptor.version.split('(')[0];
    if (dependencies[name] && dependencies[name] !== version) {
      throw new Error(`Conflicting runtime versions for ${name}.`);
    }
    dependencies[name] = version;
  }
}
dependencies.typescript = '5.9.3';
Object.assign(dependencies, {
  '@esbuild/win32-x64': '0.28.2', '@rollup/rollup-win32-x64-msvc': '4.64.5',
  'lightningcss-win32-x64-msvc': '1.32.0', '@tailwindcss/oxide-win32-x64-msvc': '4.3.3',
});
const overrides = { ...replacement, ...dependencies };
const versions = new Map();
for (const spec of Object.keys(lock.packages)) {
  const at = spec.lastIndexOf('@');
  const name = spec.slice(0, at);
  const version = spec.slice(at + 1);
  if (version.includes('(') || !/^\d/.test(version)) continue;
  if (!versions.has(name)) versions.set(name, new Set());
  versions.get(name).add(version);
}
for (const [name, lockedVersions] of versions) {
  if (overrides[name]) continue;
  if (lockedVersions.size === 1) {
    overrides[name] = [...lockedVersions][0];
  } else {
    for (const version of lockedVersions) overrides[`${name}@${version}`] = version;
  }
}
await mkdir(output, { recursive: true });
await writeFile(path.join(output, 'package.json'), JSON.stringify({
  name: 'udaan-isolated-runtime', private: true, version: '0.0.0', type: 'module',
  dependencies, overrides,
}, null, 2) + '\n');
await writeFile(path.join(output, 'compatibility.json'), JSON.stringify({
  originalSourceCommit: 'de9283e1c8a1d08cf62fd9832e0d14df84749d43',
  appSourceChanged: false, runtimeDependencyChanges: replacement,
  excluded: ['root lint tooling', 'Vitest', 'API specification generation'],
  nativePlatform: 'Windows x64 Node on Windows',
}, null, 2) + '\n');
if (process.env.LINK_LOCAL_DEPENDENCIES === 'true') {
  const modules = path.join(output, 'node_modules');
  await access(path.join(modules, 'prisma', 'package.json'));
  for (const workspace of workspaces) {
    const alias = path.join(modules, ...workspace.name.split('/'));
    await mkdir(path.dirname(alias), { recursive: true });
    try { await lstat(alias); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await symlink(workspace.directory, alias, 'junction');
    }
    const localModules = path.join(workspace.directory, 'node_modules');
    try {
      const existing = await lstat(localModules);
      if (existing.isSymbolicLink()) continue;
      await rename(localModules, localModules + '.pre-compatibility');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await symlink(modules, localModules, 'junction');
  }
}
console.log(`Prepared private runtime dependency manifest: ${Object.keys(dependencies).length} direct packages.`);
