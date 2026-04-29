import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema, seriesSchema } from './content/schemas';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: postSchema,
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.{json,yml,yaml}', base: './src/content/series' }),
  schema: seriesSchema,
});

export const collections = { posts, series };
