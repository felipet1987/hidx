/**
 * Related posts via tag overlap.
 *
 * Phase 1: ranks an in-memory candidate list (sourced from Astro `getCollection`)
 * by tag intersection size with the current post.
 *
 * Phase 2 (post-inject-articles loader): swap candidate source to Supabase query
 * `select * from articles where draft = false and tags && {currentTags}`.
 *
 * Pure function — easy to unit-test, no I/O.
 */

export interface Candidate {
  id: string;
  tags: string[];
  data: {
    title: string;
    description: string;
    cover?: string;
    publishedAt?: Date;
  };
}

export interface Ranked extends Candidate {
  overlap: number;
}

/**
 * Returns up to `limit` candidates with the most tag overlap with `currentTags`,
 * excluding the current post by `currentId`. Zero-overlap candidates are omitted.
 */
export function rankByTagOverlap(
  candidates: Candidate[],
  currentId: string,
  currentTags: string[],
  limit = 3,
): Ranked[] {
  if (currentTags.length === 0) return [];
  const tagSet = new Set(currentTags);
  const scored = candidates
    .filter((c) => c.id !== currentId && c.tags.length > 0)
    .map<Ranked>((c) => ({
      ...c,
      overlap: c.tags.reduce((acc, t) => acc + (tagSet.has(t) ? 1 : 0), 0),
    }))
    .filter((c) => c.overlap > 0);
  scored.sort((a, b) => b.overlap - a.overlap);
  return scored.slice(0, limit);
}
