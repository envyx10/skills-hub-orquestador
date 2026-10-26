# Catálogo de skills

Cada entrada: qué hace, cuándo usarla (y cuándo no), de dónde viene y cómo instalarla.
Las skills de terceros **no se copian aquí**: se instalan desde su repositorio original.

Convenciones de instalación:

- `npx skills add <repo> -s <skill> -g` instala una skill suelta para tu usuario (CLI de
  [skills.sh](https://skills.sh)). Sin `-g` la instala en el proyecto actual.
- `/plugin marketplace add <repo>` y luego `/plugin install <plugin>@<marketplace>` instala un
  plugin de Claude Code.

## Diseño de interfaz

| Skill | Cuándo | Cuándo no | Origen | Instalar |
| ----- | ------ | --------- | ------ | -------- |
| `frontend-design` | UI nueva con dirección estética propia | Ajustes mínimos de estilo | anthropics/skills | `npx skills add anthropics/skills -s frontend-design -g` |
| `ui-ux-pro-max` | Elegir estilo, paleta, tipografía o stack con datos | Crítica de una UI ya hecha | nextlevelbuilder/ui-ux-pro-max-skill | `npx skills add nextlevelbuilder/ui-ux-pro-max-skill -g` |
| `design-taste-frontend` | Landing, portfolio o marketing que no parezca de plantilla | Paneles internos sencillos | Leonxlnx/taste-skill | `npx skills add Leonxlnx/taste-skill -g` |
| `impeccable` | Criticar, auditar, pulir, simplificar o endurecer una UI | Backend | pbakaus/impeccable | `npx skills add pbakaus/impeccable -g` |
| `emil-design-eng` | Detalles de pulido, componentes que se sienten bien | Elegir paleta o marca | emilkowalski/skills | `npx skills add emilkowalski/skills -s emil-design-eng -g` |
| `apple-design` | Gestos, springs, materiales, tipografía estilo Apple | Webs de contenido sin interacción | emilkowalski/skills | `npx skills add emilkowalski/skills -s apple-design -g` |
| `web-design-guidelines` | Revisar UI contra pautas de interfaz y accesibilidad | Diseñar desde cero | vercel-labs/agent-skills | `npx skills add vercel-labs/agent-skills -s web-design-guidelines -g` |
| `break-ui` | Probar un componente con datos extremos | Revisión estética | emilkowalski/skills | `npx skills add emilkowalski/skills -s break-ui -g` |
| `prototype` | Varias versiones de un componente con selector visual (solo bajo petición) | Cuando ya hay diseño cerrado | emilkowalski/skills | `npx skills add emilkowalski/skills -s prototype -g` |
| `pick-ui-library` | Elegir librería de frontend (solo bajo petición) | Proyecto con stack ya fijado | emilkowalski/skills | `npx skills add emilkowalski/skills -s pick-ui-library -g` |
| `mobile-native` | Que una web se sienta nativa en el móvil, PWA | React Native | emilkowalski/skills | `npx skills add emilkowalski/skills -s mobile-native -g` |
| `shadcn` | Añadir, componer o arreglar componentes shadcn/ui | Proyectos sin shadcn | shadcn-ui/ui | `npx skills add shadcn-ui/ui -g` |

## Animación y motion

Todas de [emilkowalski/skills](https://github.com/emilkowalski/skills).

| Skill | Cuándo |
| ----- | ------ |
| `animate` | Construir una animación desde cero, decidiendo si debe animarse, curva, duración, salida |
| `review-animations` | Revisar el motion de un diff con un listón alto (solo bajo petición) |
| `improve-animations` | Auditoría de todo el proyecto y planes de mejora para otros agentes |
| `find-animation-opportunities` | Encontrar sitios que deberían animarse (y descartar los que no) |
| `animation-performance` | Animaciones a tirones, elegir propiedad, CSS vs JS, `will-change` |
| `animation-vocabulary` | Poner nombre a un efecto que sabes describir pero no nombrar |
| `ask-sonner` | Todo sobre toasts con Sonner |

Instalar: `npx skills add emilkowalski/skills -s <skill> -g` (o `-s '*'` para todas).

## React y Next.js

| Skill | Cuándo | Origen | Instalar |
| ----- | ------ | ------ | -------- |
| `vercel-react-best-practices` | Rendimiento en React/Next: waterfalls, bundle, renders | vercel-labs/agent-skills | `npx skills add vercel-labs/agent-skills -s vercel-react-best-practices -g` |
| `vercel-composition-patterns` | Demasiadas props booleanas, compound components, APIs reutilizables | vercel-labs/agent-skills | `npx skills add vercel-labs/agent-skills -s vercel-composition-patterns -g` |
| `nextjs-best-practices` | Principios de App Router, Server Components, data fetching | sickn33/antigravity-awesome-skills | `npx skills add sickn33/antigravity-awesome-skills -s nextjs-best-practices -g` |

## Cloudflare

De [cloudflare/skills](https://github.com/cloudflare/skills): `npx skills add cloudflare/skills -s <skill> -g`.

| Skill | Cuándo |
| ----- | ------ |
| `workers-best-practices` | Escribir, revisar o configurar Workers |
| `wrangler` | Comandos de Wrangler, desarrollo local, previews, despliegue |
| `web-perf` | Core Web Vitals, Lighthouse, carga e interacción |
| `turnstile-spin` | Montar, reparar o migrar a Cloudflare Turnstile con Siteverify |

## Backend y datos

| Skill | Cuándo | Origen | Instalar |
| ----- | ------ | ------ | -------- |
| `supabase` | Cualquier cosa con Supabase: auth, RLS, edge functions, CLI | supabase/agent-skills | `npx skills add supabase/agent-skills -s supabase -g` |
| `supabase-postgres-best-practices` | Esquema, índices, consultas y políticas en Postgres | supabase/agent-skills | `npx skills add supabase/agent-skills -s supabase-postgres-best-practices -g` |
| `deprecation-and-migration` | Retirar APIs, migrar usuarios o esquemas en producción | addyosmani/agent-skills | `npx skills add addyosmani/agent-skills -s deprecation-and-migration -g` |

## Seguridad y testing

| Skill | Cuándo | Origen | Instalar |
| ----- | ------ | ------ | -------- |
| `security-audit` | Auditoría de seguridad, revisión de vulnerabilidades, pentest | cloudflare/security-audit-skill | `npx skills add cloudflare/security-audit-skill -g` |
| `webapp-testing` | Probar una web local con Playwright, capturas, logs | anthropics/skills | `npx skills add anthropics/skills -s webapp-testing -g` |

## Flujo de trabajo (Superpowers)

Plugin [obra/superpowers](https://github.com/obra/superpowers), disponible en el marketplace
oficial: `/plugin install superpowers@claude-plugins-official`.

| Skill | Cuándo |
| ----- | ------ |
| `brainstorming` | Antes de crear algo: explorar la idea y fijar requisitos |
| `writing-plans` | Convertir un diseño en un plan de pasos |
| `executing-plans` | Ejecutar un plan escrito con puntos de control |
| `subagent-driven-development` | Ejecutar un plan con subagentes por tarea |
| `dispatching-parallel-agents` | Varias tareas independientes a la vez |
| `systematic-debugging` | Bugs y tests que fallan, antes de proponer arreglos |
| `test-driven-development` | Implementar con test primero |
| `verification-before-completion` | Antes de afirmar que algo funciona |
| `requesting-code-review` / `receiving-code-review` | Pedir revisión o responder a una |
| `using-git-worktrees` | Aislar trabajo en un worktree |
| `finishing-a-development-branch` | Cerrar una rama: merge, PR o limpieza |
| `writing-skills` | Escribir y probar skills nuevas |

## Vídeo y presentaciones (HyperFrames)

Plugin [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes):
`/plugin marketplace add heygen-com/hyperframes` y `/plugin install hyperframes@hyperframes`.

| Skill | Cuándo |
| ----- | ------ |
| `hyperframes` | Punto de entrada para cualquier vídeo, animación o motion graphic |
| `product-launch-video` | Promo o lanzamiento a partir de una URL o un guion |
| `slideshow` | Presentación navegable con modo presentador |
| `hyperframes-animation`, `-keyframes`, `-audio`, `-creative`, `-core`, `-cli`, `-registry`, `-studio` | Capas concretas de una composición |
| `media-use` | Música, efectos, voz, subtítulos y recursos |
| `pr-to-video`, `music-to-video`, `faceless-explainer`, `talking-head-recut`, `embedded-captions`, `figma`, `remotion-to-hyperframes` | Flujos específicos |

## Documentos (Anthropic)

De [anthropics/skills](https://github.com/anthropics/skills) (en claude.ai vienen ya incluidas):
`npx skills add anthropics/skills -s <skill> -g`.

| Skill | Cuándo |
| ----- | ------ |
| `docx` | Crear o editar documentos Word |
| `pdf` | Leer, unir, rellenar o crear PDF |
| `pptx` | Presentaciones PowerPoint |
| `xlsx` | Hojas de cálculo Excel |
| `skill-creator` | Crear, mejorar y evaluar skills |

## Herramientas de Claude Code

| Plugin | Cuándo | Instalar |
| ------ | ------ | -------- |
| `claude-hud` | Barra de estado con contexto, herramientas y agentes | `/plugin marketplace add jarrodwatts/claude-hud` y `/plugin install claude-hud@claude-hud` |

## Propias (en este repo)

| Skill | Cuándo | Instalar |
| ----- | ------ | -------- |
| `orquestador` | Elegir qué skill usar | `/plugin install orquestador@skills-hub-orquestador` |