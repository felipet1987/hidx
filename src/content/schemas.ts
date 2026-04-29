import { z } from 'zod';

/** STEAM categories: Science / Technology / Engineering / Arts / Math */
export const steamCategoryEnum = z.enum(['S', 'T', 'E', 'A', 'M']);
export type STEAMCategory = z.infer<typeof steamCategoryEnum>;

/** Single material line item for a hands-on lesson. */
export const materialSchema = z.object({
  name: z.string().min(1).max(80),
  qty: z.string().min(1).max(40),
  optional: z.boolean().default(false),
  sourceUrl: z.url().optional(),
});
export type Material = z.infer<typeof materialSchema>;

/** Safety note types for lesson activities. */
export const safetyNoteTypeEnum = z.enum([
  'cortante',
  'calor',
  'quimico',
  'electrico',
  'supervision',
]);
export type SafetyNoteType = z.infer<typeof safetyNoteTypeEnum>;

export const safetyNoteSchema = z.object({
  type: safetyNoteTypeEnum,
  text: z.string().min(1).max(280),
});
export type SafetyNote = z.infer<typeof safetyNoteSchema>;

/**
 * Lesson schema (extends previous postSchema base with STEAM-specific optional fields).
 * Backwards-compatible: lessons without STEAM extras parse fine with sane defaults.
 */
export const lessonSchema = z.object({
  // Base fields (compatible with previous postSchema)
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(280),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string().min(1)).min(1).max(6),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  series: z.string().optional(),
  seriesOrder: z.number().int().nonnegative().optional(),
  canonical: z.url().optional(),
  // STEAM extension
  ageMin: z.number().int().min(0).max(99).default(8),
  ageMax: z.number().int().min(0).max(99).default(12),
  difficulty: z.number().int().min(1).max(5).default(2),
  durationMinutes: z.number().int().min(1).max(600).default(30),
  steamCategories: z.array(steamCategoryEnum).max(5).default([]),
  materials: z.array(materialSchema).default([]),
  safetyNotes: z.array(safetyNoteSchema).default([]),
  parentTip: z.string().max(2000).optional(),
  videoUrl: z.string().max(40).optional(),
  printablePdf: z.url().optional(),
});
export type Lesson = z.infer<typeof lessonSchema>;

/** Track / Ruta (curated path of lessons). */
export const trackSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(280),
  order: z.number().int().nonnegative().default(0),
  cover: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  steamCategories: z.array(steamCategoryEnum).max(5).default([]),
  /** Ordered list of lesson slugs that compose this track. */
  lessons: z.array(z.string().min(1)).min(1).max(50),
  ageMin: z.number().int().min(0).max(99).default(8),
  ageMax: z.number().int().min(0).max(99).default(12),
});
export type Track = z.infer<typeof trackSchema>;

// Backwards-compat aliases (until consumers migrate)
export const postSchema = lessonSchema;
export const seriesSchema = trackSchema;
export type Post = Lesson;
export type Series = Track;
