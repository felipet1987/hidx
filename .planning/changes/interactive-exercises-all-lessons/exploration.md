# Exploration: Ejercicios Interactivos + Entretenidos en TODAS las lessons

**Project**: `yachaytree` · **Date**: 2026-04-29 · **Phase**: sdd-explore · **Change**: `interactive-exercises-all-lessons`

## Current State

- **17 lessons** total en `src/content/posts/`
- **2 components interactivos**: `MultipleChoiceQuiz`, `NumericInput` (~Phase 3 anterior)
- **5 lessons matemática** con ejercicios interactivos (cubos, balanza, pirámide, Pitágoras, cuartiles)
- **12 lessons SIN ejercicios interactivos**: catapulta, circuito limón, caleidoscopio, hello, fracciones, fibonacci, möbius, volcán, código César, estampar vegetales, microscopio, gráficos engañosos, mosaicos
- 36 components MDX activos (incluyendo deprecated)

**Gap**: 71% de las lessons NO tienen ejercicios. Y los 2 components actuales son *interactivos* (clickear/escribir) pero NO *entretenidos* (sin gamificación, animación, drag, exploración visual).

## Affected Areas

```
Components nuevos (4-10 según scope):
├── DragDrop.astro                  → arrastrar a categorías
├── OrderList.astro                 → ordenar secuencia correcta
├── MatchPairs.astro                → match conceptos ↔ definiciones
├── MemoryCards.astro               → flip cards para encontrar pares
├── SliderExplore.astro             → mover slider, ver gráfico cambiar
├── FractionPizza.astro             → click pedazos pizza visualizar
├── NumberLineDrag.astro            → posicionar números en recta
├── CipherDecoder.astro             → César cipher interactivo
├── PythagorasViz.astro             → drag triangle, fórmula live
├── ProbabilityRoller.astro         → tirar dados/monedas, frecuencias
├── HistogramBuilder.astro          → input data → chart auto
├── RotationPuzzle.astro            → rotar/reflejar formas
├── VolumeComparator.astro          → animación pirámide vs prisma
├── ColorMatch.astro                → STEAM categorías arrastrar
├── WordSearch.astro                → sopa letras vocabulario STEAM

Lessons a actualizar (17 total):
- 12 lessons existentes sin quizes
- 5 con quizes (agregar componente entretenido extra)

Index/whitelist:
- src/components/mdx/index.ts → +N exports + WHITELIST extension
```

## Approaches

### A1 — **Quizes a todas las lessons** (mínimo)
Aplicar `MultipleChoiceQuiz` + `NumericInput` (componentes existentes) a las 12 lessons que faltan. Sin nuevos components.
- Pros: Rápido (~4h); cobertura 100% lessons; sin nuevos bugs UI
- Cons: NO es "entretenido" — solo clickear opciones; UX repetitivo
- Effort: Low (~4h)

### A2 — **4 components entretenidos generales** + aplicar a todas
Crear 4 componentes reusables: `DragDrop`, `OrderList`, `MatchPairs`, `MemoryCards`. Aplicar 2-3 ejercicios mixed por lesson (mix entre quiz + entretenido).
- Pros: Variedad UX (clic + arrastrar + ordenar + memorizar); reusable cross-lessons
- Cons: ~12h dev components + ~6h aplicar; más superficie bug
- Effort: Medium-High (~18h)

### A3 — **A2 + 5 simuladores lesson-specific**
A2 + simuladores únicos por lesson más visual:
- Catapulta: slider ángulo + animación trayectoria
- Circuito limón: toggle conexión + LED enciende
- Caleidoscopio: rotación interactiva
- Pirámide vs prisma: animación llenando con arroz
- Mosaicos: drag formas, ver tessellation
- Pros: Wow factor real; cada lesson tiene "su" interactivo único; máximo engagement
- Cons: ~30h dev simuladores custom; mantenimiento alto; performance riesgo (Canvas/SVG)
- Effort: Very High (~50h total)

### A4 — **Gamificación full**
A3 + sistema XP/badges/streaks/progress across todas lessons. localStorage o backend.
- Pros: Retention real; padres ven progreso; competencia sana familia
- Cons: ~30h adicionales UI; backend posible; over-engineering MVP
- Effort: Massive (~80h total)

### A5 — **Embeber simuladores externos** (PhET, Scratch, GeoGebra)
En vez de construir simuladores desde cero, embeber iframes de plataformas educativas existentes maduras.
- Pros: 0h dev simuladores; calidad pro instantánea; PhET/GeoGebra son referentes mundiales
- Cons: Dependencia externa; cookies (rompe COPPA); perfil distinto al sitio (UX inconsistente); lentitud carga iframes
- Effort: Low (~6h) pero compromisos fuertes

## Recommendation

**A2 (4 components entretenidos generales) ahora**. **A3 (simuladores per lesson) defer** hasta validar tracción real.

### Razones A2

1. **18h razonable** vs 50h+ A3 — bilanceo entre entretenimiento y velocidad
2. **4 components reusables** = aplican a TODAS las 17 lessons sin reescribir simulador per lesson
3. **Variedad UX**: cada lesson puede mezclar 2-3 tipos (quiz + drag + match) → no se siente repetitivo
4. **Funda base** para A3 después: components custom siempre se pueden agregar luego
5. **Zero dependencias** externas: COPPA-safe (no PhET con cookies)

### 4 components A2 propuestos

| # | Component | Casos de uso | Lessons que lo usan |
|---|-----------|--------------|---------------------|
| 1 | **DragDrop** | Clasificar STEAM letters, arrastrar materiales a categorías safety | catapulta, microscopio, estampar, todas |
| 2 | **OrderList** | Ordenar pasos experimento, secuencia Fibonacci, fechas históricas | volcán, fibonacci, microscopio, código César |
| 3 | **MatchPairs** | Match concepto ↔ definición; pares fórmula ↔ resultado | balanza, pirámide, cuartiles, todas |
| 4 | **MemoryCards** | Flip cards memorizar elementos químicos, símbolos, etc | volcán química, todas vocabulario |

### Plan ejercicios per lesson (3 cada una promedio)

Total objetivo: ~50 ejercicios interactivos (17 lessons × ~3 c/u). Mix recomendado per lesson:
- 1 MultipleChoiceQuiz (concepto principal)
- 1 NumericInput o entretenido (DragDrop/OrderList/Match/Memory)
- 1 entretenido extra (variedad)

### Lesson-by-lesson preview (sample)

| Lesson | Quiz | Entretenido 1 | Entretenido 2 |
|--------|------|---------------|---------------|
| Catapulta | "Qué tipo de palanca?" | OrderList: ordenar pasos | DragDrop: materiales→función |
| Circuito limón | "Qué metales generan corriente?" | MatchPairs: metal↔potencial | DragDrop: química |
| Microscopio | "Eucarionte vs procarionte?" | MatchPairs: científico↔descubrimiento | OrderList: timeline 1665-1855 |
| Volcán | "Producto reacción CO₂?" | MemoryCards: ácido↔base pares | DragDrop: identificar reactivos |
| Código César | "Cuántas claves?" | CipherDecoder live (defer A3) | MatchPairs: shifts |
| Mosaicos | "Cuáles polígonos teselan?" | DragDrop: clasificar | RotationPuzzle (defer A3) |

## Risks

- **Effort vs validación**: 18h sin tracción real = sunk cost si nadie engaging. Mitigar: implementar primero 5 lessons, validar 2 sem, después extender otras 12
- **JS bundle size**: 4 components + 50 instancias = ~10KB JS extra. Mitigar: vanilla web components, code-split lazy
- **A11y interactivos**: drag drop con teclado dificil. Mitigar: keyboard alternatives obligatorias (Tab + Space)
- **COPPA**: zero PII collection seguir cumpliendo. Sin login, sin tracking de respuestas, todo cliente
- **Quizes repetitivos UX**: si todas son MCQ se vuelve aburrido. Mitigar: forzar variedad en plan per lesson
- **Mantenimiento 17 lessons + 4 components**: bug en component → propaga a 50 ejercicios. Mitigar: tests unitarios per component
- **WCAG AAA contrast**: drag drop + colors STEAM tener cuidado contraste. Auditar con axe
- **Mobile UX drag**: drag con touch tricky. Test en real device
- **Sin gamificación**: sin XP/badges/streaks engagement plateau. Mitigar: documentar A4 como Phase 2 cuando hay data tracción

## Ready for Proposal

**Yes** — pero clarificar scope final antes de `/sdd-propose`.

### Decisiones bloqueantes

1. **Approach**: 
   - A1 (solo quizes a todas) — mínimo
   - **A2 (4 components entretenidos + apply all)** ⭐ recomendado
   - A3 (A2 + simuladores custom) — máximo
   - A4 (gamificación XP) — over-engineering
   - A5 (PhET embeds) — compromisos COPPA

2. **Scope rollout**:
   - Big bang (las 17 lessons all at once)
   - Phased (5 primero, validar, después 12)

3. **Dificultad UI**:
   - Solo nivel kid (mascot, animaciones)
   - Ascending: Q1 fácil, Q2 medium, Q3 challenge

4. **Persistencia**:
   - Sin track score (cada visita empezás de cero)
   - localStorage flag "completaste la lección" + count quizes correctos
   - (defer) Backend Supabase con cuenta usuario

5. **Mobile prioridad**:
   - Optimizar mobile-first (chicos usan tablet/celular)
   - Desktop-first con responsive

**Sugerencias defaults**: A2 + phased + ascending dificultad + localStorage progreso + mobile-first.

Si confirmás, escribo proposal con plan ejecutable phased.
