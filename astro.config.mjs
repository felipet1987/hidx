// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';

const SITE = 'https://hidx.dev';

// https://astro.build/config
// SSG-only MVP. Switch to `output: 'server'` + Cloudflare adapter when paywall (Capa 4) lands.
export default defineConfig({
  site: SITE,
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/draft/'),
    }),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkGfm],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
