# Diagramas Mermaid en hidx

Componente `<Mermaid>` renderiza diagramas client-side lazy (carga `mermaid` ESM solo cuando el block entra viewport). Theme variables matchean tokens hidx (light/dark aware).

> Si querés client-side off → usar SVG estático con `<Image>` o `<FullBleed>`.

## Uso básico

```mdx
import { Mermaid } from '../../components/mdx';

<Mermaid
  caption="Pipeline build."
  code={`flowchart LR
    A[Input] --> B{Decision}
    B -- Yes --> C[Process]
    B -- No --> D[Skip]
    C --> E((Output))
    D --> E`}
/>
```

## Tipos soportados (selección)

### 1. Flowchart

```
flowchart LR
    A[Start] --> B{Auth?}
    B -- Yes --> C[Dashboard]
    B -- No --> D[Login]
    C --> E((Done))
    D --> A
```

### 2. Sequence diagram

```
sequenceDiagram
    participant U as User
    participant API as API
    participant DB as Database
    U->>API: POST /login
    API->>DB: SELECT user
    DB-->>API: row
    API-->>U: 200 + JWT
```

### 3. Gantt

```
gantt
    title Sprint S4 — rich-articles
    dateFormat  YYYY-MM-DD
    section Visual
    Image+Video         :done,    v1, 2026-04-29, 1d
    YouTubeEmbed        :done,    v2, after v1, 1d
    section Code
    CodeTabs+Diff+Term  :active,  c1, after v2, 1d
```

### 4. Entity-Relationship

```
erDiagram
    AUTHOR ||--o{ ARTICLE : writes
    ARTICLE }|--|{ TAG : has
    AUTHOR {
        uuid id
        text name
    }
    ARTICLE {
        text slug
        text title
        text body_mdx
        timestamptz published_at
    }
    TAG {
        text name
    }
```

### 5. State diagram

```
stateDiagram-v2
    [*] --> Draft
    Draft --> Review : submit
    Review --> Draft : reject
    Review --> Published : approve
    Published --> Archived : retire
    Archived --> [*]
```

## Theme

El componente detecta `data-theme` en `<html>` y aplica `themeVariables` matching:

| Token Mermaid | Light | Dark |
|---------------|-------|------|
| `primaryColor` | `#ffffff` | `#1f2937` |
| `primaryTextColor` | `#0d2240` | `#f9fafb` |
| `primaryBorderColor` | `#0d2240` | `#3b82f6` |
| `lineColor` | `#6b7280` | `#9ca3af` |
| `fontFamily` | JetBrains Mono Variable | JetBrains Mono Variable |

## Accesibilidad

- SVG inline con `aria-busy` mientras carga
- Skeleton fallback `Cargando diagrama…`
- Error fallback con `<pre>` mostrando mensaje si sintaxis inválida
- Diagramas complejos: agregar `caption` describiendo el flujo en texto

## Performance

- mermaid lib (~200KB gzip) carga **solo si** post tiene block (IntersectionObserver)
- `rootMargin: 200px` precarga antes de scroll
- Posts sin Mermaid → cero costo extra

## Validación pre-publicación

Hay un check de sintaxis Mermaid pre-commit recomendado (defer per Phase 3 deviation; cliente render no rompe el build).

Para validar manual:
```sh
npx -p @mermaid-js/mermaid-cli mmdc -i diagram.mmd --quiet
```

## Recursos

- [Mermaid live editor](https://mermaid.live/) — preview rápido
- [Mermaid docs](https://mermaid.js.org/intro/) — sintaxis completa
- [Cheatsheet](https://github.com/mermaid-js/mermaid/blob/develop/docs/syntax/flowchart.md)
