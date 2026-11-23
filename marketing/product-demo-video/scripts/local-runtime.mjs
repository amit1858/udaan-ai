import EmbeddedPostgres from 'embedded-postgres';
import { randomBytes } from 'node:crypto';
import { createServer, request as httpRequest } from 'node:http';
import { createRequire } from 'node:module';
import { access, mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.env.LOCAL_RUNTIME_ROOT;
if (!root || !path.isAbsolute(root)) throw new Error('Set absolute LOCAL_RUNTIME_ROOT outside the repository.');
const repository = await realpath(path.resolve(import.meta.dirname, '..', '..', '..'));
const resolvedRoot = await realpath(root);
const relativeRoot = path.relative(repository, resolvedRoot);
if (!relativeRoot || (!path.isAbsolute(relativeRoot) && relativeRoot !== '..'
  && !relativeRoot.startsWith('..' + path.sep))) {
  throw new Error('Runtime extraction and database must be outside the repository.');
}
const source = path.join(root, 'source');
const databaseDir = path.join(root, 'postgres-data');
const artifacts = path.join(root, 'evidence');
const ports = { database: 55432, backend: 4318, browser: 4317 };
const database = 'udaan_demo_local';
const requireApi = createRequire(path.join(source, 'artifacts', 'api-server', 'package.json'));
const requireFrontend = createRequire(path.join(source, 'artifacts', 'udaan-ai', 'package.json'));
// Fail incomplete tagged installs before initializing any local database.
const prismaCli = requireApi.resolve('prisma/build/index.js');
const tsxApi = requireApi.resolve('tsx/esm/api');
const viteCli = path.join(path.dirname(requireFrontend.resolve('vite/package.json')), 'bin', 'vite.js');
requireApi.resolve('@anthropic-ai/sdk');
requireApi.resolve('openai');
requireFrontend.resolve('@vitejs/plugin-react');
requireFrontend.resolve('@tailwindcss/vite');
const allowedEnv = ['PATH', 'SystemRoot', 'WINDIR', 'COMSPEC', 'TEMP', 'TMP',
  'USERPROFILE', 'LOCALAPPDATA', 'APPDATA', 'PATHEXT'];
const cleanEnv = Object.fromEntries(allowedEnv.filter((name) => process.env[name]).map((name) => [name, process.env[name]]));
for (const name of Object.keys(process.env)) delete process.env[name];
Object.assign(process.env, cleanEnv, {
  NODE_ENV: 'production', BASE_PATH: '/', PORT: String(ports.backend),
  ALLOW_PAID_API_CALLS: 'false', MAX_PAID_API_CALLS: '0',
  PRODUCTION_AI_ENABLED: 'false', ENABLE_SARVAM_LAB: 'false',
  SESSION_SECRET: randomBytes(32).toString('hex'),
});
await mkdir(artifacts, { recursive: true });
const password = randomBytes(32).toString('hex');
process.env.DATABASE_URL = `postgresql://postgres:${password}@127.0.0.1:${ports.database}/${database}`;
const target = new URL(process.env.DATABASE_URL);
if (target.hostname !== '127.0.0.1' || target.port !== String(ports.database)
  || target.pathname !== '/' + database) throw new Error('Non-local database target rejected.');

const pg = new EmbeddedPostgres({
  databaseDir, user: 'postgres', password, port: ports.database, persistent: true,
  createPostgresUser: false, autoRehydrateSymlinks: true, authMethod: 'scram-sha-256',
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  postgresFlags: ['-h', '127.0.0.1'],
});
const run = (args, env = process.env) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, args, { cwd: source, env, stdio: 'inherit' });
  child.once('error', reject);
  child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`Local preparation command exited ${code}.`)));
});
let backend;
let proxy;
let prisma;
let stopping = false;
let databaseStarted = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (proxy) await new Promise((resolve) => proxy.close(resolve));
  if (backend) await new Promise((resolve) => backend.close(resolve));
  if (prisma) await prisma.$disconnect();
  if (databaseStarted) await pg.stop();
  delete process.env.DATABASE_URL;
  delete process.env.SESSION_SECRET;
}
process.once('SIGINT', () => { stop().then(() => process.exit(0), () => process.exit(1)); });
process.once('SIGTERM', () => { stop().then(() => process.exit(0), () => process.exit(1)); });
try {
  try { await access(path.join(databaseDir, 'PG_VERSION')); throw new Error('Use a fresh runtime directory; existing database is not overwritten.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await pg.initialise();
  await pg.start();
  databaseStarted = true;
  const admin = pg.getPgClient('postgres', '127.0.0.1');
  await admin.connect();
  await admin.query('CREATE DATABASE udaan_demo_local');
  await admin.end();
  await run([prismaCli, 'generate', '--schema', path.join(source, 'artifacts', 'api-server', 'prisma', 'schema.prisma')]);
  await run([prismaCli, 'migrate', 'deploy', '--schema', path.join(source, 'artifacts', 'api-server', 'prisma', 'schema.prisma')]);
  await run([viteCli, 'build', '--config',
    path.join(source, 'artifacts', 'udaan-ai', 'vite.config.ts')], { ...process.env, PORT: String(ports.browser) });

  // No external provider fetch can leave this isolated application process.
  const originalFetch = globalThis.fetch;
  const blocked = [];
  globalThis.fetch = (input, options) => {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
      blocked.push({ origin: url.origin, pathname: url.pathname });
      return Promise.reject(new Error('External requests are disabled for the isolated local demonstration.'));
    }
    return originalFetch(input, options);
  };
  const { tsImport } = await import(pathToFileURL(tsxApi).href);
  const module = await tsImport(path.join(source, 'artifacts', 'api-server', 'src', 'app.ts'), import.meta.url);
  const db = await tsImport(path.join(source, 'artifacts', 'api-server', 'src', 'udaan', 'db.ts'), import.meta.url);
  prisma = db.prisma;
  await db.seedSales();
  backend = module.default.listen(ports.backend, '127.0.0.1');
  await new Promise((resolve, reject) => { backend.once('listening', resolve); backend.once('error', reject); });
  const staticRoot = path.join(source, 'artifacts', 'udaan-ai', 'dist', 'public');
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.webmanifest': 'application/manifest+json',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
  proxy = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://127.0.0.1:${ports.browser}`);
      if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
        const upstream = httpRequest({
          hostname: '127.0.0.1', port: ports.backend, method: req.method, path: req.url,
          headers: { ...req.headers, 'x-forwarded-host': `127.0.0.1:${ports.browser}`, 'x-forwarded-proto': 'http' },
        }, (response) => { res.writeHead(response.statusCode, response.headers); response.pipe(res); });
        upstream.on('error', (error) => { console.error('Local proxy request failed:', error.message); res.writeHead(502, { 'Content-Type': 'application/json' }); res.end('{"error":"Local backend unavailable"}'); });
        req.pipe(upstream);
        return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      let file = path.resolve(staticRoot, relative || 'index.html');
      if (file !== staticRoot && !file.startsWith(staticRoot + path.sep)) { res.writeHead(403); res.end(); return; }
      try { if (!(await stat(file)).isFile()) file = path.join(staticRoot, 'index.html'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; file = path.join(staticRoot, 'index.html'); }
      const bytes = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch (error) {
      console.error('Local static request failed:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end('{"error":"Local static serving failed"}');
    }
  });
  proxy.listen(ports.browser, '127.0.0.1');
  await new Promise((resolve, reject) => { proxy.once('listening', resolve); proxy.once('error', reject); });
  const check = pg.getPgClient(database, '127.0.0.1');
  await check.connect();
  const info = await check.query("SELECT version(), current_database(), inet_server_addr()::text AS address");
  await check.end();
  await writeFile(path.join(artifacts, 'runtime.json'), JSON.stringify({
    sourceCommit: 'de9283e1c8a1d08cf62fd9832e0d14df84749d43',
    environment: 'isolated-local-prototype', ports, database: info.rows[0],
    providerKeysLoaded: false, paidCallsEnabled: false, host: '127.0.0.1',
    startedAt: new Date().toISOString(), pgPid: pg.process?.pid, nodePid: process.pid,
  }, null, 2));
  console.log(`LOCAL DEMO READY http://127.0.0.1:${ports.browser} (synthetic data, paid providers disabled)`);
  const interval = setInterval(async () => {
    try {
      await access(path.join(root, 'STOP'));
      clearInterval(interval);
      await writeFile(path.join(artifacts, 'blocked-provider-fetches.json'), JSON.stringify(blocked, null, 2));
      await stop();
      process.exit(0);
    } catch (error) {
      if (error.code !== 'ENOENT') { console.error('Local runtime stop failed:', error.message); clearInterval(interval); await stop(); process.exit(1); }
    }
  }, 1000);
} catch (error) {
  console.error(error.message);
  await stop();
  process.exitCode = 1;
}
