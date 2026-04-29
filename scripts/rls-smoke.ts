#!/usr/bin/env tsx
/**
 * RLS smoke test.
 * Asserts:
 *   - anon client cannot INSERT into articles
 *   - anon client cannot SELECT draft rows
 *   - anon client CAN SELECT published rows
 *   - service client bypasses RLS for both INSERT and SELECT
 *
 * Run: pnpm tsx scripts/rls-smoke.ts
 * Exit 0 on pass, 1 on fail.
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
import { createAnonClient, createServiceClient } from '../src/lib/supabase';

const ok = (msg: string) => console.log(`✓ ${msg}`);
const fail = (msg: string) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

async function main() {
  const anon = createAnonClient();
  const service = createServiceClient();
  const slug = `rls-smoke-${Date.now()}`;

  // --- Service: INSERT a draft row ---
  const { data: draft, error: insErr } = await service
    .from('articles')
    .insert({
      slug,
      title: 'RLS smoke draft',
      description: 'Should NOT be readable by anon.',
      body_mdx: '# draft',
      tags: ['smoke'],
      draft: true,
    })
    .select()
    .single();
  if (insErr || !draft) fail(`service INSERT draft failed: ${insErr?.message}`);
  ok('service INSERT draft row');

  // --- Anon: SELECT should NOT see draft ---
  const { data: anonDraft } = await anon.from('articles').select('id').eq('slug', slug);
  if (anonDraft && anonDraft.length > 0) fail('anon SHOULD NOT see draft row');
  ok('anon cannot read draft');

  // --- Anon: INSERT should fail ---
  const { error: anonInsErr } = await anon.from('articles').insert({
    slug: `${slug}-anon-attempt`,
    title: 'anon attack',
    description: 'should fail',
    body_mdx: 'x',
    tags: ['x'],
  });
  if (!anonInsErr) fail('anon SHOULD NOT be able to INSERT');
  ok(`anon INSERT blocked (${anonInsErr.code ?? 'no code'})`);

  // --- Service: publish the row ---
  const { error: pubErr } = await service
    .from('articles')
    .update({ draft: false, published_at: new Date().toISOString() })
    .eq('slug', slug);
  if (pubErr) fail(`service publish failed: ${pubErr.message}`);
  ok('service published row');

  // --- Anon: SELECT now sees published row ---
  const { data: anonPub } = await anon.from('articles').select('slug').eq('slug', slug);
  if (!anonPub || anonPub.length === 0) fail('anon SHOULD see published row');
  ok('anon reads published row');

  // --- Cleanup ---
  await service.from('articles').delete().eq('slug', slug);
  ok('service cleanup');

  console.log('\n  All RLS smoke checks passed.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
