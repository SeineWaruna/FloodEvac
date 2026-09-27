import * as esbuild from 'esbuild';

async function build() {
  await esbuild.build({
    entryPoints: ['server.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    outfile: 'dist/server.js',
    external: ['express', '@google/genai', 'dotenv', 'firebase-admin', 'vite'],
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
  });
  console.log('Server build complete');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
