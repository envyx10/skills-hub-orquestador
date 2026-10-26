---
name: orquestador
description: Elige qué skill usar para la tarea actual entre un catálogo curado (diseño de UI, animación, React/Next.js, Cloudflare, Supabase, seguridad, testing, flujo de trabajo, vídeo, documentos) y explica cómo instalarla si falta. Úsala cuando el usuario pregunte "¿qué skill uso para...?", pida una recomendación de skills, empiece una tarea y no tenga claro qué skill aplicar, o quiera ver el catálogo. También en inglés ("which skill should I use"). Con el argumento "wrapped" (o si pide su resumen, estadísticas o "Wrapped" de skills) analiza su historial local y genera Skills Wrapped: las skills que más usa, las instaladas que nunca usa, las duplicadas y las ocasiones en que no usó una que encajaba.
argument-hint: '[la tarea, p. ej. "animar un modal"] | wrapped'
---

# Orquestador de skills

Tu trabajo es **elegir**, no hacer la tarea. Recomienda la skill (o la secuencia corta de skills)
que mejor encaja, di por qué en una frase y, si no está instalada, cómo instalarla. Después, si el
usuario quiere, invoca la skill elegida con la herramienta Skill.

## Cómo decidir

1. **Entiende la tarea.** Si llega como argumento, úsala. Si no, pregunta en una frase qué quiere
   hacer. No pidas más contexto del necesario para elegir.
2. **Mira lo que ya hay.** La lista de skills disponibles de la sesión dice cuáles están
   instaladas. Prefiere siempre una instalada frente a otra equivalente que no lo esté.
3. **Busca en la tabla rápida** de abajo. Para matices (qué hace exactamente cada una, cuándo no
   usarla), lee [references/catalogo.md](references/catalogo.md).
4. **Recomienda como mucho tres**, en orden de uso si forman una secuencia
   (por ejemplo: `brainstorming` → `writing-plans` → `executing-plans`).
5. **Si falta**, da el comando exacto de instalación del catálogo. No la instales sin que el
   usuario lo diga.
6. **Si nada encaja**, dilo claramente y sugiere `npx skills find <tema>` o `skill-creator` para
   crear una nueva. No fuerces una skill que no toca.

## Modo Skills Wrapped

Si el argumento es `wrapped`, o el usuario pide su resumen o estadísticas de skills:

1. Ejecuta el script que acompaña a esta skill (está en `scripts/wrapped.mjs`, dentro de la
   carpeta base de esta skill). Necesita Node 18 o superior:

   ```bash
   node "<carpeta-de-esta-skill>/scripts/wrapped.mjs"
   ```

   Opciones: `--since AAAA-MM-DD` para acotar el periodo, `--out <carpeta>` para cambiar dónde
   guarda el informe (por defecto `~/.claude/skills-wrapped/`) y `--projects` si el usuario
   quiere ver los nombres de sus proyectos en el HTML.
2. El script lee `~/.claude/projects/**/*.jsonl` **solo en local**, no envía nada y escribe un
   HTML y un JSON. Por stdout devuelve un resumen JSON: totales, perfil, top, skills que nunca se
   usan y los tokens que cuestan, duplicadas, oportunidades perdidas con ejemplos de prompts y
   recomendaciones.
3. Cuéntaselo en pocas líneas y con gracia, como un Wrapped: su perfil, su skill estrella, el
   dato más llamativo (normalmente los tokens que gastan las skills que no usa o la oportunidad
   perdida más repetida) y las 2 o 3 acciones que más le ahorrarían. Las oportunidades perdidas
   son una heurística por palabras clave: preséntalas como "posibles" y revisa los ejemplos antes
   de afirmar nada. Nunca cites prompts enteros, como mucho unas palabras.
4. Dale la ruta del HTML para que lo abra. Si tiene navegador disponible, ábrelo. El HTML no
   lleva prompts ni nombres de proyectos (salvo con `--projects`), así que puede compartirlo; el
   JSON sí lleva fragmentos de prompts y es solo para él.
5. Si quiere aplicar las recomendaciones (desinstalar, quitar duplicadas o pasar una skill a
   manual con `disable-model-invocation: true`), propón los cambios concretos y espera su sí antes
   de tocar nada.

## Tabla rápida

| Si la tarea es...                                         | Usa                                                     |
| --------------------------------------------------------- | ------------------------------------------------------- |
| Diseñar una UI o pantalla nueva                           | `frontend-design`, `ui-ux-pro-max`                      |
| Landing, portfolio o web de marketing que no parezca IA   | `design-taste-frontend`                                 |
| Criticar, auditar o pulir una UI existente                | `impeccable`, `emil-design-eng`                         |
| Revisar accesibilidad y buenas prácticas de interfaz      | `web-design-guidelines`                                 |
| Probar una UI con datos extremos                          | `break-ui`                                              |
| Ver varias versiones de un componente y elegir            | `prototype`                                             |
| Elegir librería de frontend (toasts, charts, DnD...)      | `pick-ui-library`                                       |
| Componentes shadcn/ui                                     | `shadcn`                                                |
| Gestos, springs, sensación nativa tipo Apple              | `apple-design`, `mobile-native`                         |
| Crear una animación                                       | `animate`                                               |
| Revisar animaciones de un diff                            | `review-animations`                                     |
| Auditar el motion de todo el proyecto                     | `improve-animations`, `find-animation-opportunities`    |
| Animación que va a tirones                                | `animation-performance`                                 |
| No sé cómo se llama un efecto                             | `animation-vocabulary`                                  |
| Toasts con Sonner                                         | `ask-sonner`                                            |
| Rendimiento en React / Next.js                            | `vercel-react-best-practices`                           |
| Arquitectura de componentes React                         | `vercel-composition-patterns`                           |
| App Router de Next.js                                     | `nextjs-best-practices`                                 |
| Cloudflare Workers, Wrangler                              | `workers-best-practices`, `wrangler`                    |
| Core Web Vitals, Lighthouse                               | `web-perf`                                              |
| Captcha con Cloudflare Turnstile                          | `turnstile-spin`                                        |
| Supabase, Postgres, RLS                                   | `supabase`, `supabase-postgres-best-practices`          |
| Auditoría de seguridad                                    | `security-audit`                                        |
| Probar una web local con Playwright                       | `webapp-testing`                                        |
| Retirar una API o migrar un esquema en producción         | `deprecation-and-migration`                             |
| Idea vaga → diseño → plan → ejecución                     | `brainstorming` → `writing-plans` → `executing-plans`   |
| Bug difícil                                               | `systematic-debugging`                                  |
| TDD                                                       | `test-driven-development`                               |
| Antes de decir "ya está"                                  | `verification-before-completion`                        |
| Vídeo, motion graphics, promo de producto                 | `hyperframes` (punto de entrada), `product-launch-video`|
| Presentación interactiva en HTML                          | `slideshow` (HyperFrames)                               |
| Word, PDF, PowerPoint, Excel                              | `docx`, `pdf`, `pptx`, `xlsx`                           |
| Crear o mejorar una skill                                 | `skill-creator`                                         |
| Barra de estado de Claude Code                            | `claude-hud:setup`                                      |
## Formato de la respuesta

```
Para <tarea>: **<skill>**: <por qué, una frase>.
[Luego: **<skill-2>**: <para qué>.]
[No la tienes instalada: `<comando>`]
¿La lanzo?
```

Responde en el idioma del usuario. Sin listas largas ni repasos del catálogo entero salvo que lo
pida.
