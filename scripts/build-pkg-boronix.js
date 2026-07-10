import esbuild from 'esbuild';
import fs from 'node:fs';

const outdir = 'dist';
if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true, force: true });
}

// 1. Build index.ts (library)
await esbuild.build({
  entryPoints: ['src/index.ts'],
  outdir,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  external: [
    'tsx',
    'esbuild',
    'chokidar',
    'fsevents',
    'postgres',
    '@libsql/client',
    'drizzle-orm'
  ]
});

// 2. Build worker.ts (dev worker)
await esbuild.build({
  entryPoints: ['src/dev/worker.ts'],
  outdir: 'dist/dev',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  external: [
    'tsx',
    'esbuild',
    'chokidar',
    'fsevents',
    'postgres',
    '@libsql/client',
    'drizzle-orm'
  ]
});

// 3. Build main.ts (CLI) with shebang
await esbuild.build({
  entryPoints: ['src/cli/main.ts'],
  outdir: 'dist/cli',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  external: [
    'tsx',
    'esbuild',
    'chokidar',
    'fsevents',
    'postgres',
    '@libsql/client',
    'drizzle-orm'
  ]
});
