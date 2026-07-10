import esbuild from 'esbuild';
import fs from 'node:fs';

const outdir = 'dist';
if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true, force: true });
}

await esbuild.build({
  entryPoints: ['src/index.ts'],
  outdir,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  external: [
    'fsevents'
  ]
});
