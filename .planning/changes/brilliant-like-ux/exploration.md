# Exploration: UX Brilliant-like

**Project**: `yachaytree` · **Date**: 2026-04-29 · **Phase**: sdd-explore · **Change**: `brilliant-like-ux`

## Pushback honesto antes de empezar

**Brilliant.org** tiene equipo de 50+ personas, $$M de funding, 8+ años iterando UX. Vos estás solo. Replicar Brilliant en su totalidad es **proyecto multi-año**, no un sprint.

**Qué hace Brilliant único** (lista descomprimida):

1. **Bite-sized frames** — un concepto por slide; tap para next
2. **Question-first learning** — preguntan ANTES de explicar
3. **Visual-first** — animaciones SVG, simuladores, drawing canvas, sliders interactivos
4. **Immediate feedback** — cada interacción → respuesta visual inmediata
5. **Progressive disclosure** — lecciones desbloquean siguiente solo si superás
6. **Streak / XP / Mastery levels** — gamificación retención
7. **Daily goal** — 5-15min/día estructurado
8. **Mascot personality** — friendly characters guiando
9. **Custom illustrations** — sin stock photos, todo dibujado on-brand
10. **Minimalist UI chrome** — sin nav distractor, focus 100% contenido
11. **Mobile-first swipe** — scroll vertical o swipe horizontal nativo
12. **Drawing/sketching tools** — usuarios DIBUJAN respuestas (no solo elegir)

**Costo replicar 100%**: ~6-12 meses dev solo + diseñador ilustrador + producción animaciones. NO realista MVP.

**Pivote inteligente**: tomar 3-5 elementos clave de Brilliant + integrarlos selectivamente. Mantener nuestro diferenciador (hands-on físico + currículum chileno + parent tips).

## Current State

YachayTree hoy:
- 17 lessons MDX largos (estilo "blog post" con interactivos al final)
- 6 components interactivos (Quiz, NumericInput, DragDrop, OrderList, MatchPairs, MemoryCards)
- Zero gamificación cross-site (sin XP, sin streak, sin progress global)
- Long-form scroll (no frame-by-frame)
- Sin mascot ni illustrator
- WCAG AAA design tokens
- Mobile responsive básico (no swipe-native)

**Gap vs Brilliant**: ~70%. Tenemos componentes interactivos sueltos, no UX cohesiva tipo app.

## Affected Areas

```
Components nuevos (según scope):
├── LessonFrames.astro          → frame-based navigation (next/prev/swipe)
├── Frame.astro                 → single frame con question + answer
├── ProgressBar.astro           → progress lesson (3 de 8 frames)
├── XPCounter.astro             → XP total localStorage
├── StreakBadge.astro           → días consecutivos
├── DailyGoal.astro             → meta diaria 5-15min
├── DrawingCanvas.astro         → user dibuja respuesta (heavy)
├── SliderExplore.astro         → slider con visual live update
├── ConceptUnlock.astro         → "completá X para desbloquear Y"
├── MascotGuide.astro           → personaje fijo guiando

Layouts:
├── LessonLayout.astro          → reemplaza PostLayout para mode frames
├── BaseLayout.astro            → header con XPCounter + StreakBadge

Schema extension:
├── lesson schema add: 'mode' field ('article' | 'frames')
├── lesson schema add: 'frames' array (alt to body MDX)

Lessons:
├── 17 existentes — opcionalmente convertibles a mode='frames'
├── O mantener mode='article' default + nuevas lecciones mode='frames'
```

## Approaches

### A1 — **Cosmetic Brilliant-like** (mínimo)
Agregar XP counter + streak en header (localStorage), mascot character SVG inline (mascot per página), animaciones de feedback más vivas en components existentes (confetti, animaciones lottie), mejorar copy "tappy" estilo Brilliant.
- Pros: ~6h dev; mantiene MDX structure intacta; gana sensación gamificada
- Cons: NO es Brilliant real (sigue scroll-based); efecto "skin" superficial
- Effort: Low (~6h)

### A2 — **Frame-based interactive lessons** (substancial)
Crear `LessonFrames` component que toma array de frames + renderiza UNO a la vez con next/prev navigation. Cada frame es: pregunta + opciones/input + feedback. Usuario "navega" lesson click por click.
- Pros: Brilliant-style real para SOME lessons; opt-in (no rompe lessons existentes)
- Cons: ~15h dev component + animaciones; reescribir N lessons a frame format = trabajo masivo
- Effort: Medium-High (~15h base + 2-4h por lesson convertida)

### A3 — **A1 + A2 + drawing canvas + custom mascot**
Suma drawing tool (canvas user dibuja respuestas), mascot ilustrado custom (Figma o IA gen), animaciones lottie production-quality.
- Pros: Más cerca de Brilliant real; wow factor; brand ownable
- Cons: ~40h+ dev; requiere ilustrador (~$200 fiverr); animation engine
- Effort: Very High (~50h+)

### A4 — **Full Brilliant clone** (rebuild)
Reescribir frontend como SPA React/Vue con todas las features Brilliant. Dropear Astro long-form en favor de app interactiva pura.
- Pros: Producto serio competidor real
- Cons: 6-12 meses solo dev. Pierde SEO MDX. Pierde simplicidad. Sin equipo: muerte por scope
- Effort: Massive (~6-12 meses)

### A5 — **Cherry-pick 3 Brilliant features de máximo impacto**
Implementar SELO:
1. **XP + streak counter** (localStorage, gamificación retención básica)
2. **Frame mode opt-in** lessons cortas (LessonFrames component, optional)
3. **Mascot SVG inline** (sin ilustrador externo, CSS-only character)

Mantener todo lo demás (MDX largo, hands-on físico, parent tips). NO competir directo con Brilliant — diferenciar.
- Pros: ~12h dev; impacto perceived alto; mantiene diferenciadores; bajo riesgo
- Cons: Sigue siendo "Brilliant lite" no Brilliant real
- Effort: Medium (~12h)

## Recommendation

**A5 (cherry-pick 3 features)** ahora. Defer A2 (frames) selectivamente para 2-3 lessons piloto.

### Razones A5

1. **12h razonable** vs A4 imposible (6-12 meses)
2. **Mantiene diferenciador YachayTree** — hands-on + currículum chileno + parent tips son únicos. NO los abandones
3. **3 features high-perceived-value**:
   - **XP/streak** = retención (single most important Brilliant feature)
   - **Frame mode opt-in** = signal "esto es interactivo de verdad" para lessons cortas
   - **Mascot** = personalidad de marca + LatAm friendly
4. **Bajo riesgo**: si no funciona, rollback trivial (componentes opt-in)
5. **No requiere ilustrador** ($0 budget mantained)

### 3 features detalladas A5

#### Feature 1: Sistema XP + Streak (localStorage)

```
Header global:
[YachayTree] ← logo
                  [⚡ 250 XP] [🔥 5 días seguidos]   ← top-right

Per lesson completion:
- "✓ Lección completada — +10 XP"
- "✓ Quiz perfecto — +5 XP bonus"
- "✓ Drag-drop correcto — +3 XP"

localStorage key: yachaytree:xp = 250
                 yachaytree:streak = { count: 5, lastDate: '2026-04-29' }
                 yachaytree:lessons-completed = ['catapulta', 'fibonacci', ...]
```

#### Feature 2: Frame mode opt-in (LessonFrames component)

Cada lesson frontmatter declara `mode: 'frames'` (default `'article'`).

```mdx
---
title: ...
mode: frames
frames:
  - { type: 'intro', text: '...' }
  - { type: 'question', q: '...', choices: [...], correct: 1 }
  - { type: 'visual', image: '...' }
  - { type: 'reveal', text: 'Respuesta correcta. Por qué...' }
---
```

Component `LessonFrames` renderiza UN frame a la vez con next/prev (botones grandes mobile) + progress bar arriba (3/8).

#### Feature 3: Mascot SVG inline ("Yachi" el lechón curioso o similar)

Personaje CSS/SVG simple — NO ilustrador profesional. Solo formas geométricas básicas con expresiones (sorprendido, contento, pensando). Aparece en:
- Hero de cada lesson (saludo)
- Feedback correcto (alegre)
- Feedback incorrecto (pensativo)
- Streak milestone (celebrating)

Implementación: `<MascotGuide expression="happy|thinking|excited|sad" />`. Reemplazable por ilustración real Fase 2 si querés invertir.

## Risks

- **Pivot scope mid-build**: tenemos 17 lessons, 31 components, 5 tracks. Rebuild completo perdería MUCHO. A5 evita esto
- **Brilliant quita poder al hands-on**: si vamos full app, perdemos diferenciador único (manos sucias). A5 conserva
- **localStorage pérdida**: usuario limpia browser → pierde XP/streak. Mitigar: documentar en /privacy + backend Supabase opt-in (defer)
- **Mascot caer mal**: personaje raro = aleja audiencia. Mitigar: opcional, toggle off en config
- **Frame mode puede confundir**: usuarios pueden esperar long-form. Mitigar: `mode='frames'` solo en lessons cortas (1-2 conceptos), no en pillar posts
- **Animaciones perf**: lottie/canvas pueden degradar mobile. Mitigar: respect prefers-reduced-motion; lazy load
- **Replicar Brilliant directo**: legal brand collision. Mitigar: NO copiar diseño visual literal, solo principios UX

## Ready for Proposal

**Yes** con clarificación.

### Decisiones bloqueantes

1. **Approach**: 
   - A1 cosmetic only (~6h)
   - **A5 cherry-pick 3 features** ⭐ recomendado (~12h)
   - A2 frames substancial (~15h+)
   - A3 frames + drawing + mascot pro (~50h+)
   - A4 rebuild SPA (no recomendado)

2. **Scope rollout** A5:
   - Big bang (XP + frame mode + mascot todo junto)
   - Phased (XP primero validar 2 sem; después frame mode; mascot último)

3. **XP backend**:
   - Solo localStorage (cero infra)
   - localStorage + sync Supabase opt-in (requiere Supabase Auth — defer)

4. **Mascot existencia**:
   - Sí (CSS/SVG inline)
   - No (defer hasta tener ilustrador)

5. **Frame mode lessons**:
   - 0 lessons (solo component disponible, esperar autoría)
   - 2-3 lessons piloto (cuáles? sugiero las más cortas: cinta-mobius, mosaicos, fibonacci)

**Defaults sugeridos**: A5 + phased XP+frame+mascot + solo localStorage + mascot inline + 2 lessons piloto frame mode.

Si confirmás defaults, escribo proposal con plan ejecutable.

### Clarificación honesta

**No vamos a SER Brilliant**. Vamos a tomar lo MEJOR de Brilliant + sumarlo a lo único nuestro (hands-on LatAm currículum). El producto resultante = híbrido propio, no clon.

Si querés Brilliant-real, la única opción honesta es A4 (6-12 meses solo) + invertir en ilustrador + animador + UX designer. Sin ese budget, A5 es la única respuesta racional.
