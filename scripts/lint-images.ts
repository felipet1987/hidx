#!/usr/bin/env tsx
/**
 * Image weight linter.
 * Walks `src/`, `public/` and warns (or fails) when any image > BUDGET bytes.
 *
 * Usage:
 *   pnpm tsx scripts/lint-images.ts          # warn only, exit 0
 *   pnpm tsx scripts/lint-images.ts --strict # fail with exit 1 on violations
 */
import { readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const BUDGET = 200 * 1024; // 200 KB
const EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif']);
const SCAN_DIRS = ['src', 'public'];

const strict = process.argv.includes('--strict');
const offenders: Array<{ path: string; size: number }> = [];

function walk(dir: string) {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (EXTS.has(extname(name).toLowerCase())) {
      if (st.size > BUDGET) offenders.push({ path: full, size: st.size });
    }
  }
}

for (const d of SCAN_DIRS) walk(d);

if (offenders.length === 0) {
  console.log(`✓ All images under ${BUDGET / 1024}KB`);
  process.exit(0);
}

console.warn(`\n⚠ ${offenders.length} image(s) exceed ${BUDGET / 1024}KB budget:\n`);
for (const { path, size } of offenders.sort((a, b) => b.size - a.size)) {
  console.warn(`  ${(size / 1024).toFixed(0).padStart(6)}KB  ${path}`);
}
console.warn('\n  Suggestion: run an optimizer (squoosh, sharp) or upload to Supabase Storage with --resize.\n');

process.exit(strict ? 1 : 0);
