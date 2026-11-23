// Optional hardening: copy only publicly-served files into ./dist so docs, migrations,
// scripts, knowledge sources and tests are NOT reachable on the live site.
// Usage: npm run build:public  → then set wrangler.toml pages_build_output_dir = "dist"
// (Pages Functions are still read from ./functions at the project root.)
import { cpSync, rmSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = new URL('..', import.meta.url).pathname, OUT = join(ROOT, 'dist');
const EXCLUDE = new Set(['dist', 'docs', 'migrations', 'scripts', 'tests', 'knowledge', 'functions', 'node_modules', '.wrangler', '.git', 'package.json', 'package-lock.json', 'wrangler.toml', 'push.bat', '.dev.vars', '.dev.vars.example', '.env', '.env.example', '.gitignore']);
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT);
let n = 0;
for (const name of readdirSync(ROOT)) {
  if (EXCLUDE.has(name) || name.endsWith('.md') || name.startsWith('.dev.vars')) continue;
  cpSync(join(ROOT, name), join(OUT, name), { recursive: true }); n++;
}
console.log(`dist/ built: ${n} top-level entries (docs, migrations, scripts, tests, knowledge excluded)`);
