export interface Author {
  id: string;
  name: string;
  bio: string;
  avatarSvg?: string;     // inline SVG markup (preferred — zero requests)
  avatarUrl?: string;     // fallback URL
  github?: string;
  mastodon?: string;
  bluesky?: string;
  url?: string;
}

const monogram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="48" height="48"><defs><linearGradient id="ag" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="oklch(0.78 0.14 200)"/><stop offset="1" stop-color="oklch(0.72 0.18 295)"/></linearGradient></defs><rect x="1" y="1" width="30" height="30" rx="7" fill="url(#ag)"/><text x="16" y="22" font-family="Inter, system-ui" font-size="18" font-weight="800" fill="white" text-anchor="middle">F</text></svg>`;

export const authors: Record<string, Author> = {
  felipe: {
    id: 'felipe',
    name: 'Felipe Talavera',
    bio: 'Arquitecto de software + papá curioso. Diseño experimentos STEAM hands-on para chicos LatAm con materiales caseros. Misión: complementar Khan Academy donde flaquea — voz local + manos sucias.',
    avatarSvg: monogram,
    github: 'felipet1987',
    url: 'https://hidx.dev/about',
  },
};

export function getAuthor(id: string): Author | null {
  return authors[id] ?? null;
}

export const DEFAULT_AUTHOR_ID = 'felipe';
