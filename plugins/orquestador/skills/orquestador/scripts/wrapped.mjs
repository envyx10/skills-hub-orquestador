#!/usr/bin/env node
// Skills Wrapped: analiza el historial local de Claude Code (~/.claude/projects/**/*.jsonl)
// y genera un informe de cómo usas tus skills: las que más usas, las instaladas que nunca
// saltan (y el contexto que gastan), las duplicadas y las ocasiones en que una skill
// instalada encajaba con lo que pediste y no se usó.
//
// Todo se procesa en local. El HTML no incluye prompts ni nombres de proyectos (salvo con
// --projects), así que se puede compartir.
//
//   node wrapped.mjs [--since AAAA-MM-DD] [--out <carpeta>] [--projects] [--demo]
//
// Escribe wrapped-<fecha>.html y wrapped-<fecha>.json en --out (por defecto
// ~/.claude/skills-wrapped) e imprime en stdout un resumen JSON para que el orquestador
// lo comente.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// ---------- argumentos ----------

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const HOME = os.homedir();
const CLAUDE = process.env.CLAUDE_CONFIG_DIR || path.join(HOME, ".claude");
const OUT = opt("out", path.join(CLAUDE, "skills-wrapped"));
const SINCE = opt("since", null);
const SHOW_PROJECTS = flag("projects");
const DEMO = flag("demo");

// ---------- conocimiento del catálogo ----------

const CATEGORY = {
  "frontend-design": "diseno", "ui-ux-pro-max": "diseno", "design-taste-frontend": "diseno",
  "taste-skill": "diseno", "redesign-skill": "diseno", "impeccable": "diseno",
  "emil-design-eng": "diseno", "apple-design": "diseno", "web-design-guidelines": "diseno",
  "break-ui": "diseno", "prototype": "diseno", "pick-ui-library": "diseno",
  "mobile-native": "diseno", "shadcn": "diseno",
  "animate": "animacion", "review-animations": "animacion", "improve-animations": "animacion",
  "find-animation-opportunities": "animacion", "animation-performance": "animacion",
  "animation-vocabulary": "animacion", "ask-sonner": "animacion",
  "vercel-react-best-practices": "react", "vercel-composition-patterns": "react",
  "nextjs-best-practices": "react",
  "workers-best-practices": "cloudflare", "wrangler": "cloudflare", "web-perf": "cloudflare",
  "turnstile-spin": "cloudflare",
  "supabase": "backend", "supabase-postgres-best-practices": "backend",
  "deprecation-and-migration": "backend",
  "security-audit": "seguridad", "webapp-testing": "seguridad",
  "brainstorming": "workflow", "writing-plans": "workflow", "executing-plans": "workflow",
  "subagent-driven-development": "workflow", "dispatching-parallel-agents": "workflow",
  "systematic-debugging": "workflow", "test-driven-development": "workflow",
  "verification-before-completion": "workflow", "requesting-code-review": "workflow",
  "receiving-code-review": "workflow", "using-git-worktrees": "workflow",
  "finishing-a-development-branch": "workflow", "writing-skills": "workflow",
  "docx": "documentos", "pdf": "documentos", "pptx": "documentos", "xlsx": "documentos",
  "skill-creator": "documentos",
};
const isVideo = (s) => s.startsWith("hyperframes") || ["product-launch-video", "slideshow", "media-use",
  "pr-to-video", "music-to-video", "faceless-explainer", "talking-head-recut", "embedded-captions",
  "motion-graphics", "general-video", "remotion-to-hyperframes", "figma"].includes(s);
const categoryOf = (s) => CATEGORY[s] || (isVideo(s) ? "video" : "otras");

const PERSONA = {
  diseno: ["🎨", "Esteta del píxel", "Si algo está descuadrado, no duermes."],
  animacion: ["🎞️", "Coreógrafo de interfaces", "Para ti nada aparece: entra con su curva."],
  react: ["⚛️", "Reactivo", "Cuentas renders como otros cuentan ovejas."],
  cloudflare: ["☁️", "Nómada del edge", "Tu código vive más cerca del usuario que tú."],
  backend: ["🗄️", "Fontanero de datos", "Las migraciones no te dan miedo. Bueno, un poco."],
  seguridad: ["🔐", "Paranoico profesional", "Antes de abrir la puerta, compruebas las bisagras."],
  workflow: ["🧠", "Metódico", "Primero el plan, luego el código, luego la prueba."],
  video: ["🎬", "Director", "Tus commits podrían tener banda sonora."],
  documentos: ["📄", "Oficinista 2.0", "Word, PDF y Excel tiemblan cuando llegas."],
  otras: ["🧭", "Explorador", "Pruebas un poco de todo y te quedas con lo que funciona."],
};
const CATEGORY_LABEL = {
  diseno: "Diseño", animacion: "Animación", react: "React y Next", cloudflare: "Cloudflare",
  backend: "Backend", seguridad: "Seguridad", workflow: "Workflow", video: "Vídeo",
  documentos: "Documentos", otras: "Otras",
};

// Cuándo una petición encajaba con una skill. Conservador a propósito: mejor perder un
// caso que inventarse oportunidades.
const TRIGGERS = {
  "systematic-debugging": /\b(bug|no funciona|falla|fallo|se rompe|est[aá] roto|crash|depura|debug)/i,
  "brainstorming": /(lluvia de ideas|brainstorm|no s[eé] por d[oó]nde empezar|tengo una idea)/i,
  "test-driven-development": /\b(tdd|test primero|tests? first)\b/i,
  "animate": /\b(anima(r|ci[oó]n|ciones)?|animate|animation)\b/i,
  "animation-performance": /(tirones|jank|stutter|\bfps\b|animaci[oó]n.*(lenta|va mal))/i,
  "design-taste-frontend": /\b(landing|portfolio|p[aá]gina de marketing)\b/i,
  "impeccable": /((ux|ui|dise[nñ]o|interfaz)\b.*(fatal|feo|mejor|arregl|pul[ei]|audit))|((mejora|arregla|pule|audita).*(ux|ui|dise[nñ]o|interfaz)\b)/i,
  "security-audit": /(seguridad|vulnerab|pentest|\bsecurity\b)/i,
  "web-perf": /(lighthouse|core web vitals|\blcp\b|\bcls\b|carga lenta|page ?speed)/i,
  "vercel-react-best-practices": /(re-?renders?|react.*(lento|rendimiento|perf))/i,
  "supabase": /\b(supabase|rls)\b/i,
  "supabase-postgres-best-practices": /(postgres|consulta lenta|[ií]ndices?\b.*(tabla|sql))/i,
  "wrangler": /\bwrangler\b/i,
  "turnstile-spin": /(turnstile|captcha)/i,
  "webapp-testing": /(playwright|\be2e\b)/i,
  "deprecation-and-migration": /(deprecat|retirar la api|migrar (el )?esquema)/i,
  "shadcn": /\bshadcn\b/i,
  "ask-sonner": /\b(sonner|toasts?)\b/i,
  "break-ui": /(casos? extremos?|edge cases?)/i,
  "pdf": /\bpdf\b/i,
  "docx": /\b(docx|documento word)\b/i,
  "pptx": /\b(pptx|powerpoint)\b/i,
  "xlsx": /\b(xlsx|excel|hoja de c[aá]lculo)\b/i,
  "hyperframes": /\b(v[ií]deo|video|motion graphics?)\b/i,
};

// ---------- utilidades ----------

const base = (name) => String(name || "").split(":").pop().trim();
const tokens = (chars) => Math.round(chars / 3.8);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmt = (n) => n.toLocaleString("es-ES");

function walk(dir, out = []) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".jsonl")) out.push(p);
  }
  return out;
}

function frontmatter(file) {
  try {
    const txt = fs.readFileSync(file, "utf8");
    const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return {};
    const fm = {};
    let key = null;
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^([a-zA-Z-]+):\s*(.*)$/);
      if (kv) { key = kv[1]; fm[key] = kv[2].replace(/^['"]|['"]$/g, ""); }
      else if (key && /^\s+/.test(line)) fm[key] += " " + line.trim();
    }
    return fm;
  } catch { return {}; }
}

// Skills instaladas: carpeta de usuario, plugins y carpetas .claude/skills de los proyectos.
function installedSkills(projectDirs) {
  const found = new Map(); // nombre base -> { name, scopes:Set, descChars, manual }
  const add = (dir, scope) => {
    const file = path.join(dir, "SKILL.md");
    if (!fs.existsSync(file)) return;
    const fm = frontmatter(file);
    const names = new Set([path.basename(dir), fm.name].filter(Boolean));
    const key = path.basename(dir);
    const cur = found.get(key) || { name: key, aliases: new Set(), scopes: [], descChars: 0, manual: false };
    names.forEach((n) => cur.aliases.add(n));
    cur.scopes.push(scope);
    cur.descChars = Math.max(cur.descChars, (fm.description || "").length + key.length);
    cur.manual = cur.manual || fm["disable-model-invocation"] === "true";
    found.set(key, cur);
  };
  const scanSkillsDir = (dir, scope) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) if (e.isDirectory() && e.name !== "synced") add(path.join(dir, e.name), scope);
  };

  scanSkillsDir(path.join(CLAUDE, "skills"), "usuario");

  try {
    const ip = JSON.parse(fs.readFileSync(path.join(CLAUDE, "plugins", "installed_plugins.json"), "utf8"));
    for (const [id, installs] of Object.entries(ip.plugins || {})) {
      for (const inst of [].concat(installs)) {
        if (inst.installPath) scanSkillsDir(path.join(inst.installPath, "skills"), `plugin ${id.split("@")[0]}`);
      }
    }
  } catch { /* sin plugins */ }

  for (const d of projectDirs) scanSkillsDir(path.join(d, ".claude", "skills"), "proyecto");
  return found;
}

// ---------- lectura del historial ----------

function analyze() {
  const files = walk(path.join(CLAUDE, "projects"));
  const sessions = new Map(); // sessionId -> { cwd, available:Set, invoked:Set, prompts:[], start }
  const uses = new Map(); // base -> { count, sessions:Set, first, last, raw:Set }
  const hours = Array(24).fill(0);
  const days = new Set();
  const months = new Map();
  let prompts = 0;
  const sinceTs = SINCE ? Date.parse(SINCE) : 0;

  const session = (id) => {
    if (!sessions.has(id)) sessions.set(id, { cwd: null, available: new Set(), invoked: new Set(), prompts: [], start: null });
    return sessions.get(id);
  };

  for (const f of files) {
    let text;
    try { text = fs.readFileSync(f, "utf8"); } catch { continue; }
    for (const line of text.split("\n")) {
      if (!line || line[0] !== "{") continue;
      let j;
      try { j = JSON.parse(line); } catch { continue; }
      const ts = j.timestamp ? Date.parse(j.timestamp) : NaN;
      if (sinceTs && ts && ts < sinceTs) continue;
      const id = j.sessionId || j.session_id || path.basename(f, ".jsonl");
      const s = session(id);
      if (j.cwd && !s.cwd) s.cwd = j.cwd;
      if (ts && (!s.start || ts < s.start)) s.start = ts;

      if (j.type === "attachment" && j.attachment) {
        const a = j.attachment;
        if (a.type === "skill_listing" && typeof a.content === "string") {
          for (const m of a.content.matchAll(/^- ([^\s:]+(?::[^\s:]+)*):/gm)) s.available.add(base(m[1]));
        } else if (a.type === "dynamic_skill" && Array.isArray(a.skillNames)) {
          a.skillNames.forEach((n) => s.available.add(base(n)));
        }
        continue;
      }

      const content = j.message && j.message.content;
      if (j.type === "assistant" && Array.isArray(content)) {
        for (const b of content) {
          if (b.type === "tool_use" && b.name === "Skill" && b.input && b.input.skill) {
            const k = base(b.input.skill);
            const u = uses.get(k) || { count: 0, sessions: new Set(), first: ts, last: ts, raw: new Set() };
            u.count++; u.sessions.add(id); u.raw.add(b.input.skill);
            if (ts && (!u.first || ts < u.first)) u.first = ts;
            if (ts && (!u.last || ts > u.last)) u.last = ts;
            uses.set(k, u);
            s.invoked.add(k);
          }
        }
      }

      if (j.type === "user" && !j.isSidechain && !j.isMeta) {
        const t = typeof content === "string" ? content
          : Array.isArray(content) && !content.some((b) => b.type === "tool_result")
            ? content.filter((b) => b.type === "text").map((b) => b.text).join(" ") : "";
        const cmd = t.match(/<command-name>\/?([^<\s]+)<\/command-name>/);
        if (cmd) { s.invoked.add(base(cmd[1])); continue; }
        if (!t || t.startsWith("<") || t.startsWith("Caveat:")) continue;
        prompts++;
        // Solo las palabras del usuario: fuera textos pegados y encargos de otras sesiones.
        const own = t.replace(/<pasted_content[\s\S]*?<\/pasted_content>/g, " ").replace(/<[^>]+>/g, " ").trim();
        if (own && !/^Task \(from the session/.test(own)) s.prompts.push(own.slice(0, 600));
        if (ts) {
          const d = new Date(ts);
          hours[d.getHours()]++;
          days.add(d.toISOString().slice(0, 10));
          const mk = d.toISOString().slice(0, 7);
          months.set(mk, (months.get(mk) || 0) + 1);
        }
      }
    }
  }
  return { sessions, uses, hours, days, months, prompts };
}

const projectRoot = (cwd) => cwd && cwd.split(/[\\/]\.claude[\\/]worktrees[\\/]|[\\/]\.worktrees[\\/]/)[0];

function build() {
  const { sessions, uses, hours, days, months, prompts } = analyze();
  const realSessions = [...sessions.values()].filter((s) => s.prompts.length > 0 || s.invoked.size > 0);
  const projects = [...new Set(realSessions.map((s) => projectRoot(s.cwd)).filter(Boolean))];
  const installed = installedSkills(projects.filter((p) => fs.existsSync(p)));

  // Uso por skill (nombre base) y alias de las instaladas.
  const aliasToKey = new Map();
  for (const [k, v] of installed) v.aliases.forEach((a) => aliasToKey.set(a, k));
  const usedKey = (n) => aliasToKey.get(n) || n;
  const usage = new Map();
  for (const [n, u] of uses) {
    const k = usedKey(n);
    const cur = usage.get(k) || { name: k, count: 0, sessions: new Set(), first: u.first, last: u.last };
    cur.count += u.count;
    u.sessions.forEach((x) => cur.sessions.add(x));
    cur.first = Math.min(cur.first || Infinity, u.first || Infinity);
    cur.last = Math.max(cur.last || 0, u.last || 0);
    usage.set(k, cur);
  }
  const top = [...usage.values()]
    .map((u) => ({ name: u.name, count: u.count, sessions: u.sessions.size, category: categoryOf(u.name), last: u.last ? new Date(u.last).toISOString().slice(0, 10) : null }))
    .sort((a, b) => b.count - a.count || b.sessions - a.sessions);

  // Instaladas que nunca se han usado y lo que cuestan en contexto.
  const never = [...installed.values()]
    .filter((v) => !usage.has(v.name) && ![...v.aliases].some((a) => usage.has(a)))
    .map((v) => ({ name: v.name, scopes: [...new Set(v.scopes)], manual: v.manual, tokens: v.manual ? 0 : tokens(v.descChars), category: categoryOf(v.name) }))
    .sort((a, b) => b.tokens - a.tokens);
  const neverTokens = never.reduce((t, s) => t + s.tokens, 0);

  // Duplicadas: la misma skill instalada por más de una vía.
  const duplicates = [...installed.values()]
    .filter((v) => new Set(v.scopes).size > 1)
    .map((v) => ({ name: v.name, scopes: [...new Set(v.scopes)], tokens: v.manual ? 0 : tokens(v.descChars) }));

  // Oportunidades perdidas: la petición encajaba, la skill estaba disponible y no se usó.
  const missed = new Map();
  for (const [id, s] of sessions) {
    if (!s.prompts.length) continue;
    for (const [skill, re] of Object.entries(TRIGGERS)) {
      // Disponible en esa sesión: lo dice su listado de skills o, si no lo hay, una instalación
      // global (usuario o plugin). Las de proyecto solo cuentan si salieron en el listado.
      const inst = installed.get(skill);
      const available = s.available.has(skill) || (s.available.size === 0 && inst && inst.scopes.some((x) => x !== "proyecto"));
      if (!available || s.invoked.has(skill)) continue;
      const hit = s.prompts.find((p) => re.test(p));
      if (!hit) continue;
      const m = missed.get(skill) || { name: skill, sessions: 0, examples: [] };
      m.sessions++;
      if (m.examples.length < 3) m.examples.push({ project: SHOW_PROJECTS ? path.basename(projectRoot(s.cwd) || "") : null, prompt: hit.replace(/\s+/g, " ").slice(0, 140) });
      missed.set(skill, m);
    }
  }
  const missedList = [...missed.values()].sort((a, b) => b.sessions - a.sessions);

  // Perfil por categoría.
  const byCat = {};
  for (const t of top) byCat[t.category] = (byCat[t.category] || 0) + t.count;
  const catRank = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const lead = catRank.find(([c]) => c !== "otras") || catRank[0] || ["otras"];
  const persona = PERSONA[lead[0]];

  const peakHour = hours.indexOf(Math.max(...hours));
  const busiestMonth = [...months.entries()].sort((a, b) => b[1] - a[1])[0];
  const totalUses = top.reduce((t, s) => t + s.count, 0);
  const sessionsWithSkill = realSessions.filter((s) => s.invoked.size > 0).length;

  const recommendations = [];
  const removable = never.filter((s) => !s.manual && s.scopes.includes("usuario")).slice(0, 8);
  if (removable.length) recommendations.push({ kind: "quitar", text: `Quita o pasa a manual ${removable.length} skills que nunca usas: ahorras ≈${fmt(removable.reduce((t, s) => t + s.tokens, 0))} tokens de contexto en cada sesión.`, skills: removable.map((s) => s.name) });
  if (duplicates.length) recommendations.push({ kind: "duplicadas", text: `Tienes ${duplicates.length} skills instaladas dos veces (por ejemplo como skill suelta y dentro de un plugin). Deja una sola copia.`, skills: duplicates.map((s) => s.name) });
  for (const m of missedList.slice(0, 3)) recommendations.push({ kind: "usar", text: `Usa ${m.name}: encajaba en ${m.sessions} ${m.sessions === 1 ? "sesión" : "sesiones"} y no saltó. Menciónala o invócala con /${m.name}.`, skills: [m.name] });

  return {
    generated: new Date().toISOString(),
    since: SINCE,
    totals: {
      sessions: realSessions.length, prompts, activeDays: days.size, projects: projects.length,
      skillUses: totalUses, distinctSkills: top.length, installed: installed.size,
      sessionsWithSkill, skillRate: realSessions.length ? Math.round((100 * sessionsWithSkill) / realSessions.length) : 0,
      peakHour, busiestMonth: busiestMonth ? busiestMonth[0] : null,
    },
    persona: { emoji: persona[0], title: persona[1], line: persona[2], categories: catRank.map(([c, n]) => ({ category: c, label: CATEGORY_LABEL[c], uses: n })) },
    top, never, neverTokens, duplicates, missed: missedList, recommendations,
    projects: SHOW_PROJECTS ? projects.map((p) => path.basename(p)) : undefined,
  };
}

// ---------- datos de ejemplo para capturas ----------

function demo() {
  const top = [
    ["impeccable", 41, "diseno"], ["frontend-design", 33, "diseno"], ["systematic-debugging", 27, "workflow"],
    ["animate", 19, "animacion"], ["design-taste-frontend", 14, "diseno"], ["security-audit", 9, "seguridad"],
    ["brainstorming", 8, "workflow"], ["pdf", 5, "documentos"],
  ].map(([name, count, category]) => ({ name, count, sessions: Math.ceil(count / 2), category, last: "2026-10-24" }));
  const never = ["hyperframes-registry", "hyperframes-keyframes", "media-use", "ask-sonner", "animation-vocabulary", "wrangler", "turnstile-spin", "slideshow", "pick-ui-library"]
    .map((name, i) => ({ name, scopes: ["usuario"], manual: false, tokens: 140 - i * 9, category: categoryOf(name) }));
  return {
    generated: new Date().toISOString(), since: null,
    totals: { sessions: 214, prompts: 1873, activeDays: 96, projects: 9, skillUses: 156, distinctSkills: 18, installed: 52, sessionsWithSkill: 88, skillRate: 41, peakHour: 23, busiestMonth: "2026-10" },
    persona: { emoji: "🎨", title: "Esteta del píxel", line: "Si algo está descuadrado, no duermes.", categories: [{ category: "diseno", label: "Diseño", uses: 88 }, { category: "workflow", label: "Workflow", uses: 35 }, { category: "animacion", label: "Animación", uses: 19 }, { category: "seguridad", label: "Seguridad", uses: 9 }, { category: "documentos", label: "Documentos", uses: 5 }] },
    top, never, neverTokens: never.reduce((t, s) => t + s.tokens, 0),
    duplicates: [{ name: "hyperframes", scopes: ["usuario", "plugin hyperframes"], tokens: 160 }, { name: "media-use", scopes: ["usuario", "plugin hyperframes"], tokens: 150 }],
    missed: [{ name: "systematic-debugging", sessions: 12, examples: [] }, { name: "animation-performance", sessions: 4, examples: [] }, { name: "web-perf", sessions: 3, examples: [] }],
    recommendations: [
      { kind: "quitar", text: "Quita o pasa a manual 8 skills que nunca usas: ahorras ≈870 tokens de contexto en cada sesión.", skills: [] },
      { kind: "duplicadas", text: "Tienes 2 skills instaladas dos veces (por ejemplo como skill suelta y dentro de un plugin). Deja una sola copia.", skills: [] },
      { kind: "usar", text: "Usa systematic-debugging: encajaba en 12 sesiones y no saltó. Menciónala o invócala con /systematic-debugging.", skills: [] },
    ],
  };
}

// ---------- HTML ----------

function html(r) {
  const t = r.totals;
  const max = Math.max(1, ...r.top.map((s) => s.count));
  const catMax = Math.max(1, ...r.persona.categories.map((c) => c.uses));
  const year = (r.generated || "").slice(0, 4);
  const hour = (h) => `${String(h).padStart(2, "0")}:00`;
  const month = (m) => m ? new Date(m + "-01T12:00:00").toLocaleDateString("es-ES", { month: "long", year: "numeric" }) : "-";
  const owl = t.peakHour >= 22 || t.peakHour < 6 ? "🦉 Búho nocturno" : t.peakHour < 12 ? "🌅 Madrugador" : "☀️ De tarde";

  const bars = r.top.slice(0, 8).map((s, i) => `
      <li class="bar" style="--w:${Math.max(6, Math.round((100 * s.count) / max))}%">
        <span class="rank">${i + 1}</span>
        <span class="bar-name"><code>${esc(s.name)}</code><small>${esc(CATEGORY_LABEL[s.category] || "")}</small></span>
        <span class="bar-track"><span class="bar-fill"></span></span>
        <span class="bar-n">${fmt(s.count)}</span>
      </li>`).join("");

  const cats = r.persona.categories.slice(0, 6).map((c) => `
      <li><span>${esc(c.label)}</span><span class="mini"><span style="width:${Math.round((100 * c.uses) / catMax)}%"></span></span><b>${fmt(c.uses)}</b></li>`).join("");

  const chips = (list, extra) => list.map((s) => `<span class="chip"><code>${esc(s.name)}</code>${extra ? extra(s) : ""}</span>`).join("");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Skills Wrapped ${esc(year)}</title>
<style>
  :root {
    --bg: #110e0c; --card: #1d1815; --card-2: #261e19; --line: #3a2d25;
    --text: #f5efe9; --muted: #b3a597; --accent: #d97757; --accent-2: #f0b49a;
    --good: #7fc98a; --warn: #e5b567;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text);
    font: 16px/1.5 "Segoe UI", -apple-system, Helvetica, Arial, sans-serif; }
  .wrap { max-width: 980px; margin: 0 auto; padding: 40px 16px 64px; }
  code { font-family: "Cascadia Code", SFMono-Regular, Menlo, Consolas, monospace; font-size: .92em; }
  header { position: relative; overflow: hidden; border-radius: 28px; padding: 44px 40px;
    background: radial-gradient(120% 140% at 85% 30%, rgba(217,119,87,.45), transparent 55%), linear-gradient(135deg, #1a1411, #2c1b13);
    border: 1px solid var(--line); }
  .kicker { display: inline-flex; gap: 8px; align-items: center; padding: 6px 14px; border-radius: 999px;
    font-size: 13px; font-weight: 600; letter-spacing: .08em; color: var(--accent-2);
    background: rgba(217,119,87,.14); border: 1px solid rgba(217,119,87,.45); }
  h1 { margin: 18px 0 6px; font-size: clamp(40px, 7vw, 72px); line-height: 1; letter-spacing: -.03em; }
  h1 span { background: linear-gradient(90deg, var(--text), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .persona { margin-top: 26px; display: flex; gap: 18px; align-items: center; }
  .persona .emoji { font-size: 56px; line-height: 1; }
  .persona b { display: block; font-size: 26px; }
  .persona small { color: var(--muted); font-size: 16px; }
  .grid { display: grid; gap: 16px; margin-top: 16px; }
  .stats { grid-template-columns: repeat(4, 1fr); }
  .two { grid-template-columns: 1fr 1fr; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 22px; padding: 24px; }
  .stat b { display: block; font-size: 38px; line-height: 1.1; letter-spacing: -.02em; }
  .stat span { color: var(--muted); font-size: 14px; }
  h2 { margin: 0 0 16px; font-size: 20px; display: flex; gap: 10px; align-items: center; }
  h2 small { margin-left: auto; color: var(--muted); font-weight: 400; font-size: 14px; }
  ol { list-style: none; margin: 0; padding: 0; }
  .bar { display: grid; grid-template-columns: 28px minmax(170px, 230px) 1fr 48px; gap: 12px; align-items: center; padding: 8px 0; }
  .rank { color: var(--muted); font-weight: 700; text-align: center; }
  .bar:first-child .rank { color: var(--accent); }
  .bar-name { display: flex; flex-direction: column; min-width: 0; }
  .bar-name code { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bar-name small { color: var(--muted); font-size: 12px; }
  .bar-track { height: 12px; background: var(--card-2); border-radius: 999px; overflow: hidden; }
  .bar-fill { display: block; height: 100%; width: var(--w); border-radius: 999px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); }
  .bar-n { text-align: right; font-weight: 700; }
  .cats li { display: grid; grid-template-columns: 110px 1fr 40px; gap: 10px; align-items: center; padding: 6px 0; }
  .cats li b { text-align: right; }
  .mini { height: 8px; background: var(--card-2); border-radius: 999px; overflow: hidden; }
  .mini span { display: block; height: 100%; background: var(--accent); border-radius: 999px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { display: inline-flex; gap: 6px; align-items: center; padding: 6px 12px; border-radius: 999px; background: var(--card-2); border: 1px solid var(--line); font-size: 14px; }
  .chip em { font-style: normal; color: var(--muted); font-size: 12px; }
  .big { font-size: 44px; font-weight: 800; letter-spacing: -.02em; color: var(--warn); line-height: 1; }
  .note { color: var(--muted); font-size: 14px; margin: 8px 0 16px; }
  .missed li { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); }
  .missed li:last-child { border-bottom: 0; }
  .missed b { color: var(--warn); white-space: nowrap; }
  .recs li { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
  .recs li:last-child { border-bottom: 0; }
  .recs .i { font-size: 20px; }
  .empty { color: var(--muted); }
  footer { margin-top: 28px; text-align: center; color: var(--muted); font-size: 13px; }
  footer a { color: var(--accent-2); }
  @media (max-width: 760px) {
    header { padding: 32px 22px; }
    .stats { grid-template-columns: 1fr 1fr; }
    .two { grid-template-columns: 1fr; }
    h2 { flex-wrap: wrap; }
    h2 small { margin-left: 0; width: 100%; }
    .bar { grid-template-columns: 22px 1fr 40px; }
    .bar-track { grid-column: 2 / 4; grid-row: 2; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <span class="kicker">🧭 SKILLS WRAPPED · ${esc(year)}</span>
    <h1><span>Tu año en skills</span></h1>
    <div class="persona">
      <div class="emoji">${r.persona.emoji}</div>
      <div><b>${esc(r.persona.title)}</b><small>${esc(r.persona.line)}</small></div>
    </div>
  </header>

  <section class="grid stats">
    <div class="card stat"><b>${fmt(t.skillUses)}</b><span>veces que saltó una skill</span></div>
    <div class="card stat"><b>${fmt(t.distinctSkills)}<small style="font-size:18px;color:var(--muted)"> / ${fmt(t.installed)}</small></b><span>skills distintas usadas / instaladas</span></div>
    <div class="card stat"><b>${t.skillRate}%</b><span>de ${fmt(t.sessions)} sesiones usaron alguna</span></div>
    <div class="card stat"><b>${hour(t.peakHour)}</b><span>${owl}</span></div>
  </section>

  <section class="grid">
    <div class="card">
      <h2>🏆 Tu top de skills <small>${fmt(t.prompts)} peticiones · ${fmt(t.activeDays)} días · mes fuerte: ${esc(month(t.busiestMonth))}</small></h2>
      ${r.top.length ? `<ol>${bars}</ol>` : `<p class="empty">Todavía no has usado ninguna skill. Prueba a pedirle al orquestador una recomendación.</p>`}
    </div>
  </section>

  <section class="grid two">
    <div class="card cats">
      <h2>🧬 Por categorías</h2>
      ${r.persona.categories.length ? `<ol>${cats}</ol>` : `<p class="empty">Sin datos aún.</p>`}
    </div>
    <div class="card">
      <h2>🕳️ Oportunidades perdidas</h2>
      <p class="note">Sesiones en las que lo que pediste encajaba con una skill instalada y no se usó.</p>
      ${r.missed.length ? `<ol class="missed">${r.missed.slice(0, 6).map((m) => `<li><code>${esc(m.name)}</code><b>${fmt(m.sessions)} ${m.sessions === 1 ? "sesión" : "sesiones"}</b></li>`).join("")}</ol>` : `<p class="empty">Ninguna: cuando tocaba, la usaste. 👏</p>`}
    </div>
  </section>

  <section class="grid two">
    <div class="card">
      <h2>💤 Instaladas que nunca usas</h2>
      <div class="big">≈${fmt(r.neverTokens)}</div>
      <p class="note">tokens de contexto que se cargan en cada sesión por ${fmt(r.never.filter((s) => !s.manual).length)} skills que no han saltado nunca.</p>
      <div class="chips">${chips(r.never.slice(0, 14))}${r.never.length > 14 ? `<span class="chip"><em>+${r.never.length - 14} más</em></span>` : ""}</div>
    </div>
    <div class="card">
      <h2>👯 Duplicadas</h2>
      <p class="note">Skills instaladas por más de una vía. Cada copia vuelve a ocupar contexto.</p>
      ${r.duplicates.length ? `<div class="chips">${chips(r.duplicates.slice(0, 8), (s) => `<em>${esc(s.scopes.join(" + "))}</em>`)}${r.duplicates.length > 8 ? `<span class="chip"><em>+${r.duplicates.length - 8} más</em></span>` : ""}</div>` : `<p class="empty">Ninguna. Todo limpio.</p>`}
    </div>
  </section>

  <section class="grid">
    <div class="card">
      <h2>✅ Qué haría yo</h2>
      ${r.recommendations.length ? `<ol class="recs">${r.recommendations.map((x) => `<li><span class="i">${x.kind === "quitar" ? "🧹" : x.kind === "duplicadas" ? "👯" : "🎯"}</span><span>${esc(x.text)}</span></li>`).join("")}</ol>` : `<p class="empty">Tu catálogo está en forma. Nada que tocar.</p>`}
    </div>
  </section>

  <footer>Generado en local con <a href="https://github.com/envyx10/skills-hub-orquestador">skills-hub-orquestador</a> · sin prompts ni nombres de proyectos</footer>
</div>
</body>
</html>
`;
}

// ---------- salida ----------

const report = DEMO ? demo() : build();
fs.mkdirSync(OUT, { recursive: true });
const stamp = DEMO ? "demo" : new Date().toISOString().slice(0, 10);
const htmlPath = path.join(OUT, `wrapped-${stamp}.html`);
const jsonPath = path.join(OUT, `wrapped-${stamp}.json`);
fs.writeFileSync(htmlPath, html(report));
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

// Resumen compacto para el orquestador (los ejemplos de prompts solo salen aquí, nunca en el HTML).
const summary = {
  html: htmlPath, json: jsonPath, totals: report.totals, persona: report.persona.title,
  top: report.top.slice(0, 10).map((s) => `${s.name} (${s.count})`),
  neverUsed: report.never.length, neverTokens: report.neverTokens,
  neverUsedSample: report.never.slice(0, 15).map((s) => s.name),
  duplicates: report.duplicates.map((s) => `${s.name} [${s.scopes.join(" + ")}]`),
  missed: report.missed.slice(0, 8).map((m) => ({ skill: m.name, sessions: m.sessions, examples: m.examples })),
  recommendations: report.recommendations.map((x) => x.text),
};
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
