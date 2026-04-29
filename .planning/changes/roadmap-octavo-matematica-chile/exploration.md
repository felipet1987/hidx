# Exploration: Roadmap Matemática 8° Básico Chile (MINEDUC)

**Project**: `yachaytree` · **Date**: 2026-04-29 · **Phase**: sdd-explore · **Change**: `roadmap-octavo-matematica-chile`

## Current State

YachayTree tiene 12 lessons total + 4 tracks (`inventos-caseros`, `matematica-viva`, `explora-steam`, `octavo-basico-chile`). El último cubre transversal STEAM 8°. **Falta roadmap dedicado solo matemática 8°** que mapee los 17 OAs MA08 al currículum oficial MINEDUC + secuencia anual sugerida.

Ya tenemos extracción WebFetch de:
- 17 OAs MA08 (4 ejes: Números/Álgebra/Geometría/Probabilidad)
- Estructura 4 unidades anuales programa MINEDUC
- Lessons existentes que tangencialmente cubren math (Pitágoras directo, Fibonacci/Fracciones/Möbius/César/Gráficos parcialmente)

## Affected Areas

```
Schema:
├── src/content/series/roadmap-matematica-octavo.json   NUEVO
│   └── Track con metadata específica matemática (no genérico STEAM)

Routes:
├── src/pages/rutas/roadmap-matematica-octavo/...       AUTO via [slug] existente

Lessons faltantes (gaps OA):
├── potencias-base-natural.mdx              MA08 OA3
├── raiz-cuadrada-naturales.mdx             MA08 OA4
├── porcentajes-vida-real.mdx               MA08 OA5
├── algebra-rectangulos.mdx                 MA08 OA6
├── ecuaciones-balanza.mdx                  MA08 OA8
├── volumen-prisma-cilindro.mdx             MA08 OA11
├── transformaciones-planas.mdx             MA08 OA13-14
├── percentiles-clase.mdx                   MA08 OA15

Visual roadmap UI (opcional):
├── src/components/roadmap/RoadmapCanvas.astro    NUEVO
│   └── Diagrama tipo roadmap.sh: unidades → OAs → lessons
```

## Programa MINEDUC oficial — Estructura anual

| Semestre | Unidad | Eje principal | OAs cubiertos | Tiempo aprox |
|----------|--------|---------------|---------------|--------------|
| **1° sem** (mar-jul) | **U1: Números y Operaciones** | Números | OA1, OA2, OA3, OA4, OA5 | 2 meses |
| **1° sem** | **U2: Álgebra y Funciones** | Álgebra | OA6, OA7, OA8, OA9, OA10 | 2 meses |
| **2° sem** (ago-dic) | **U3: Geometría** | Geometría | OA11, OA12, OA13, OA14 | 2 meses |
| **2° sem** | **U4: Probabilidad y Estadística** | Datos | OA15, OA16, OA17 | 1.5 meses |

## Mapeo OAs MA08 → lessons existentes + gaps

### Eje Números (5 OAs)

| OA | Tema | Lesson YachayTree | Status |
|----|------|-------------------|--------|
| OA1 | × ÷ enteros (positivos + negativos) | — | ❌ GAP |
| OA2 | × ÷ racionales | `fracciones-con-pizza-de-carton` | ⚠️ PARCIAL (cubre + fracciones, falta × ÷) |
| OA3 | Potencias base natural exp ≤3 | — | ❌ GAP |
| OA4 | Raíces cuadradas naturales | — | ❌ GAP |
| OA5 | Variación porcentual | — | ❌ GAP |

### Eje Álgebra y Funciones (5 OAs)

| OA | Tema | Lesson YachayTree | Status |
|----|------|-------------------|--------|
| OA6 | Operaciones expresiones algebraicas | — | ❌ GAP |
| OA7 | Función → cambio lineal | `fibonacci-escondido-en-las-pinas` | ⚠️ PARCIAL (sucesión, función implícita) |
| OA8 | Ecuaciones lineales (modelar) | — | ❌ GAP |
| OA9 | Inecuaciones lineales racionales | — | ❌ GAP |
| OA10 | Función afín | `fibonacci-escondido-en-las-pinas` | ⚠️ PARCIAL |

### Eje Geometría (4 OAs)

| OA | Tema | Lesson YachayTree | Status |
|----|------|-------------------|--------|
| OA11 | Área prismas + volumen cilindros | — | ❌ GAP |
| OA12 | **Teorema de Pitágoras + aplicaciones** | `pitagoras-con-cordel-y-nudos-egipcios` | ✅ COVERED |
| OA13 | Traslación/rotación/reflexión 2D | — | ❌ GAP (parcial: Möbius topología) |
| OA14 | Composición transformaciones + simetrías | `cinta-de-mobius-magia-matematica` + `caleidoscopio-cd` | ⚠️ PARCIAL (simetría sí, transformaciones formales no) |

### Eje Probabilidad y Estadística (3 OAs)

| OA | Tema | Lesson YachayTree | Status |
|----|------|-------------------|--------|
| OA15 | Percentiles + cuartiles | — | ❌ GAP |
| OA16 | **Detectar manipulación gráfica** | `graficos-enganosos-como-detectar-trampas` | ✅ COVERED |
| OA17 | Combinatoria + probabilidades | `codigo-secreto-cesar-con-disco` | ⚠️ PARCIAL (combinatoria, no Laplace explícito) |

### Resumen gaps
- **Cobertura total**: 17 OAs
- **✅ Covered (full)**: 2 (OA12, OA16) = 12%
- **⚠️ Parcial**: 4 (OA2, OA7, OA10, OA14, OA17) = 29%
- **❌ Gap (sin lesson)**: 11 (OA1, OA3, OA4, OA5, OA6, OA8, OA9, OA11, OA13, OA15) = 65%

**Estado real**: insuficiente para entregar roadmap completo. Necesitamos **8-11 lessons nuevas** para cobertura aceptable.

## Approaches

### A1 — **Roadmap solo metadata** (mínimo)
Crear `roadmap-matematica-octavo.json` track listando OAs, marcando lessons existentes ✓ y faltantes como "TBD". Sin lessons nuevas.
- Pros: Lanzamiento inmediato; muestra estructura curricular completa; comunica scope
- Cons: 65% lessons faltantes = página tipo "menú vacío"; UX pobre
- Effort: 1-2h
- Output: 1 track JSON + entries placeholder

### A2 — **Roadmap + 5 lessons gap críticos** (mínimo viable)
A1 + crear 5 lessons que cubran OAs más representativos por unidad:
- OA3 Potencias (Números): "Construyendo cubos de papel" (2³, 3³, 4³ visualmente)
- OA8 Ecuaciones (Álgebra): "Balanza matemática de cartón"
- OA11 Volumen (Geometría): "Pirámide vs prisma — qué entra más?"
- OA13 Transformaciones (Geometría): "Mosaicos con triángulos recortados"
- OA15 Percentiles (Estadística): "Encuesta a la familia + cuartiles"

Total tras A2: 7/17 ✅ + 5 ⚠️ + 5 ❌ = 71% cobertura razonable.
- Pros: Suficiente para mostrar roadmap funcional + 1 lesson por unidad clave
- Cons: 5 lessons writing = ~6-8h trabajo creativo
- Effort: ~10h total (UI + content)

### A3 — **Roadmap completo** (todas lessons gap)
A1 + crear 11 lessons cubriendo TODOS los gaps. Cobertura 100% OAs.
- Pros: Producto completo lanzamiento mercado escolar Chile
- Cons: ~22-30h content writing; alto effort sin tracción validada todavía
- Effort: ~30h total

### A4 — **Roadmap + UI visual interactivo** (Apple Maps-style)
A2 + componente custom `<RoadmapCanvas>` que renderiza diagrama SVG tipo roadmap.sh con:
- 4 unidades como swimlanes
- OAs como nodos coloreados (verde=done, naranja=parcial, gris=TBD)
- Líneas conectores prerequisitos
- Click en nodo → modal con OA + lesson link
- Pros: Wow factor, único en mercado LatAm
- Cons: ~12h dev UI custom; SVG complejo; mantenibilidad
- Effort: ~22h

## Recommendation

**A2 (Roadmap + 5 lessons gap críticos)** ahora.

Razones:
1. **Validación pragmática**: lanzá producto suficiente para evaluación real maestros antes invertir 30h más
2. **71% cobertura aceptable** para "MVP curricular" (mejor que cualquier competidor LatAm hands-on)
3. **5 lessons strategic** per unidad cubren los OAs MÁS evaluados en SIMCE/PAES
4. **Effort razonable** (~10h) vs A3 (~30h) o A4 (~22h)
5. **Path natural a A3/A4 después** si tracción real

**Lessons faltantes priorizadas** (por impacto SIMCE):

| Prioridad | OA | Lesson | Razón |
|-----------|-----|--------|-------|
| 1 | OA3 | Cubos de papel — potencias visuales | Concepto clave + visual |
| 2 | OA8 | Balanza matemática — ecuaciones físicas | Ecuaciones lineales = base álgebra |
| 3 | OA11 | Pirámide vs prisma — volumen comparado | Geometría tridimensional |
| 4 | OA13 | Mosaicos teselados con triángulos | Transformaciones lúdicas |
| 5 | OA15 | Encuesta familiar — cuartiles vivos | Estadística aplicada cotidiana |

## Risks

- **Esfuerzo content vs validación**: 5 lessons + 1 track ≈ 10h. Si no hay tracción posterior, esfuerzo sunk
- **Currículum 2025+**: MINEDUC podría actualizar OAs 2026-2028. Mitigar: documentar fecha de mapeo + revisar anual
- **Diferencias regionales escuelas**: algunas escuelas no siguen orden estándar. Mitigar: presentar como "guía sugerida" no obligatoria
- **Confusión con track existente** `octavo-basico-chile`: ya cubre 8° general STEAM. Diferenciar este como "matemática focalizada" — separar nombres claramente
- **Cobertura parcial percibida como producto incompleto**: 11 OAs gap visibles puede dañar perception. Mitigar: presentar gaps como "próximamente" con dates esperadas
- **OAs interconectados**: muchos OAs requieren prerequisitos de 6° o 7°. Si chico no domina pre-OAs, lecciones serán confusas. Mitigar: link a recursos Khan Academy ES para fundamentos
- **Demo vs aprendizaje real**: hands-on es engagement, NO substituto a práctica algorítmica. Mitigar: parent_tip explícito sobre rol complementario

## Ready for Proposal

**Yes** — pero clarificación sobre scope antes de `/sdd-propose`:

### Decisiones bloqueantes

1. **Scope inicial**: A1 (mínimo metadata) / **A2 (5 lessons recomendado)** / A3 (completo) / A4 (UI custom)?
2. **Track separado o usar existente**: ¿crear `roadmap-matematica-octavo.json` separado de `octavo-basico-chile.json` o reemplazar/extender el existente?
3. **Visual UI**: ¿reutilizar `/rutas/[slug]` standard, o reactivar `/roadmaps` con visual diferenciado?
4. **Fuente OA**: ¿usar OA estándar Bases Curriculares 2013-2015, o priorización 2020 (COVID, contenidos esenciales reducidos)?
5. **Audiencia**: ¿pure 8° básico Chile, o "11-14 años latam con currículum compatible" (Chile + AR + UY + México)?

**Sugerencias por default si no respondés**:
- A2 (5 lessons gap)
- Track separado `roadmap-matematica-octavo.json` (no conflicta)
- Reutilizar `/rutas/[slug]` (sin reactivar /roadmaps)
- OA estándar Bases Curriculares (no priorización COVID)
- Chile-first, otros países defer

**Fuentes oficiales documentadas** (para parent_tip de cada lesson):
- [Programa de Estudio Matemática 8° (PDF MINEDUC)](https://bibliotecadigital.mineduc.cl/bitstream/handle/20.500.12365/648/MONO-152.pdf)
- [Bases Curriculares 8° Matemática](https://centroderecursos.educarchile.cl/items/1458541d-e7cf-43e4-9a5e-da4e10b93044)
- [Estándares de aprendizaje 8°](https://bibliotecadigital.mineduc.cl/handle/20.500.12365/14357)
- [Fichas pedagógicas priorización curricular](https://bibliotecadigital.mineduc.cl/handle/20.500.12365/14728)
- [Currículum Nacional 8° básico](https://www.curriculumnacional.cl/curriculum/7o-basico-2o-medio/curso/8-basico)
