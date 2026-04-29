// Auto-import MDX components by re-exporting here, then map them in PostLayout via <Content components={...} />
//
// Two groups:
// - ACTIVE: STEAM lesson components used in YachayTree lessons
// - DEPRECATED: dev-era components kept for potential future "code para chicos" route

// ====== ACTIVE ======

// Reused from previous era (relevantes STEAM)
export { default as Aside } from './Aside.astro';
export { default as Callout } from './Callout.astro';
export { default as Compare } from './Compare.astro';
export { default as Figure } from './Figure.astro';
export { default as Footnotes } from './Footnotes.astro';
export { default as FullBleed } from './FullBleed.astro';
export { default as Gallery } from './Gallery.astro';
export { default as Highlight } from './Highlight.astro';
export { default as Image } from './Image.astro';
export { default as KeyboardKey } from './KeyboardKey.astro';
export { default as Quote } from './Quote.astro';
export { default as Spoiler } from './Spoiler.astro';
export { default as Steps } from './Steps.astro';
export { default as TipJar } from './TipJar.astro';
export { default as Video } from './Video.astro';
export { default as YouTubeEmbed } from './YouTubeEmbed.astro';

// New STEAM lesson components
export { default as AgeBadge } from './AgeBadge.astro';
export { default as DifficultyStars } from './DifficultyStars.astro';
export { default as DurationBadge } from './DurationBadge.astro';
export { default as ExperimentSteps } from './ExperimentSteps.astro';
export { default as MaterialsList } from './MaterialsList.astro';
export { default as MercadoLibreProduct } from './MercadoLibreProduct.astro';
export { default as ParentTip } from './ParentTip.astro';
export { default as PrintablePDFButton } from './PrintablePDFButton.astro';
export { default as SafetyNote } from './SafetyNote.astro';
export { default as STEAMBadge } from './STEAMBadge.astro';

// ====== DEPRECATED — defer Fase 2 "Programación para chicos" track ======
// Files kept on disk; not exported in WHITELIST until reactivated.
// AffiliateLink, CodeDemo, CodeDiff, CodeTabs, Mermaid, RepoCard, Terminal, TweetStatic, Compare

/**
 * Allowed MDX component names. Used by `scripts/validate-mdx.ts` to ensure
 * lesson body_mdx only references components present in this whitelist.
 */
export const MDX_COMPONENT_WHITELIST = [
  // Reused
  'Aside',
  'Callout',
  'Compare',
  'Figure',
  'Footnotes',
  'FullBleed',
  'Gallery',
  'Highlight',
  'Image',
  'KeyboardKey',
  'Quote',
  'Spoiler',
  'Steps',
  'TipJar',
  'Video',
  'YouTubeEmbed',
  // STEAM new
  'AgeBadge',
  'DifficultyStars',
  'DurationBadge',
  'ExperimentSteps',
  'MaterialsList',
  'MercadoLibreProduct',
  'ParentTip',
  'PrintablePDFButton',
  'SafetyNote',
  'STEAMBadge',
] as const;

/**
 * Components retained on disk but excluded from WHITELIST.
 * Reactivable cuando llegue track "Programación para chicos" o futuras dev rutas.
 */
export const MDX_COMPONENT_DEPRECATED = [
  'AffiliateLink',
  'CodeDemo',
  'CodeDiff',
  'CodeTabs',
  'Mermaid',
  'RepoCard',
  'Terminal',
  'TweetStatic',
] as const;
