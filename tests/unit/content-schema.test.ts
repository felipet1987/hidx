import { describe, expect, it } from 'vitest';
import { postSchema, seriesSchema } from '../../src/content/schemas';

describe('postSchema', () => {
  const valid = {
    title: 'How I do X',
    description: 'A short description.',
    publishedAt: '2026-04-28',
    tags: ['ops', 'astro'],
  };

  it('accepts a valid post', () => {
    const result = postSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('coerces publishedAt string to Date', () => {
    const result = postSchema.parse(valid);
    expect(result.publishedAt).toBeInstanceOf(Date);
  });

  it('rejects title over 80 chars', () => {
    const result = postSchema.safeParse({ ...valid, title: 'x'.repeat(81) });
    expect(result.success).toBe(false);
  });

  it('rejects description over 280 chars', () => {
    const result = postSchema.safeParse({ ...valid, description: 'x'.repeat(281) });
    expect(result.success).toBe(false);
  });

  it('rejects empty tags', () => {
    const result = postSchema.safeParse({ ...valid, tags: [] });
    expect(result.success).toBe(false);
  });

  it('rejects more than 6 tags', () => {
    const result = postSchema.safeParse({
      ...valid,
      tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    });
    expect(result.success).toBe(false);
  });

  it('defaults draft to false', () => {
    const result = postSchema.parse(valid);
    expect(result.draft).toBe(false);
  });

  it('accepts optional canonical URL', () => {
    const result = postSchema.safeParse({ ...valid, canonical: 'https://other.dev/post' });
    expect(result.success).toBe(true);
  });

  it('rejects malformed canonical URL', () => {
    const result = postSchema.safeParse({ ...valid, canonical: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});

describe('seriesSchema', () => {
  it('accepts a valid series', () => {
    const result = seriesSchema.safeParse({
      title: 'Inventos caseros',
      description: 'Track de experimentos hands-on para chicos.',
      order: 1,
      lessons: ['catapulta-carton', 'circuito-limon'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative order', () => {
    const result = seriesSchema.safeParse({
      title: 'X',
      description: 'Y',
      order: -1,
      lessons: ['a'],
    });
    expect(result.success).toBe(false);
  });
});
