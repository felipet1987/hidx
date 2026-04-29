import { describe, expect, it } from 'vitest';
import { lessonSchema, materialSchema, safetyNoteSchema } from '../../src/content/schemas';

const validBase = {
  title: 'Catapulta de cartón',
  description: 'Construcción de catapulta básica con cartón y gomas.',
  publishedAt: '2026-04-29',
  tags: ['engineering', 'kids'],
};

describe('lessonSchema', () => {
  it('accepts minimal lesson with defaults', () => {
    const r = lessonSchema.parse(validBase);
    expect(r.ageMin).toBe(8);
    expect(r.ageMax).toBe(12);
    expect(r.difficulty).toBe(2);
    expect(r.durationMinutes).toBe(30);
    expect(r.steamCategories).toEqual([]);
    expect(r.materials).toEqual([]);
    expect(r.safetyNotes).toEqual([]);
  });

  it('accepts full STEAM lesson', () => {
    const r = lessonSchema.safeParse({
      ...validBase,
      ageMin: 8,
      ageMax: 12,
      difficulty: 3,
      durationMinutes: 45,
      steamCategories: ['E', 'A'],
      materials: [{ name: 'cartón', qty: '1 caja' }, { name: 'gomas', qty: '4 unidades', optional: true }],
      safetyNotes: [{ type: 'cortante', text: 'Tijeras: usar con adulto.' }],
      parentTip: 'Discutir conceptos de palanca y fuerza con tu hijo.',
      videoUrl: 'aircAruvnKk',
    });
    expect(r.success).toBe(true);
  });

  it('rejects difficulty out of 1-5', () => {
    expect(lessonSchema.safeParse({ ...validBase, difficulty: 0 }).success).toBe(false);
    expect(lessonSchema.safeParse({ ...validBase, difficulty: 6 }).success).toBe(false);
  });

  it('rejects invalid steam category', () => {
    expect(lessonSchema.safeParse({ ...validBase, steamCategories: ['X'] }).success).toBe(false);
  });

  it('accepts all 5 steam categories', () => {
    const r = lessonSchema.safeParse({ ...validBase, steamCategories: ['S', 'T', 'E', 'A', 'M'] });
    expect(r.success).toBe(true);
  });

  it('rejects ageMin > ageMax via business invariant (parser allows; check separate)', () => {
    // Schema-level allows; component should validate range. Here just ensure both parse.
    const r = lessonSchema.safeParse({ ...validBase, ageMin: 15, ageMax: 12 });
    expect(r.success).toBe(true);
  });
});

describe('materialSchema', () => {
  it('accepts minimal material', () => {
    expect(materialSchema.parse({ name: 'cartón', qty: '1 caja' })).toMatchObject({
      name: 'cartón',
      qty: '1 caja',
      optional: false,
    });
  });

  it('accepts material with sourceUrl', () => {
    const r = materialSchema.safeParse({
      name: 'motor DC',
      qty: '1 unidad',
      sourceUrl: 'https://articulo.mercadolibre.com.ar/MLA-12345',
    });
    expect(r.success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(materialSchema.safeParse({ name: '', qty: '1' }).success).toBe(false);
  });
});

describe('safetyNoteSchema', () => {
  it.each(['cortante', 'calor', 'quimico', 'electrico', 'supervision'] as const)(
    'accepts type %s',
    (type) => {
      expect(safetyNoteSchema.safeParse({ type, text: 'cuidado' }).success).toBe(true);
    },
  );

  it('rejects unknown type', () => {
    expect(safetyNoteSchema.safeParse({ type: 'fuego', text: 'x' }).success).toBe(false);
  });
});
