// Auto-import MDX components by re-exporting here, then map them in PostLayout via <Content components={...} />

export { default as AffiliateLink } from './AffiliateLink.astro';
export { default as Callout } from './Callout.astro';
export { default as CodeDemo } from './CodeDemo.astro';
export { default as Figure } from './Figure.astro';
export { default as Gallery } from './Gallery.astro';
export { default as Image } from './Image.astro';
export { default as Steps } from './Steps.astro';
export { default as TipJar } from './TipJar.astro';
export { default as Video } from './Video.astro';
export { default as YouTubeEmbed } from './YouTubeEmbed.astro';

/**
 * Allowed MDX component names. Used by `scripts/validate-mdx.ts` (inject-articles change)
 * to ensure article body_mdx only references components present in this whitelist.
 */
export const MDX_COMPONENT_WHITELIST = [
  'AffiliateLink',
  'Callout',
  'CodeDemo',
  'Figure',
  'Gallery',
  'Image',
  'Steps',
  'TipJar',
  'Video',
  'YouTubeEmbed',
] as const;
