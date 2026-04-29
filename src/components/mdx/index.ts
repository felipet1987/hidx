// Auto-import MDX components by re-exporting here, then map them in PostLayout via <Content components={...} />

export { default as AffiliateLink } from './AffiliateLink.astro';
export { default as Aside } from './Aside.astro';
export { default as Callout } from './Callout.astro';
export { default as CodeDemo } from './CodeDemo.astro';
export { default as CodeDiff } from './CodeDiff.astro';
export { default as CodeTabs } from './CodeTabs.astro';
export { default as Compare } from './Compare.astro';
export { default as Figure } from './Figure.astro';
export { default as Footnotes } from './Footnotes.astro';
export { default as FullBleed } from './FullBleed.astro';
export { default as Gallery } from './Gallery.astro';
export { default as Highlight } from './Highlight.astro';
export { default as Image } from './Image.astro';
export { default as KeyboardKey } from './KeyboardKey.astro';
export { default as Mermaid } from './Mermaid.astro';
export { default as Quote } from './Quote.astro';
export { default as RepoCard } from './RepoCard.astro';
export { default as Spoiler } from './Spoiler.astro';
export { default as Steps } from './Steps.astro';
export { default as Terminal } from './Terminal.astro';
export { default as TipJar } from './TipJar.astro';
export { default as TweetStatic } from './TweetStatic.astro';
export { default as Video } from './Video.astro';
export { default as YouTubeEmbed } from './YouTubeEmbed.astro';

/**
 * Allowed MDX component names. Used by `scripts/validate-mdx.ts` (inject-articles change)
 * to ensure article body_mdx only references components present in this whitelist.
 */
export const MDX_COMPONENT_WHITELIST = [
  'AffiliateLink',
  'Aside',
  'Callout',
  'CodeDemo',
  'CodeDiff',
  'CodeTabs',
  'Compare',
  'Figure',
  'Footnotes',
  'FullBleed',
  'Gallery',
  'Highlight',
  'Image',
  'KeyboardKey',
  'Mermaid',
  'Quote',
  'RepoCard',
  'Spoiler',
  'Steps',
  'Terminal',
  'TipJar',
  'TweetStatic',
  'Video',
  'YouTubeEmbed',
] as const;
