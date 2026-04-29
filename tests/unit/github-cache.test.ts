/**
 * @vitest-environment node
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __testing__, fetchRepoCached } from '../../src/lib/github-cache';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'gh-cache-'));
  __testing__.setCacheDir(dir);
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-04-29T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  rmSync(dir, { recursive: true, force: true });
});

describe('fetchRepoCached', () => {
  const repo = 'astrojs/astro';
  const repoData = {
    full_name: 'astrojs/astro',
    description: 'The web framework for content-driven websites.',
    stargazers_count: 50000,
    language: 'TypeScript',
    html_url: 'https://github.com/astrojs/astro',
    owner: { avatar_url: 'https://avatars.githubusercontent.com/u/44914786' },
  };

  it('fetches from network on cold cache', async () => {
    const fetcher = vi.fn().mockResolvedValue(repoData);
    const result = await fetchRepoCached(repo, fetcher);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(result?.full_name).toBe(repo);
  });

  it('returns cached value within 24h TTL', async () => {
    const fetcher = vi.fn().mockResolvedValue(repoData);
    await fetchRepoCached(repo, fetcher);
    vi.advanceTimersByTime(23 * 60 * 60 * 1000); // 23h
    const result = await fetchRepoCached(repo, fetcher);
    expect(fetcher).toHaveBeenCalledOnce(); // still 1 call
    expect(result?.full_name).toBe(repo);
  });

  it('refetches after 24h TTL expiry', async () => {
    const fetcher = vi.fn().mockResolvedValue(repoData);
    await fetchRepoCached(repo, fetcher);
    vi.advanceTimersByTime(25 * 60 * 60 * 1000); // 25h
    await fetchRepoCached(repo, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('returns null gracefully if fetcher throws on cold cache', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('403 rate limited'));
    const result = await fetchRepoCached(repo, fetcher);
    expect(result).toBeNull();
  });

  it('falls back to stale cache if fetcher fails after expiry', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(repoData);
    await fetchRepoCached(repo, fetcher);
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);
    fetcher.mockRejectedValueOnce(new Error('503'));
    const result = await fetchRepoCached(repo, fetcher);
    expect(result?.full_name).toBe(repo); // returns stale instead of null
  });

  it('handles corrupt cache file by refetching', async () => {
    const cachePath = join(dir, 'astrojs-astro.json');
    writeFileSync(cachePath, '{not valid json');
    const fetcher = vi.fn().mockResolvedValue(repoData);
    const result = await fetchRepoCached(repo, fetcher);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(result?.full_name).toBe(repo);
  });

  it('cache key derived from owner-repo (no path traversal)', async () => {
    const fetcher = vi.fn().mockResolvedValue(repoData);
    await fetchRepoCached('astrojs/astro', fetcher);
    const cachePath = join(dir, 'astrojs-astro.json');
    const parsed = JSON.parse(readFileSync(cachePath, 'utf8'));
    expect(parsed.data.full_name).toBe('astrojs/astro');
  });
});
