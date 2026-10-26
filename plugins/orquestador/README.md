# orquestador

Skill que recomienda qué skill usar según la tarea. Lee lo que quieres hacer, mira qué skills
tienes instaladas en la sesión y te propone la mejor, o una secuencia corta, con una frase de por
qué y el comando para instalarla si te falta. Cubre diseño de UI, animación, React y Next.js,
Cloudflare, Supabase, seguridad, testing, flujo de trabajo, vídeo y documentos.

```text
/plugin marketplace add envyx10/skills-hub-orquestador
/plugin install orquestador@skills-hub-orquestador
```

Uso: pregunta «¿qué skill uso para…?» o lanza `/orquestador <tarea>`. El catálogo completo está en
[skills/orquestador/references/catalogo.md](skills/orquestador/references/catalogo.md).

Además, `/orquestador wrapped` genera **Skills Wrapped**: un informe local de qué skills usas, cuáles
nunca saltan (y el contexto que gastan), cuáles tienes duplicadas y cuándo no usaste una que encajaba.

Recommends which Claude Code skill to use for a task, and how to install it if missing, plus a local Skills Wrapped report.
