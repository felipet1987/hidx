# MDX Components Catalog

24 components disponibles en posts hidx. Todos en `src/components/mdx/`. Whitelist en `src/components/mdx/index.ts`.

> Importá lo que uses al inicio del MDX:
> ```mdx
> import { Callout, CodeTabs, Image } from '../../components/mdx';
> ```

---

## Visual

### `Image`

Imagen optimizada (Astro Image pipeline para local, native `<img>` para remote).

| Prop | Tipo | Notas |
|------|------|-------|
| `src` | string | URL absoluta o `/public/...` |
| `alt` | string | **REQUERIDO** — accesibilidad |
| `caption` | string? | Pie opcional |
| `width` | number? | Default 1280 |
| `height` | number? | Default `width × 9/16` |
| `fullBleed` | boolean? | Rompe el contenedor prose |
| `loading` | `'lazy' \| 'eager'` | Default `lazy` |

```mdx
<Image src="https://..." alt="Diagrama del pipeline" caption="Pipeline build hidx" width={1280} />
```

### `Video`

`<video>` self-hosted con poster y múltiples sources.

```mdx
<Video sources={[{ src: '/v.mp4', type: 'video/mp4' }]} poster="/p.png" caption="..." />
<!-- o simple: -->
<Video sources="/v.mp4" />
```

### `YouTubeEmbed`

Privacy-first: muestra thumbnail, carga iframe `youtube-nocookie.com` solo on click.

```mdx
<YouTubeEmbed id="aircAruvnKk" title="Neural networks — 3Blue1Brown" />
```

### `Gallery`

Grid de imágenes + lightbox `<dialog>` con teclado nav (Esc, ←, →).

```mdx
<Gallery cols={3} items={[
  { src: '/a.jpg', alt: '...', caption: '...' },
  { src: '/b.jpg', alt: '...' },
]} />
```

### `Figure`

Wrapper semántico genérico — `<figure>` + `<figcaption>` + atribución opcional.

```mdx
<Figure caption="..." source="autor" sourceUrl="https://...">
  cualquier contenido
</Figure>
```

### `FullBleed`

Rompe el contenedor prose, ocupa 100vw.

```mdx
<FullBleed>
  <Image src="/wide.jpg" alt="..." width={1920} />
</FullBleed>
```

---

## Code

### `CodeDemo`

Bloque de código Shiki con título opcional.

```mdx
<CodeDemo lang="ts" title="src/foo.ts" code={`export const x = 1;`} />
```

### `CodeTabs`

Tabs multi-archivo Shiki. Desktop ≥640px tabs horizontales, mobile <640px accordion.

```mdx
<CodeTabs tabs={[
  { label: 'package.json', lang: 'json', code: `{...}` },
  { label: 'index.ts', lang: 'ts', code: `...` },
]} />
```

### `CodeDiff`

Bloque diff coloreado +/- via Shiki lang `diff`.

```mdx
<CodeDiff title="src/foo.ts" code={`-old line\n+new line`} />
```

### `Terminal`

Sesión shell con `$` prompt + tipos cmd/out/err/comment.

```mdx
<Terminal lines={[
  { type: 'comment', text: 'Setup' },
  { type: 'cmd', text: 'pnpm install' },
  { type: 'out', text: 'Done in 5s' },
]} />
```

### `Mermaid`

Diagrama Mermaid renderizado client-side lazy on view (~200KB cuando visible).

```mdx
<Mermaid caption="..." code={`flowchart LR
  A --> B`} />
```

---

## Layout / Typography

### `Callout`

```mdx
<Callout type="info|warn|tip|danger" title="...">contenido</Callout>
```

### `Steps`

Lista numerada con counter CSS.

```mdx
<Steps>
  <div class="steps-step"><h3>Paso 1</h3><p>...</p></div>
</Steps>
```

### `Quote`

Pull-quote con cite + source opcional.

```mdx
<Quote cite="Edsger Dijkstra" source="The Humble Programmer" sourceUrl="https://...">
  Simplicity is prerequisite for reliability.
</Quote>
```

### `Aside`

Nota al margen. Desktop ≥1024px float right, mobile inline blockquote.

```mdx
<Aside title="Tip">contenido lateral</Aside>
```

### `Spoiler`

`<details>` colapsable.

```mdx
<Spoiler summary="Click para ver">contenido oculto</Spoiler>
```

### `KeyboardKey`

Tecla o combo (split en `+`).

```mdx
<KeyboardKey combo="Cmd + Shift + P" />
<KeyboardKey>Enter</KeyboardKey>
```

### `Highlight`

Texto con bg coloreado. Variants: yellow / cyan / violet / green / red.

```mdx
<Highlight variant="yellow">crítico</Highlight>
```

### `Footnotes`

Notas al final. Recomendado: usá sintaxis `[^1]` de remark-gfm (renderiza auto). Componente manual disponible para override.

```mdx
Texto con ref[^1].

[^1]: La nota.
```

---

## Embeds

### `RepoCard`

Card de repo GitHub. Fetch build-time + cache 24h.

```mdx
<RepoCard repo="withastro/astro" />
```

### `TweetStatic`

Tweet renderizado desde JSON (sin Twitter API).

```mdx
<TweetStatic
  author="..." handle="..." date="2026-04-29"
  link="https://x.com/..." body="texto del tweet"
/>
```

---

## Data

### `Compare`

Tabla comparativa con row+col headers + emphasis cells.

```mdx
<Compare
  caption="..."
  headers={['A', 'B']}
  rows={[
    { feature: 'Latency', cells: ['10ms', { value: '2ms', emphasis: true }] },
  ]}
/>
```

---

## Monetización

### `AffiliateLink`

Link con disclosure FTC `[afil]` automático.

```mdx
Yo uso <AffiliateLink href="https://...">Tool</AffiliateLink>.
```

### `TipJar`

Botón Ko-fi / BuyMeACoffee.

```mdx
<TipJar provider="ko-fi" handle="felipet1987" />
```

---

## Validation

`scripts/validate-mdx.ts` (post inject-articles Phase 3) chequea que todo `<JSXComponent>` en `body_mdx` exista en `MDX_COMPONENT_WHITELIST`. Si agregás component nuevo:

1. Crealo en `src/components/mdx/X.astro`
2. Exportalo en `src/components/mdx/index.ts`
3. Agregá `'X'` a `MDX_COMPONENT_WHITELIST`
4. Documentá acá en `docs/components.md`
