// Builds MindMystery in Vercel's Build Output API v3 format (.vercel/output):
//   static/            the Vite SPA
//   functions/api.func the whole Express API bundled into one Node.js serverless function
//   config.json        routing: /api/* -> function, assets cached, everything else -> SPA
import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '.vercel', 'output');
const fnDir = path.join(out, 'functions', 'api.func');

execSync('npx vite build', { cwd: root, stdio: 'inherit' });

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(fnDir, { recursive: true });
fs.cpSync(path.join(root, 'dist'), path.join(out, 'static'), { recursive: true });

await build({
  entryPoints: [path.join(root, 'server', 'vercelHandler.ts')],
  outfile: path.join(fnDir, 'index.js'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  sourcemap: false,
  minify: false,
  logLevel: 'info',
  // Expose the default export as module.exports so the Node launcher finds the handler.
  footer: { js: 'module.exports = module.exports.default || module.exports;' },
});

fs.writeFileSync(path.join(fnDir, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2));
fs.writeFileSync(
  path.join(fnDir, '.vc-config.json'),
  JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.js',
      launcherType: 'Nodejs',
      shouldAddHelpers: false,
      maxDuration: 60,
    },
    null,
    2
  )
);

fs.writeFileSync(
  path.join(out, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        {
          src: '^/assets/(.*)$',
          headers: { 'cache-control': 'public, max-age=31536000, immutable' },
          continue: true,
        },
        { src: '^/api/?(.*)$', dest: '/api?__path=$1' },
        { handle: 'filesystem' },
        { src: '^/(.*)$', dest: '/index.html' },
      ],
    },
    null,
    2
  )
);

console.log('\n.vercel/output ready (static site + api function).');
