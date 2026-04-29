# Exploration: hidx → Plataforma de Aprendizaje

**Project**: `hidx` · **Date**: 2026-04-29 · **Phase**: sdd-explore · **Change**: `learning-platform`

## Current State

hidx hoy:
- Long-form articles MDX en Supabase (1 post hello)
- Astro 6 SSG en CF Pages live (`hidx.pages.dev`)
- 24 MDX components rich (Image, Video, CodeTabs, Mermaid, etc)
- License: CC-BY-NC content + MIT code
- Monetización Capa 1 (Affiliate + TipJar) implementada; Capa 2-4 (ads, sponsorships, paywall) en roadmap
- Auth: ninguna (SSG puro). Supabase auth disponible pero no usada
- Sin progress tracking, sin quizzes, sin courses, sin user accounts

**Pivot ambicioso** — hidx hoy es publicación, learning platform es producto distinto. Comparten contenido pero divergen en data + UX + monetización + ops.

## Plataformas de referencia (estudio)

| Plataforma | Modelo | Fortaleza | Adoptable hidx |
|------------|--------|-----------|----------------|
| **freeCodeCamp** | Free curriculum + certificaciones | Curricula gigante, comunidad, no-frills | Estructura tracks gratis |
| **The Odin Project** | OS curriculum + projects | Project-based, comunidad Discord | Tracks + projects pattern |
| **fullstackopen.com** | University-grade free MOOC | Long-form + ejercicios autoevaluados | Modelo content + ejercicios |
| **Frontend Masters** | Paid video courses | Prod quality video, pros como instructores | Premium tier modelo |
| **Egghead.io** | Short videos + transcripts | Bite-sized, project-focused | Lecciones cortas formato |
| **Scrimba** | Interactive screencasts | Code-along en browser | UX innovadora (heavy build) |
| **Exercism** | Mentored exercises 60+ langs | Mentor model + autograde | Exercise testing pattern |
| **roadmap.sh** | Visual learning paths | Discovery + path navigation | Roadmap UI gratis |
| **LeetCode** | Coding puzzles + auto-graded | Test runner integrado | Code playground + tests |
| **Brilliant** | Gamified math/CS | Streaks, mastery, animations | Gamification pattern |
| **Hyperskill (JetBrains)** | Project-based tracks | Hands-on en IDE | Track + projects + IDE |
| **Smashing/web.dev** | Long-form free + workshops | Editorial quality + premium events | Content + premium events |

### Patrón común
1. Estructura jerárquica: **Track/Path → Course/Module → Lesson → Exercise/Quiz**
2. **User accounts** (siempre — para progress)
3. **Progress state** persistido (lesson completion, streaks, XP)
4. **Search + tags + filters** robustos
5. **Comunidad** (Discord/forum/comments)
6. **Monetización**: free tier curriculum + paid tier (mentorship/cert/video)

### Lo que NO comparten
- Video first vs text first (FCC text + video; FE Masters video heavy)
- Free vs paid balance varía
- Autograde vs peer review vs mentor

## Affected Areas

Casi todo cambia/se extiende:
```
Schema Supabase (NUEVO):
├── users (Supabase Auth)
├── tracks                        — top-level path
├── courses (FK tracks.id)        — module dentro de track
├── lessons (FK courses.id)       — unit
├── exercises (FK lessons.id)     — checkpoint
├── user_progress (uid, lesson_id, status, ts)
├── quiz_attempts                  — score history
├── certifications                 — completion proof
├── comments / discussions         — per lesson
├── enrollments                    — user joined track

Astro / Routes (NUEVO):
├── /learn                         — landing tracks index
├── /learn/[track]                 — track overview + courses
├── /learn/[track]/[course]        — course outline + lessons
├── /learn/[track]/[course]/[lesson]  — lesson content + exercise
├── /dashboard                     — user progress + streaks
├── /profile                       — user settings + cert downloads
├── /auth/(login|signup|callback)  — Supabase Auth flows

Components (NUEVO):
├── Quiz                           — multi-choice / fill-in
├── ExerciseRunner                 — code editor + test runner
├── ProgressBar / Trail            — track completion viz
├── Streak / XPBadge / LevelMeter
├── DiscussionThread               — comments per lesson
├── Certificate (PDF generator)
├── EnrollButton

Render mode pivot:
- SSG (article reading) → Hybrid (auth-gated + dynamic state)
- Cloudflare adapter requires output: 'hybrid' o 'server' (revisar ADR-003 inject-articles)

Monetización (cambio):
- Free curriculum + paid certs/mentorship (vs current sponsorship/affiliate)
- Stripe full integration (Capa 4 mover a P0)
```

## Approaches

### A1 — **Curated Reading Path** (mínimo viable)
Estructura jerárquica simple ENCIMA del blog actual: agregar tabla `tracks` que agrupa posts existentes. Sin user accounts, sin progress, sin quizzes — solo discovery.
- Pros: 1-2 sprints, mantiene SSG, cero auth complejidad
- Cons: NO es plataforma de aprendizaje real — solo blog organizado
- Effort: Low (~1 semana)
- Inspiración: roadmap.sh + curated lists tipo Awesome-X

### A2 — **Course MVP con Auth + Progress** (LMS lite)
Auth (Supabase) + tracks + courses + lessons + progress tracking + dashboard básico. Sin quizzes/exercises/certs. Lessons = posts MDX existentes.
- Pros: Plataforma real, escalable, mantiene quality content first
- Cons: Pivot SSG → hybrid (output: 'server'); auth UX; ops user data
- Effort: Medium-High (~6-8 semanas)
- Inspiración: fullstackopen baseline (text + light progress)

### A3 — **Course MVP + Quizzes + Exercises** (real LMS)
A2 + componentes Quiz (multi-choice/fill) + ExerciseRunner (code editor + tests via Pyodide/StackBlitz/SDK) + certificates PDF.
- Pros: Diferenciación dev audience real
- Cons: ExerciseRunner es proyecto enorme solo (sandbox + tests + judge); cert PDF infra
- Effort: Very High (~3-6 meses)
- Inspiración: freeCodeCamp + Exercism

### A4 — **Full Learning Platform** (FE Masters tier)
A3 + video hosting + live workshops + mentorship + community forum + paid tier + multi-author + certifications con autoridad.
- Pros: Producto serio, monetización clara
- Cons: Equipo de 3-5 personas mínimo; meses-años de build; competencia feroz
- Effort: Massive (~12-18 meses team de 3+)
- Inspiración: Frontend Masters / Pluralsight

### A5 — **Hybrid: Blog + Tracks visuales** (no LMS, solo navigation)
Blog actual mantiene + agregar UI tracks/roadmaps visuales tipo roadmap.sh, sin auth ni state. Pure SSG. Posts agrupados en paths.
- Pros: Visual upgrade enorme con costo bajo, mantiene SSG/perf, free content
- Cons: NO hay progress tracking real; no es "learning platform" técnico
- Effort: Low-Medium (~2-3 semanas)
- Inspiración: roadmap.sh + Awesome-X lists

## Recommendation

**Pregunta primero — qué querés construir realmente?**

Sin clarificar el target, pushback honesto:

**Si querés "learning platform" real → A2 mínimo, A3 ideal**, pero implica:
- 6+ semanas dev solo (vs lo proyectado de hidx hasta ahora ~2 semanas total)
- Pivot técnico: SSG → hybrid (rompe ADR-003 y proposal original)
- Auth + user data + GDPR + retention compliance
- Compete con freeCodeCamp / Odin gratis + FE Masters pago — diferenciación clara requerida

**Si querés impacto rápido sin pivot técnico → A5 (Hybrid blog + tracks visuales)**:
- 2-3 semanas dev
- Mantiene SSG perfectamente
- Tracks/roadmaps visuales agregados como nueva sección `/roadmaps`
- Posts existentes se agrupan en paths
- NO auth, NO progress (state local en localStorage si quiere)
- Beneficio: discovery enorme, comunidad puede contribuir tracks, SEO++

**Mi sugerencia**: empezá con **A5**, validá demanda 3-6 meses (analytics + feedback), después pivote a A2/A3 cuando tengas señal de que la audiencia quiere progress tracking pago.

Razones técnicas:
1. **Sunken cost bajo**: si nadie usa los roadmaps, perdés 2 semanas no 6 meses
2. **SSG preservado**: Lighthouse 100, costos cero, deploy simple
3. **Diferenciación clara desde día 1**: roadmap.sh + Smashing-quality articles = nicho propio
4. **Monetización Capa 4 (paywall) puede ser per-track** después
5. **A2 sin demanda real = build trampolín nadie usa** (sucede con 80% de side projects ambiciosos)

## Risks

- **Scope creep masivo**: A3-A4 son producto-completo, no feature. Sin co-founder/equipo, plazos doblan o triplican
- **Competencia gratuita feroz**: FCC, Odin, MDN — nadie paga por curriculum básico. Diferenciación = depth + opinionated take + craft visual
- **Auth + user data**: rompe privacy-first promise actual (zero cookies). Solo Supabase Auth + hipotético consent banner
- **Monetización pivot**: Capa 1 (affiliate) ahora pasa a P3 vs Capa 4 (paywall) sube a P0 — contradice proposal original
- **SSG → Hybrid técnico**: cambia adapter, env, build pipeline; nuevo testing strategy
- **Content velocity**: una "platform" sin >50 lessons al lanzamiento se ve vacía. Pillar posts (5 ya programados) no alcanzan
- **Cert legalidad**: certificados de aprendizaje sin acreditación oficial son señal de marketing, no valor real
- **Burnout**: 6+ meses solo construyendo platform sin contenido = motivación cae

## Ready for Proposal

**No directamente** — necesito clarificación bloqueante.

### Preguntas críticas antes de `/sdd-propose`

1. **Target real**: 
   - **A5** (blog + visual tracks, sin LMS real)?
   - **A2** (LMS lite con auth + progress)?
   - **A3** (LMS con quizzes + exercises)?
   - **A4** (full platform — solo si tenés team)?

2. **Time budget**: ¿2 semanas, 2 meses, 6 meses?

3. **Modelo monetización shift**: ¿free curriculum + paid certs/mentorship? ¿Subscription? ¿Mantener current (sponsorship + affiliate)?

4. **Content existente**: 5 pillar posts planeados — ¿se convierten en lessons o quedan como blog separado del curriculum?

5. **Diferenciación vs FCC/Odin**: ¿Qué hace única hidx vs gratis competition? Sugerencias:
   - Spanish-first (FCC/Odin son EN — mercado LatAm subatendido)
   - Opinionated takes (no "neutral" intro)
   - Production-ready focus (vs "hello world" tutorials)
   - Senior dev mentorship lens

6. **Competition acceptance**: ¿OK competir directamente con FCC gratis, o nicho hyper-specific?

**Mi sugerencia firme**: respondé 1+2+3 mínimo. Si no estás 100% seguro de querer 6+ meses pivot, **arrancá con A5** (validation barata). Después decidís si saltar a A2/A3 con data real de tracción.

Si decidís A2/A3 sin más analysis, propose va a ser largo (50-100 tasks) y querrá 6+ meses ejecución. ¿Estás dispuesto?
