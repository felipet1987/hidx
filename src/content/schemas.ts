import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(160),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string().min(1)).min(1).max(6),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  series: z.string().optional(),
  seriesOrder: z.number().int().nonnegative().optional(),
  canonical: z.url().optional(),
});

export const seriesSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(160),
  order: z.number().int().nonnegative(),
  cover: z.string().optional(),
});

export type Post = z.infer<typeof postSchema>;
export type Series = z.infer<typeof seriesSchema>;
