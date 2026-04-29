/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { rankByTagOverlap } from '../../src/lib/related';

const candidates = [
  { id: 'a', tags: ['astro', 'mdx', 'ssg'], data: { title: 'A', description: 'a' } },
  { id: 'b', tags: ['astro'], data: { title: 'B', description: 'b' } },
  { id: 'c', tags: ['rust', 'cli'], data: { title: 'C', description: 'c' } },
  { id: 'd', tags: ['mdx', 'ssg', 'astro'], data: { title: 'D', description: 'd' } },
  { id: 'self', tags: ['astro', 'mdx'], data: { title: 'Self', description: 'self' } },
];

describe('rankByTagOverlap', () => {
  it('excludes the current post by id', () => {
    const ranked = rankByTagOverlap(candidates, 'self', ['astro', 'mdx']);
    expect(ranked.find((r) => r.id === 'self')).toBeUndefined();
  });

  it('orders by overlap count descending', () => {
    const ranked = rankByTagOverlap(candidates, 'self', ['astro', 'mdx', 'ssg']);
    const ids = ranked.map((r) => r.id);
    // a and d both have 3 overlap; b has 1; c has 0
    expect(ids.slice(0, 2).sort()).toEqual(['a', 'd']);
    expect(ids[2]).toBe('b');
  });

  it('omits zero-overlap candidates', () => {
    const ranked = rankByTagOverlap(candidates, 'self', ['astro', 'mdx', 'ssg']);
    expect(ranked.find((r) => r.id === 'c')).toBeUndefined();
  });

  it('honors limit', () => {
    const ranked = rankByTagOverlap(candidates, 'self', ['astro'], 2);
    expect(ranked.length).toBeLessThanOrEqual(2);
  });

  it('returns empty when no current tags provided', () => {
    const ranked = rankByTagOverlap(candidates, 'self', []);
    expect(ranked).toEqual([]);
  });

  it('handles candidates with no tags gracefully', () => {
    const noTags = [...candidates, { id: 'e', tags: [], data: { title: 'E', description: 'e' } }];
    const ranked = rankByTagOverlap(noTags, 'self', ['astro']);
    expect(ranked.find((r) => r.id === 'e')).toBeUndefined();
  });

  it('attaches overlap count', () => {
    const ranked = rankByTagOverlap(candidates, 'self', ['astro', 'mdx']);
    const a = ranked.find((r) => r.id === 'a');
    expect(a?.overlap).toBe(2);
  });
});
