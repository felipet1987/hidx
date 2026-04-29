import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface RepoData {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
  owner: { avatar_url: string };
}

interface CacheRecord {
  fetchedAt: number;
  data: RepoData;
}

const TTL_MS = 24 * 60 * 60 * 1000; // 24h
let CACHE_DIR = '.cache/github';

function ensureDir() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
}

function cachePath(repo: string): string {
  const key = repo.replace(/[^a-zA-Z0-9._-]/g, '-');
  return join(CACHE_DIR, `${key}.json`);
}

function readCache(repo: string): CacheRecord | null {
  try {
    const raw = readFileSync(cachePath(repo), 'utf8');
    return JSON.parse(raw) as CacheRecord;
  } catch {
    return null;
  }
}

function writeCache(repo: string, data: RepoData): void {
  ensureDir();
  const record: CacheRecord = { fetchedAt: Date.now(), data };
  writeFileSync(cachePath(repo), JSON.stringify(record, null, 2), 'utf8');
}

export async function fetchRepoCached(
  repo: string,
  fetcher: (repo: string) => Promise<RepoData>,
): Promise<RepoData | null> {
  const cached = readCache(repo);
  const now = Date.now();

  // Fresh hit within TTL → return cached
  if (cached && now - cached.fetchedAt < TTL_MS) {
    return cached.data;
  }

  // Cache miss or expired → fetch
  try {
    const fresh = await fetcher(repo);
    writeCache(repo, fresh);
    return fresh;
  } catch {
    // Network failed → return stale cache if available, else null
    return cached?.data ?? null;
  }
}

export const __testing__ = {
  setCacheDir: (dir: string): void => {
    CACHE_DIR = dir;
  },
};
