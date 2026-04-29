#!/usr/bin/env tsx
/**
 * Scaffold a new STEAM lesson MDX file in src/content/posts/.
 *
 * Usage:
 *   pnpm new:lesson "Catapulta de cartón" \
 *     --steam=E,A \
 *     --age=8-12 \
 *     --difficulty=2 \
 *     --duration=30 \
 *     [--force]
 *
 * Generates frontmatter with all STEAM extension fields + skeleton body
 * exercising MaterialsList, SafetyNote, ExperimentSteps, ParentTip.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lessonSchema } from '../src/content/schemas';

const args = process.argv.slice(2);
const title = args.find((a) => !a.startsWith('--'));
const flag = (name: string): string | undefined =>
  args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const has = (name: string): boolean => args.includes(`--${name}`);

if (!title) {
  console.error('Usage: pnpm new:lesson "Título" [--steam=E,A] [--age=8-12] [--difficulty=2] [--duration=30] [--force]');
  process.exit(1);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

const slug = slugify(title);
const dest = join('src/content/posts', `${slug}.mdx`);

if (existsSync(dest) && !has('force')) {
  console.error(`✗ File exists: ${dest} (use --force to overwrite)`);
  process.exit(1);
}

const steamRaw = flag('steam') ?? '';
const steamCategories = steamRaw
  .split(',')
  .map((s) => s.trim().toUpperCase())
  .filter((s) => ['S', 'T', 'E', 'A', 'M'].includes(s));

const ageRaw = flag('age') ?? '8-12';
const [ageMinStr, ageMaxStr] = ageRaw.split('-');
const ageMin = Number.parseInt(ageMinStr, 10) || 8;
const ageMax = Number.parseInt(ageMaxStr ?? ageMinStr, 10) || ageMin;

const difficulty = Math.max(1, Math.min(5, Number.parseInt(flag('difficulty') ?? '2', 10)));
const durationMinutes = Math.max(1, Number.parseInt(flag('duration') ?? '30', 10));

const today = new Date().toISOString().slice(0, 10);

const frontmatterData = {
  title,
  description: `TODO: descripción 1-280 chars de "${title}".`,
  publishedAt: today,
  tags: ['kids', 'todo'],
  ageMin,
  ageMax,
  difficulty,
  durationMinutes,
  steamCategories,
};

// Validate frontmatter parses against schema (catch typos before writing)
const valid = lessonSchema.safeParse(frontmatterData);
if (!valid.success) {
  console.error('✗ Frontmatter invalid:');
  console.error(valid.error.flatten());
  process.exit(1);
}

const frontmatter = `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(frontmatterData.description)}
publishedAt: ${today}
tags: [${frontmatterData.tags.map((t) => `"${t}"`).join(', ')}]
ageMin: ${ageMin}
ageMax: ${ageMax}
difficulty: ${difficulty}
durationMinutes: ${durationMinutes}
steamCategories: [${steamCategories.map((s) => `"${s}"`).join(', ')}]
draft: true
materials:
  - { name: 'TODO material 1', qty: '1 unidad' }
safetyNotes: []
parentTip: |
  TODO: 2-3 párrafos pedagógicos para padres y maestros con conexión curricular,
  preguntas guía y variantes para extender la actividad.
---`;

const body = `
import {
  MaterialsList, SafetyNote, ExperimentSteps, ParentTip, AgeBadge,
  STEAMBadge, DifficultyStars, DurationBadge, Callout,
} from '../../components/mdx';

<div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin:0.5rem 0 1.5rem;">
  <AgeBadge min={${ageMin}} max={${ageMax}} />
  <STEAMBadge categories={[${steamCategories.map((s) => `'${s}'`).join(', ') || "'E'"}]} />
  <DifficultyStars level={${difficulty}} />
  <DurationBadge minutes={${durationMinutes}} />
</div>

TODO: párrafo introductorio. Hook que despierte curiosidad del chico.

<MaterialsList items={[
  { name: 'TODO material 1', qty: '1 unidad' },
]} />

<SafetyNote type="supervision">
TODO: nota de seguridad relevante.
</SafetyNote>

## Cómo armarlo

<ExperimentSteps steps={[
  { title: 'Paso 1', body: 'TODO: instrucción clara y concisa.' },
  { title: 'Paso 2', body: 'TODO: continuación.' },
  { title: 'Resultado', body: 'TODO: qué tiene que pasar.' },
]} />

## Qué aprendiste

TODO: 1-2 párrafos explicando el concepto STEAM detrás de la actividad,
en lenguaje accesible para chicos.

<Callout type="tip" title="Reto extra">
TODO: variante que extiende la actividad para chicos más curiosos.
</Callout>

<ParentTip>
TODO: contexto pedagógico para padres y maestros (2-3 párrafos).
Mencionar conceptos curriculares conectados, preguntas guía, variantes por edad.
</ParentTip>
`;

writeFileSync(dest, frontmatter + body, 'utf8');

console.log(`✓ Created ${dest}`);
console.log(`  slug:   ${slug}`);
console.log(`  STEAM:  ${steamCategories.join(', ') || '(none yet)'}`);
console.log(`  edad:   ${ageMin}-${ageMax}`);
console.log(`  diff:   ${difficulty}/5`);
console.log(`  min:    ${durationMinutes}`);
console.log(`\n  Next:`);
console.log(`    1. Edit ${dest} (frontmatter description, materials, safety, body)`);
console.log(`    2. Set draft: false when ready to publish`);
console.log(`    3. pnpm dev → http://localhost:4321/rutas/inventos-caseros/${slug}`);
