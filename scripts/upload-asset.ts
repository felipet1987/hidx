#!/usr/bin/env tsx
/**
 * Upload an asset to Supabase Storage `article-assets` bucket and emit a ready-to-paste
 * MDX `<Image>` snippet to stdout (and copy to clipboard if `pbcopy` is available).
 *
 * Usage:
 *   pnpm upload <file> --slug=my-post [--alt="..."]
 *   pnpm upload ./screenshot.png --slug=astro-perf-tips --alt="Lighthouse score"
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE in `.env.local`.
 */
import { spawn } from 'node:child_process';
import { createReadStream, statSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
import { createServiceClient } from '../src/lib/supabase';

function usage(): never {
  console.error('Usage: pnpm upload <file> --slug=<post-slug> [--alt="..."] [--caption="..."]');
  process.exit(1);
}

const args = process.argv.slice(2);
const fileArg = args.find((a) => !a.startsWith('--'));
const slugArg = args.find((a) => a.startsWith('--slug='))?.split('=')[1];
const altFlag = args.find((a) => a.startsWith('--alt='))?.split('=')[1] ?? '';
const captionFlag = args.find((a) => a.startsWith('--caption='))?.split('=')[1] ?? '';

if (!fileArg || !slugArg) usage();
const filePath: string = fileArg as string;
const slug: string = slugArg as string;

if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error(`Invalid slug "${slug}". Use lowercase letters, digits, hyphens.`);
  process.exit(1);
}

const filename = basename(filePath);
const ext = extname(filename).toLowerCase().slice(1);
const mime =
  (
    {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      avif: 'image/avif',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      mp4: 'video/mp4',
      webm: 'video/webm',
    } as Record<string, string>
  )[ext] ?? 'application/octet-stream';

const stat = statSync(filePath);
if (stat.size > 50 * 1024 * 1024) {
  console.error(`File ${filename} > 50MB. Supabase Storage free tier limit reached.`);
  process.exit(1);
}

async function main() {
  const sb = createServiceClient();
  const remotePath = `${slug}/${filename}`;
  const stream = createReadStream(filePath);

  console.log(`→ uploading ${filePath} (${(stat.size / 1024).toFixed(1)}KB) to article-assets/${remotePath}`);

  const { error } = await sb.storage
    .from('article-assets')
    .upload(remotePath, stream as unknown as Blob, {
      contentType: mime,
      upsert: true,
      duplex: 'half' as never,
    });

  if (error) {
    console.error(`Upload failed: ${error.message}`);
    process.exit(1);
  }

  const { data: urlData } = sb.storage.from('article-assets').getPublicUrl(remotePath);
  const url = urlData.publicUrl;

  const isVideo = mime.startsWith('video/');
  const snippet = isVideo
    ? `<Video sources="${url}" caption="${captionFlag}" />`
    : `<Image src="${url}" alt="${altFlag || 'TODO: describe image'}" ${captionFlag ? `caption="${captionFlag}" ` : ''}width={1280} />`;

  console.log('\n✓ uploaded');
  console.log(`  url: ${url}`);
  console.log(`\n  snippet:\n  ${snippet}\n`);

  // Best-effort clipboard copy on macOS
  try {
    const pb = spawn('pbcopy');
    pb.stdin.write(snippet);
    pb.stdin.end();
    pb.on('exit', () => console.log('  (copied to clipboard)'));
  } catch {
    /* no clipboard — silent */
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
