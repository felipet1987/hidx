# Exploration: Pivot Total → Plataforma STEAM LatAm

**Project**: `hidx` (rename probable) · **Date**: 2026-04-29 · **Phase**: sdd-explore (REWRITE) · **Change**: `learning-platform`

> **PIVOT TOTAL**. Audiencia previa (senior devs Spanish) → STEAM kids/teens/non-STEM adultos LatAm. Competidor target: Khan Academy en español. Reescritura completa de scope, design, monetización y posicionamiento.

## Pushback honesto antes de empezar

**Competir head-on con Khan Academy** es David vs Goliath:
- Khan: $200M+/año endowment, Bill Gates Foundation, equipo 300+, 20k videos, 10+ años, 130 idiomas
- hidx (vos solo): $0 budget, equipo 1, 0 videos, recién empezado
- Resultado probable head-on: **invisibilidad**

**Estrategia ganadora real**: NO competir donde Khan es fuerte. Atacar **gaps específicos**:
1. **LatAm Spanish nativo** (Khan ES suena "neutral España", no rioplatense/mexicano/colombiano)
2. **Hands-on experiments + proyectos** (Khan = video + practice; weak en lab físico)
3. **Multinivel mismo tema** (Khan estructura por edad; gap = "ciencia para todos" — kid + teen + adult del mismo tópico)
4. **Padres/maestros toolkit** (Khan tiene pero modesto; oportunidad LatAm escuelas públicas)
5. **Materiales económicos** (LatAm bajo presupuesto familiar — proyectos con materiales reciclados)

Mi recomendación firme: **NO digas "competimos con Khan"**. Decí "**llenamos los gaps de Khan en LatAm**". Eso es defensible.

## Current State (descartado en pivot)

Todo lo siguiente debe re-evaluarse:
- ❌ Identidad "hidx" (How I Do X) — no encaja con STEAM kids
- ❌ Posicionamiento "senior dev publication"
- ❌ 5 pillar posts dev planeados (Astro, Supabase, monetización web, etc)
- ❌ Components dev-céntricos (`CodeTabs`, `CodeDiff`, `Terminal`, `RepoCard`)
- ❌ AffiliateLink Cloudflare/Beehiiv
- ❌ Tono "magazine grade dev aesthetic" (zinc + cyan)
- ❌ Article 5min reads sin ilustración

✅ **Reusable**:
- Astro 6 + Supabase + CF Pages stack (100%)
- MDX pipeline + content collections
- Auth Supabase (cuando llegue server-side state)
- 24 components base (Image/Video/Gallery/Quote/Aside/etc — útiles para STEAM)
- Theme tokens infrastructure (re-color, no re-arch)
- CLI scaffold (new-post, upload-asset)
- Backup + monitoring infra (supabase-cf-integration en curso)

## Plataformas referencia (estudio focused STEAM)

| Plataforma | Modelo | Fortaleza | Gap aprovechable |
|------------|--------|-----------|------------------|
| **Khan Academy ES** | Free video + practice | Curricula matemáticas+ciencia top | Tono ES neutro (suena foreign LatAm); poco hands-on |
| **Khan Academy Kids** | Free app niños 2-8 | UX kids excelente | No cubre 8-12, ES limitado |
| **Code.org** | Free coding kids | Hour of Code viral, scratch | Solo coding (no STEAM full) |
| **Brilliant** | Paid premium gamificado | Math/CS interactivo top | $250/año caro LatAm; only ENG (gap ES) |
| **Tinkercad** | Free 3D/circuits/codeblocks Autodesk | Kids/teens engineering hands-on | EN-first; complejo iniciales |
| **NASA STEM** | Free recursos NASA | Autoridad cientifica | EN; no progressive curriculum |
| **Curiosamente** (YT) | Spanish science YT | LatAm voice native | Solo videos; no curriculum |
| **QuantumFracture** | Spanish physics YT | Production quality alta | Solo YT; no platform |
| **Educa Mass** | Mexicana primaria | Cubre ed básica MX | Site dated, UX pobre |
| **Argentina-BA Aprende** | Gov ed plataforma BA | Curriculum oficial AR | Centralizado gov, no agnostic LatAm |
| **edX/Coursera ES** | MOOCs cert | Profesional cert | Adult only, no kids |
| **Scratch** | MIT free coding | Visual programming kids | Solo coding |
| **PhET (Colorado)** | Free simulations sci/math ES | Simulaciones top calidad | EN-first, sin curriculum guiado |
| **Crash Course ES** | YT science | Production John Green team | YouTube only, no platform |

### Patrón competitivo

| Categoría | Khan domina | Gap LatAm |
|-----------|-------------|-----------|
| Math básica/avanzada | ✅ | escasa diff |
| Ciencias (física/química/bio) | ✅ | LatAm voice |
| Coding | ⚪ (limitado) | español + proyectos LatAm |
| Engineering hands-on | ❌ | grande |
| Arte (A en STEAM) | ❌ | enorme |
| Lab experiments materiales reciclados | ❌ | enorme (presupuesto LatAm familiar) |
| Padres toolkit ES | ❌ | mediano |
| Multinivel mismo tópico | ❌ | unique angle |

**Sweet spot**: A (Arte) + E (Engineering hands-on) + LatAm voice + multinivel. NO compitas en M/S/T donde Khan reina.

## Affected Areas (TODO se reescribe)

```
Renombre proyecto (decisión usuario):
- Sugerencias: SteamigosLab, CuriosaLab, MundoSTEAM, ArmoLatAm, Lab Curiosa,
  CienciAR, Tinkercosmos, ManosSTEAM, ChispaLatAm, EduMagia
- Sugiero: "ChispaLab" o "MundoSTEAM" (memorable Spanish, registra .lat o .com.ar)

Schema Supabase (re-design):
├── tracks (re-purpose)        → "rutas" o "exploraciones STEAM"
├── articles                   → "lecciones" / "actividades"
├── audiences                  → kids-8-12 / teens-13-17 / adultos-no-stem
├── difficulty                 → 1-5 estrellas (vs beginner/intermediate/advanced)
├── lesson_type                → enum: video / lectura / experimento / proyecto / quiz / juego
├── materials                  → JSON list para experimentos
├── duration_minutes           → tiempo estimado actividad
├── steam_category             → S/T/E/A/M (multi-select; cada lección puede crossover)
├── parents_guide              → text section pedagogía padres/maestros

Astro / routes:
├── /                          → landing reposicionado (kids friendly + adults secondary CTA)
├── /explorar                  → catálogo lessons filterable por edad/tema/tipo
├── /rutas                     → curated paths estilo Khan
├── /rutas/[slug]              → ruta overview
├── /rutas/[slug]/[lesson]     → activity page
├── /padres                    → pedagogical guide for parents
├── /escuelas                  → outreach maestros LatAm
├── /labs                      → standalone interactive simulations (PhET-style)
├── /comunidad                 → user submissions / projects (defer Phase 2)

Components nuevos (reemplazar dev components):
├── ExperimentLab              → step-by-step hands-on con materials list + safety + foto/video
├── InteractiveSim             → embed canvas (p5.js / d3 / vanilla) simulación física
├── DragDropQuiz               → drag answer to slot (kids friendly)
├── MultipleChoice             → quiz visual con feedback inmediato
├── StoryFrame                 → narrative slides con personajes (storytelling kids)
├── LabsLayout                 → wide canvas para simulations
├── MaterialsList              → checklist materiales fácil compra/casa
├── SafetyNote                 → warnings (cortantes, calor, químicos)
├── AgeBadge                   → 8-12 / 13-17 / 18+
├── STEAMBadge                 → S/T/E/A/M iconos coloreados
├── PrintablePDF               → genera PDF descargable lección (kids/teachers)
├── VideoPlayer                → YouTube embed pero sin cookies (privacy-first)
├── ParentTip                  → callout para guía padres/maestros
├── MakerProject               → multi-session project con checkpoints

Components dev (eliminar/relegar):
├── CodeTabs / CodeDiff / Terminal / RepoCard / AffiliateLink TipJar
└── → Mantener solo si futura ruta "Programación para chicos"

Design system (reescribir):
├── Paleta colores: vibrante (purple, orange, teal, yellow); 4 colores per STEAM letter
├── Typography: friendly humanist sans (Quicksand, Nunito, Comic Neue NO)
├── Iconografía: Heroicons + Tabler educational pack
├── Ilustraciones: undraw.co (free), open-peeps, blush.design — kid-friendly
├── Animaciones: Lottie embeds para loading/feedback
├── Theme: cero "magazine dark"; bright + accessible WCAG AAA

Monetización STEAM:
├── Ads OK para >13 (COPPA libre); para <13 usar redes COPPA-compliant:
│   - Mediavine Family
│   - Ezoic Edu
│   - SuperAwesome
│   - Adsense for Kids (existe pero limitado)
├── Sponsorships: marcas STEAM friendly (Lego, Makey Makey, Adafruit, MakeBlock)
├── Subscription familiar opcional ($3-5/mes — modelo Brilliant)
├── Curso pago ocasional (workshop, bootcamp niños)
├── Contenido editorial/escuelas — venta paquetes a colegios
├── Affiliate Amazon items educativos (kits, libros)

i18n:
├── Spanish-only MVP (LatAm voice; rioplatense/neutral mix)
├── Defer EN, PT-BR (mercado Brasil enorme — Fase 2)
```

## Approaches

### S1 — **Mini-MVP nicho** (defendible)
Pick 1 sub-categoría STEAM + 1 audiencia + lanzar 10 lessons. Ej: **"E (Engineering) hands-on para kids 8-12"** — proyectos de ingeniería con cartón, popotes, gomas. Diferencia: cero competencia LatAm específica; Khan no cubre.
- Pros: niche defendible, lanzamiento rápido, validación clara
- Cons: limita audience inicialmente
- Effort: Low-Medium (~3-4 sem)

### S2 — **Multi-categoría 1 audiencia** (medium scope)
Cubrir S+T+E+A+M para kids 8-12 (única audiencia inicial). Lanzar 5-10 lessons por cada letra (25-50 total).
- Pros: ofrece variedad → más retention
- Cons: scope amplio = velocity content alto; sin enfoque
- Effort: Medium-High (~8-12 sem)

### S3 — **Triple audiencia diferenciada** (lo que pediste)
Mismas STEAM categorías pero contenido distinto para kids/teens/adults non-STEM. Cada lección tiene 3 versiones (kids, teens, adults).
- Pros: ambicioso, defendible "STEAM para todos"
- Cons: 3x content writing; UX confunde si mal navegado; producción gigante
- Effort: Very High (~6-12 meses)

### S4 — **Triple audiencia + tracks separados** (mismo target user pidió, mejor execution)
3 sub-sites/sub-paths separados (`/kids`, `/teens`, `/adultos`) con curriculum independiente cada uno. Comparten infra + design tokens pero contenido divergente.
- Pros: navegación clara per audiencia; SEO targeting per persona
- Cons: 3 productos paralelos = team grande necesario
- Effort: Very High (~12-18 meses solo)

### S5 — **Aggregator + light originals** (creativo)
Curate links a YouTube channels Spanish STEAM (Curiosamente, QuantumFracture, etc) + tracks editoriales propias hilando contenido externo + 5-10 originales. Like "Awesome list" curated for STEAM ES.
- Pros: bypass content velocity bottleneck, lanzamiento rápido, valor real curaduria
- Cons: dependencia content externos; menos diferenciación; revenue limited
- Effort: Low-Medium (~4-6 sem)
- Inspiración: Awesome lists + Brain Pickings

## Recommendation

### Realista solo: **S1 → escalar S2 → escalar S3**

**Mi propuesta firme**:

**Mes 1-3 (S1 launch):**
- 1 audiencia: **kids 8-12** (sweet spot motivacional + COPPA-aware desde día 1)
- 1 categoría: **E (Engineering hands-on) + A (Arte)** combinados
- 10 lessons proyecto-based (catapulta cartón, circuito limón, kaleidoscopio CD, etc)
- Materiales todos < $5 USD por proyecto
- LatAm voice (rioplatense neutro)
- Ad networks COPPA-compliant (Mediavine Family)
- Differentiation: "Lab STEAM en casa con cosas que ya tenés — para hijos LatAm"

**Mes 4-6 (S2 expand):**
- Sumar S+T+M para kids
- Lanzar `/escuelas` outreach maestros públicos
- Sumar segunda audiencia: **teens 13-17** mismo curriculum nivel 2

**Mes 7-12 (S3 escalar):**
- Sumar **adultos no-STEM** ("redescubrí ciencia que olvidaste")
- Multi-version lessons (3 niveles per topic)

**No empezar por S3 directo** — gigantesco con cero validación.

### Project rename

`hidx` (How I Do X) NO encaja STEAM kids/family. Sugerencias evaluadas:

| Nombre | Pros | Cons | Domain probable |
|--------|------|------|-----------------|
| **ChispaLab** | Memorable Spanish, "chispa" = curiosity LatAm | Genérico | chispalab.lat / .com |
| **MundoSTEAM** | Descriptivo claro | Largo + STEAM extranjero | mundosteam.com |
| **Tinkercosmos** | Tinker + cosmos = aspiracional | Kids no entienden tinker | tinkercosmos.com |
| **CuriosaLab** | Curiosa = curiosidad | Femenino puede sesgar | curiosa.lat |
| **EduMagia** | Educa + magia kids | Magia = no-ciencia (paradoja) | edumagia.com |
| **Steamigos** | STEAM + amigos | Kids friendly + LatAm | steamigos.com |
| **HandsOn STEAM** | Descriptivo | EN — gap audience | handson.lat |

**Sugerencia firme**: **ChispaLab** o **Steamigos**. Comprá ambos dominios mientras decidís ($10/c/u, decisión final puede tomar semanas).

## Risks

- **Compete con Khan = invisibilidad SEO** — atacar nicho LatAm hands-on es defendible; "competir Khan" es rendirse de antemano
- **Content velocity bottleneck** — lessons STEAM con experimentos requieren testeo físico + foto/video proceso → 1 lesson = 4-6h producción. 10 lessons = 40-60h
- **COPPA / GDPR-K compliance** — kids <13 datos = regulación estricta. Cero PII collection MVP. Ads networks COPPA-only
- **Diseño infantil = dificultad UX adult** — paleta vibrante + iconos kids puede repeler audience adult-non-STEM. Mitigar: 3 sub-sites separados en S3/S4
- **Materiales experimentos LatAm**: lo que cuesta $1 USA cuesta $5 LatAm (importación). Curate alternatives reciclados
- **Rename + restart marca** = SEO authority cero; lo bueno: hidx tampoco tenía
- **Producción multimedia** — fotos, videos cortos demos, ilustraciones — sin equipo design = bottleneck
- **Aceptación maestros LatAm**: escuelas públicas tienen procesos burocráticos lentos para adopción contenido externo
- **Modelo subscription LatAm difícil**: poder adquisitivo bajo + cards no-credit + Stripe LatAm friction
- **Khan Academy partner program**: en vez competir, considerar partnership (translation + LatAm voice complement)

## Ready for Proposal

**No** — clarificación bloqueante antes de proposal:

### Decisiones críticas

1. **Approach scope inicial (mes 1-3)**:
   - **S1** (1 audiencia kids + 1-2 STEAM categorías) ⭐ recomendado realista
   - S2 (1 audiencia kids + STEAM full)
   - S3 (3 audiencias) — **no recomendado start**
   - S5 (Aggregator) — alternativa creativa
   
2. **Project name**: ChispaLab / Steamigos / otro. Decidir antes de implementar (afecta dominio, branding, copy, assets)

3. **Audiencia primaria mes 1-3**: kids 8-12 (sugiero) o otra?

4. **STEAM categoría inicial**: E+A (sugiero) o S/T/M?

5. **Stake en aceptar pushback**: ¿Aceptás reposicionar "complementamos Khan en LatAm hands-on" en vez de "competimos head-on"?

6. **Khan Academy partnership exploration**: ¿abierto a investigar partnership (traduccón + adaptación LatAm) en vez compete?

7. **Tiempo budget realista**: 3 meses S1, 12+ meses S3?

8. **Equipo solo o querés sumar (illustrator, content writer, video editor)?**

9. **Inversión $$**: ¿hosting + dominios + ads tools paid + asset library budget?

### Acciones inmediatas tuyas (independiente respuesta)

1. **Comprar ambos dominios candidatos** ($10 c/u) para no perderlos
2. **Validar mercado** con 5-10 padres/maestros LatAm: "¿pagarías $3/mes por experimentos STEAM en español para tu hijo?"
3. **Espiar Khan Academy ES partnership program** (se aceptan colaboradores volunteers traducción)
4. **Decidir si tirar todo trabajo hidx** (5 commits dev, supabase backend, components dev) o pivotear reusando infra solo

**Mi recomendación firme una vez más**: empezá por S1 mini-MVP (3 meses, 1 audiencia, 1 categoría). Si tracción real → escalá. Si no → pivot barato. **No arranques S3 directo, perdés 12 meses sin saber si interesa.**

Si confirmás S1 + nombre + audiencia, escribo proposal.md realista.
