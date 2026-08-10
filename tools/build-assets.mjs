#!/usr/bin/env node
/*
  Builds every animated SVG used by README.md, in a dark and a light variant.

  Why SVG: GitHub renders Markdown, not HTML — it throws away <style> and
  <script>. Images survive, and an SVG loaded as an image still runs its own
  SMIL animations. So the whole portfolio design ships as images.

  Run:  node tools/build-assets.mjs      → writes assets/*.svg
*/
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');
mkdirSync(OUT, { recursive: true });

/* ───────────────────────────── tokens ───────────────────────────── */

const DARK = {
  name: 'dark',
  bg: '#040D16', bg2: '#071523', card: '#0B1E2E', card2: '#0F2A3E',
  line: '#173A54', line2: '#122E44', navy: '#1A5276',
  cyan: '#22D3EE', cyan2: '#67E8F9', violet: '#A78BFA',
  ink: '#EDF8FD', ink2: '#B9D6E7', mute: '#7FA3BC',
  green: '#34D399', amber: '#FBBF24',
  aurora: ['#0E5F87', '#0891B2', '#5B21B6'], auroraOp: 0.42, dotOp: 0.5,
  glow: '#22D3EE', glowOp: 0.3,
};

const LIGHT = {
  name: 'light',
  bg: '#EEF5FA', bg2: '#FFFFFF', card: '#FFFFFF', card2: '#F1F8FC',
  line: '#C4DCEC', line2: '#DBEAF4', navy: '#1A5276',
  cyan: '#0B6E82', cyan2: '#0E7490', violet: '#6D28D9',
  ink: '#082031', ink2: '#28536B', mute: '#54798F',
  green: '#047857', amber: '#B45309',
  aurora: ['#8FD3EE', '#7BD8E8', '#C3B4F7'], auroraOp: 0.42, dotOp: 0.9,
  glow: '#7BD8E8', glowOp: 0.4,
};

/* Brand marks (simple-icons, CC0) — 24×24 viewBox. */
const ICON = {
  github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  gmail: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
  facebook: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
};

const SANS = "ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

/* ───────────────────────────── helpers ───────────────────────────── */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const n = (v) => Math.round(v * 100) / 100;
const monoW = (s, fs) => s.length * fs * 0.6;
const sansW = (s, fs) => s.length * fs * 0.53;

function svg(w, h, defs, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>
.s{font-family:${SANS}}
.m{font-family:${MONO}}
text{white-space:pre}
</style>
<defs>
${defs}
</defs>
${body}
</svg>
`;
}

function T(x, y, str, o = {}) {
  const { cls = 's', size = 14, fill, weight, anchor, ls, op, len, extra = '', raw = false } = o;
  return `<text x="${n(x)}" y="${n(y)}" class="${cls}" font-size="${size}"`
    + (fill ? ` fill="${fill}"` : '')
    + (weight ? ` font-weight="${weight}"` : '')
    + (anchor ? ` text-anchor="${anchor}"` : '')
    + (ls ? ` letter-spacing="${ls}"` : '')
    + (op != null ? ` opacity="${op}"` : '')
    + (len ? ` textLength="${n(len)}" lengthAdjust="spacing"` : '')
    + (extra ? ' ' + extra : '')
    + `>${raw ? str : esc(str)}</text>`;
}

function R(x, y, w, h, rx, fill, stroke, sw = 1, extra = '') {
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${rx}"`
    + (fill ? ` fill="${fill}"` : ' fill="none"')
    + (stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '')
    + (extra ? ' ' + extra : '') + '/>';
}

/** A bordered mono chip. Returns { svg, w }. */
function chip(x, y, label, p, o = {}) {
  const { size = 11.5, padX = 12, h = 26, fill = p.card, stroke = p.line, color = p.ink2, radius } = o;
  const w = monoW(label, size) + padX * 2;
  const rx = radius == null ? h / 2 : radius;
  return {
    w,
    svg: R(x, y, w, h, rx, fill, stroke) + T(x + w / 2, y + h / 2 + size * 0.36, label, { cls: 'm', size, fill: color, anchor: 'middle' }),
  };
}

/** Dotted lattice + drifting aurora, clipped to a rounded card. */
function backdrop(p, w, h, id) {
  const defs = `<clipPath id="clip-${id}"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="22"/></clipPath>
<linearGradient id="bgg-${id}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${p.bg2}"/><stop offset="1" stop-color="${p.bg}"/>
</linearGradient>
<pattern id="dots-${id}" width="26" height="26" patternUnits="userSpaceOnUse">
  <circle cx="1.6" cy="1.6" r="1.1" fill="${p.line}"/>
</pattern>
<filter id="blur-${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="72"/></filter>`;

  const body = `<g clip-path="url(#clip-${id})">
  ${R(1, 1, w - 2, h - 2, 22, `url(#bgg-${id})`)}
  <g filter="url(#blur-${id})" opacity="${p.auroraOp}">
    <circle cx="${w * 0.12}" cy="-40" r="200" fill="${p.aurora[0]}">
      <animate attributeName="cy" values="-40;20;-40" dur="24s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${w * 0.72}" cy="${h + 40}" r="180" fill="${p.aurora[1]}">
      <animate attributeName="cx" values="${w * 0.72};${w * 0.55};${w * 0.72}" dur="31s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${w * 0.95}" cy="${h * 0.2}" r="150" fill="${p.aurora[2]}" opacity=".8">
      <animate attributeName="cy" values="${h * 0.2};${h * 0.6};${h * 0.2}" dur="37s" repeatCount="indefinite"/>
    </circle>
  </g>
  ${R(1, 1, w - 2, h - 2, 22, `url(#dots-${id})`, null, 0, `opacity="${p.dotOp}"`)}
</g>
${R(1, 1, w - 2, h - 2, 22, null, p.line, 1.2)}`;

  return { defs, body };
}

/** The AI-core emblem: hex reactor, tilted orbits, neural links, pulse rings. */
function emblem(p, id) {
  const defs = `<radialGradient id="core-${id}">
  <stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/>
  <stop offset=".35" stop-color="${p.cyan2}"/>
  <stop offset="1" stop-color="${p.cyan}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="halo-${id}">
  <stop offset="0" stop-color="${p.cyan}" stop-opacity=".55"/>
  <stop offset="1" stop-color="${p.cyan}" stop-opacity="0"/>
</radialGradient>
<linearGradient id="ring-${id}" gradientUnits="userSpaceOnUse" x1="22" y1="140" x2="258" y2="140">
  <stop offset="0" stop-color="${p.cyan}" stop-opacity="0"/>
  <stop offset=".5" stop-color="${p.cyan2}" stop-opacity=".95"/>
  <stop offset="1" stop-color="${p.violet}" stop-opacity="0"/>
</linearGradient>
<filter id="soft-${id}" x="-70%" y="-70%" width="240%" height="240%">
  <feGaussianBlur stdDeviation="3.2" result="b"/>
  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<path id="orb-${id}" d="M22,140 a118,45 0 1,0 236,0 a118,45 0 1,0 -236,0"/>`;

  const orbit = (rot, dur, begin, color) => `<g transform="rotate(${rot} 140 140)">
    <use xlink:href="#orb-${id}" href="#orb-${id}" stroke="url(#ring-${id})" stroke-width="1.5"/>
    <circle r="4.2" fill="${color}">
      <animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite">
        <mpath xlink:href="#orb-${id}" href="#orb-${id}"/>
      </animateMotion>
      <animate attributeName="r" values="3;5.4;3" dur="2.4s" repeatCount="indefinite"/>
    </circle>
  </g>`;

  const nodes = [[206, 96, 3.1, 0], [74, 104, 3.8, -1], [96, 200, 4.4, -2], [196, 192, 3.4, -2.7], [140, 62, 4.9, -3.4]];

  const body = `<g>
  <circle cx="140" cy="140" r="132" stroke="${p.line}" stroke-width="1.1" stroke-dasharray="2 12">
    <animateTransform attributeName="transform" type="rotate" from="0 140 140" to="360 140 140" dur="64s" repeatCount="indefinite"/>
  </circle>
  <circle cx="140" cy="140" r="132" stroke="${p.cyan}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="46 783" opacity=".9">
    <animateTransform attributeName="transform" type="rotate" from="0 140 140" to="360 140 140" dur="7s" repeatCount="indefinite"/>
  </circle>
  <circle cx="140" cy="140" r="72" fill="url(#halo-${id})">
    <animate attributeName="r" values="62;86;62" dur="5.6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values=".2;.45;.2" dur="5.6s" repeatCount="indefinite"/>
  </circle>
  <g filter="url(#soft-${id})">
    <animateTransform attributeName="transform" type="rotate" from="0 140 140" to="360 140 140" dur="46s" repeatCount="indefinite"/>
    ${orbit(0, 6.5, 0, p.cyan2)}
    ${orbit(60, 8.2, -2.4, p.violet)}
    ${orbit(120, 7.3, -4.9, p.cyan)}
  </g>
  <g stroke="${p.cyan}" stroke-width="1.1" stroke-linecap="round" opacity=".6">
    ${nodes.map(([x, y, d, b]) => `<path d="M140 140 L${x} ${y}"><animate attributeName="opacity" values=".18;.9;.18" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></path>`).join('\n    ')}
  </g>
  <g fill="${p.cyan2}">
    ${nodes.map(([x, y, d, b]) => `<circle cx="${x}" cy="${y}" r="3.4"><animate attributeName="r" values="2.3;4.6;2.3" dur="${d}s" begin="${b}s" repeatCount="indefinite"/></circle>`).join('\n    ')}
  </g>
  <g filter="url(#soft-${id})">
    <path d="M166,140 L153,162.5 L127,162.5 L114,140 L127,117.5 L153,117.5 Z" stroke="${p.cyan2}" stroke-width="1.8" fill="${p.cyan}" fill-opacity=".14">
      <animateTransform attributeName="transform" type="rotate" from="0 140 140" to="360 140 140" dur="24s" repeatCount="indefinite"/>
    </path>
    <path d="M158,140 L149,155.5 L131,155.5 L122,140 L131,124.5 L149,124.5 Z" stroke="${p.violet}" stroke-width="1.2" stroke-opacity=".75" fill="none">
      <animateTransform attributeName="transform" type="rotate" from="360 140 140" to="0 140 140" dur="16s" repeatCount="indefinite"/>
    </path>
    <circle cx="140" cy="140" r="11" fill="url(#core-${id})">
      <animate attributeName="r" values="9.5;13;9.5" dur="2.6s" repeatCount="indefinite"/>
    </circle>
  </g>
  <circle cx="140" cy="140" r="14" stroke="${p.cyan}" fill="none" stroke-width="1.4">
    <animate attributeName="r" values="14;122" dur="4.4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values=".65;0" dur="4.4s" repeatCount="indefinite"/>
  </circle>
  <circle cx="140" cy="140" r="14" stroke="${p.violet}" fill="none" stroke-width="1.2">
    <animate attributeName="r" values="14;122" dur="4.4s" begin="-2.2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values=".55;0" dur="4.4s" begin="-2.2s" repeatCount="indefinite"/>
  </circle>
</g>`;

  return { defs, body };
}

/* ───────────────────────────── content ───────────────────────────── */

const TYPED = [
  "Building Mizan 3 — Palestine's judicial platform",
  'Leading the on-premise Core AI Platform @ UNDP',
  'ASP.NET Core · Angular · Python · LLMs · RAG',
  'Turning research-stage AI into shipped services',
];

const MODULES = [
  [1, 'OCR Microservice & Document Classification',
    ['Digitises incoming case documents, then auto-classifies', 'and routes each one to the right case type.'], 1],
  [2, 'HTR Module & Mixed-Layout Processor',
    ['Handwritten text recognition across mixed printed and', 'handwritten multi-column judicial records.'], 1],
  [3, 'Fine-Tuned Legal LLM & Vector Database',
    ['Domain LLM fine-tuned on judicial corpora, backed by a', 'vector database for semantic retrieval.'], 0],
  [4, 'Hybrid Search, NL Query & Summarization',
    ['Keyword plus semantic search, natural-language querying', 'and automatic summarisation of cases.'], 0],
  [5, 'AI Chat Assistant with RAG',
    ['Retrieval-augmented chat over live case data, with', 'grounded, source-linked answers.'], 1],
  [6, 'Transcript Analysis & Hearing Minutes',
    ['Turns hearing transcripts into structured minutes and', 'hearing text, historical and live.'], 0],
  [7, 'Judgment Prediction & Precedent Retrieval',
    ['Outcome prediction with confidence scores, plus', 'precedent recall for a predictive dashboard.'], 0],
  [8, 'Full Integration & Handover',
    ['End-to-end integration of every AI service, plus docs,', 'deployment and technical handover.'], 0],
];

const PROJECTS = [
  ['M3', 'Mizan 3 — Judicial Case Management', 'Main project · 2024 – Present', 'enterprise',
    ['ASP.NET Core', 'Angular', 'DevExtreme', 'SQL Server', 'Docker']],
  ['AI', 'Core AI Platform', 'Mizan 3 sub-system · lead', 'ai',
    ['Python', 'LLM Fine-Tuning', 'RAG', 'LangChain', 'ChromaDB']],
  ['PDF', 'PDF AI — RAG Document Query App', 'Personal · built in ~2 days', 'ai',
    ['Flask', 'LangChain', 'ChromaDB', 'HuggingFace', 'Gemini']],
  ['EA', 'Electronic Auction Platform', 'Mizan 3 sub-project', 'enterprise',
    ['ASP.NET Core', 'Angular']],
  ['JP', 'Judicial Portal — Preview Website', 'Mizan 3 sub-project', 'enterprise',
    ['Angular', 'RTL / LTR']],
  ['CV', 'Centers & Visits Management System', 'General Prosecution', 'mobile',
    ['ASP.NET MVC', 'Flutter']],
  ['NC', 'AI-Based Nutrition Clinic System', '2024 · ~1 month', 'ai',
    ['Django', 'Python', 'AI / ML']],
  ['AL', 'AXSOS AlgoLab — Code Evaluation', 'Graduation project · 2023 – 24', 'enterprise',
    ['React', 'Spring Microservices', 'Piston']],
  ['AP', 'AXSOS Academy Portal', 'Team project', 'enterprise',
    ['Java', 'Spring Boot', 'React']],
  ['PK', 'APCOA Parking Management System', 'Europe · 2022 – 2023', 'enterprise',
    ['Django', 'Docker']],
];

const MARQ = ['ASP.NET Core', 'Angular', 'Python', 'LLM Fine-Tuning', 'RAG', 'LangChain', 'SQL Server',
  'Docker', 'HuggingFace', 'ChromaDB', 'React', 'Flutter', 'TypeScript', 'OCR / HTR', 'Microservices', 'C#'];

const SECTIONS = [
  ['about', '01 — PROFILE', 'About Me', '01'],
  ['ai', "02 — WHAT I'M BUILDING", 'Core AI Platform', '02'],
  ['experience', '03 — TRACK RECORD', 'Experience', '03'],
  ['projects', '04 — SELECTED WORK', 'Projects', '04'],
  ['stack', '05 — TOOLING', 'Tech Stack', '05'],
  ['activity', '06 — ON GITHUB', 'Activity', '06'],
  ['contact', '07 — SAY HELLO', "Let's Connect", '07'],
];

/* ───────────────────────────── builders ───────────────────────────── */

function hero(p) {
  const W = 1000, H = 404;
  const bd = backdrop(p, W, H, 'hero');
  const em = emblem(p, 'hero');
  const X = 54;

  // typewriter: each line owns a clip rect that widens, then collapses
  const SLOT = 4.5, CYCLE = SLOT * TYPED.length, FS = 15.5;
  const k = (t) => n(t / CYCLE);
  const typeDefs = TYPED.map((s, i) => {
    const w = monoW(s, FS) + 3;
    return `<clipPath id="tw${i}"><rect x="${X}" y="230" width="0" height="26">
    <animate attributeName="width" values="0;0;${n(w)};${n(w)};0;0" keyTimes="0;0.004;${k(1.15)};${k(3.6)};${k(4.1)};1" dur="${CYCLE}s" begin="${i * SLOT}s" repeatCount="indefinite"/>
  </rect></clipPath>`;
  }).join('\n');

  const typeBody = TYPED.map((s, i) => {
    const w = monoW(s, FS);
    return `<g clip-path="url(#tw${i})">${T(X, 249, s, { cls: 'm', size: FS, fill: p.cyan2, len: w })}</g>
  <g opacity="0">
    <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.004;${k(4.1)};${k(4.2)};1" dur="${CYCLE}s" begin="${i * SLOT}s" repeatCount="indefinite"/>
    <rect y="233" width="2.4" height="19" rx="1.2" fill="${p.cyan}" x="${X}">
      <animate attributeName="x" values="${X};${X};${n(X + w)};${n(X + w)};${X};${X}" keyTimes="0;0.004;${k(1.15)};${k(3.6)};${k(4.1)};1" dur="${CYCLE}s" begin="${i * SLOT}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.49;0.5;1" dur="1.05s" repeatCount="indefinite"/>
    </rect>
  </g>`;
  }).join('\n');

  let cx = X;
  const chips = ['UNDP', 'Mizan 3', 'Core AI Platform', 'On-premise'].map((c, i) => {
    const el = chip(cx, 276, c, p, { size: 11.5, fill: p.card, color: i === 0 ? p.cyan : p.ink2 });
    cx += el.w + 9;
    return el.svg;
  }).join('\n  ');

  const nameW = sansW('Tamer Mansour', 54);
  const defs = `${bd.defs}
${em.defs}
${typeDefs}
<linearGradient id="nameG" gradientUnits="userSpaceOnUse" x1="${X}" y1="0" x2="${n(X + nameW)}" y2="0" spreadMethod="reflect">
  <stop offset="0" stop-color="${p.cyan}"/><stop offset=".4" stop-color="${p.cyan2}"/>
  <stop offset=".72" stop-color="${p.violet}"/><stop offset="1" stop-color="${p.cyan}"/>
  <animateTransform attributeName="gradientTransform" type="translate" values="0 0;${n(nameW)} 0;0 0" dur="9s" repeatCount="indefinite"/>
</linearGradient>`;

  const body = `${bd.body}
<g transform="translate(656 58) scale(1.03)">${em.body}</g>
<circle cx="${X + 4}" cy="70" r="4" fill="${p.cyan}">
  <animate attributeName="opacity" values="1;.25;1" dur="2.4s" repeatCount="indefinite"/>
</circle>
${T(X + 18, 74, 'RAMALLAH · PALESTINE  —  OPEN TO COLLABORATION', { cls: 'm', size: 11, fill: p.cyan, ls: 2.1 })}
${T(X, 144, 'Tamer Mansour', { size: 54, weight: 700, fill: 'url(#nameG)', extra: 'letter-spacing="-1.4"' })}
${T(X, 176, 'تامر منصور', { size: 24, weight: 600, fill: p.cyan2, op: 0.92 })}
${T(X, 208, 'Full Stack Software Engineer · AI & Machine Learning', { size: 18.5, fill: p.ink2, weight: 500 })}
${typeBody}
  ${chips}
${T(X, 346, 'Al-Quds University · dual study with AXSOS AG · exchange at Mälardalen, Sweden', { size: 12.4, fill: p.mute })}`;

  return svg(W, H, defs, body, 'Tamer Mansour — Full Stack Software Engineer and AI Engineer');
}

function section(p, [id, eyebrow, title, index]) {
  const W = 1000, H = 84;
  const tw = sansW(title, 29);
  const defs = `<linearGradient id="tg" gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="${n(20 + tw)}" y2="0" spreadMethod="reflect">
  <stop offset="0" stop-color="${p.cyan}"/><stop offset=".55" stop-color="${p.cyan2}"/><stop offset="1" stop-color="${p.violet}"/>
  <animateTransform attributeName="gradientTransform" type="translate" values="0 0;${n(tw)} 0;0 0" dur="10s" repeatCount="indefinite"/>
</linearGradient>
<linearGradient id="ug" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${p.cyan}"/><stop offset=".6" stop-color="${p.violet}"/><stop offset="1" stop-color="${p.violet}" stop-opacity="0"/>
</linearGradient>`;

  const body = `<circle cx="24" cy="20" r="3.6" fill="${p.cyan}">
  <animate attributeName="opacity" values="1;.2;1" dur="2.2s" repeatCount="indefinite"/>
</circle>
${T(38, 24, eyebrow, { cls: 'm', size: 11, fill: p.cyan, ls: 2.2 })}
${T(20, 61, title, { size: 29, weight: 700, fill: 'url(#tg)', extra: 'letter-spacing="-0.7"' })}
${T(980, 58, index, { cls: 'm', size: 42, weight: 700, fill: p.line, anchor: 'end', op: 0.85 })}
${R(20, 74, 960, 1.4, 1, p.line)}
<rect x="20" y="73" height="3" rx="1.5" fill="url(#ug)" width="0">
  <animate attributeName="width" values="0;0;340;340;0" keyTimes="0;0.05;0.28;0.9;1" dur="9s" repeatCount="indefinite"/>
</rect>
<circle cy="74.5" r="3" fill="${p.cyan2}" cx="20" opacity="0">
  <animate attributeName="cx" values="20;20;360;360" keyTimes="0;0.05;0.28;1" dur="9s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.06;0.28;0.34;1" dur="9s" repeatCount="indefinite"/>
</circle>`;

  return svg(W, H, defs, body, `${title} — ${eyebrow}`);
}

function modules(p) {
  const W = 1000, CW = 478, CH = 128, GX = 16, GY = 16, X0 = 14, Y0 = 84;
  const rows = Math.ceil(MODULES.length / 2);
  const H = Y0 + rows * CH + (rows - 1) * GY + 14;
  const done = MODULES.filter((m) => m[3]).length;
  const pct = done / MODULES.length;

  const defs = `<clipPath id="cardc"><rect x="0" y="0" width="${CW}" height="${CH}" rx="15"/></clipPath>
<linearGradient id="prog" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${p.green}"/><stop offset="1" stop-color="${p.cyan}"/>
</linearGradient>
<linearGradient id="shim" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${p.cyan}" stop-opacity="0"/>
  <stop offset=".5" stop-color="${p.cyan}" stop-opacity=".13"/>
  <stop offset="1" stop-color="${p.cyan}" stop-opacity="0"/>
</linearGradient>`;

  const head = `${T(20, 30, '8 COORDINATED WORKSTREAMS · MIZAN 3 · ON-PREMISE', { cls: 'm', size: 11, fill: p.mute, ls: 1.8 })}
${T(980, 30, `${done} / ${MODULES.length} DELIVERED`, { cls: 'm', size: 11.5, fill: p.green, ls: 1.6, anchor: 'end' })}
${R(20, 44, 960, 6, 3, p.line2)}
<rect x="20" y="44" height="6" rx="3" fill="url(#prog)" width="0">
  <animate attributeName="width" values="0;0;${n(960 * pct)};${n(960 * pct)}" keyTimes="0;0.03;0.22;1" dur="10s" repeatCount="indefinite"/>
</rect>
<circle cy="47" r="4.5" fill="${p.cyan2}" cx="20" opacity="0">
  <animate attributeName="cx" values="20;20;${n(20 + 960 * pct)};${n(20 + 960 * pct)}" keyTimes="0;0.03;0.22;1" dur="10s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0;.9;.9;.35;.35" keyTimes="0;0.04;0.22;0.3;1" dur="10s" repeatCount="indefinite"/>
</circle>`;

  const cards = MODULES.map(([num, title, desc, delivered], i) => {
    const x = X0 + (i % 2) * (CW + GX);
    const y = Y0 + Math.floor(i / 2) * (CH + GY);
    const acc = delivered ? p.green : p.amber;
    const label = delivered ? 'DELIVERED' : 'IN DEVELOPMENT';
    const pw = monoW(label, 10.5) + 34;

    const state = delivered
      ? `<g transform="translate(66 96)">
      <path d="M2.6 7.4 L5.8 10.6 L12.4 3.6" stroke="${acc}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20" stroke-dashoffset="20">
        <animate attributeName="stroke-dashoffset" values="20;20;0;0" keyTimes="0;0.08;0.26;1" dur="7s" begin="${n(i * 0.18)}s" repeatCount="indefinite"/>
      </path></g>`
      : `<circle cx="73" cy="103" r="3.4" fill="${acc}">
      <animate attributeName="opacity" values="1;.22;1" dur="1.7s" begin="${n(i * 0.2)}s" repeatCount="indefinite"/>
    </circle>`;

    const shimmer = delivered ? '' : `<g clip-path="url(#cardc)">
      <rect x="-160" y="0" width="160" height="${CH}" fill="url(#shim)">
        <animate attributeName="x" values="-160;${CW};${CW}" keyTimes="0;0.42;1" dur="5.2s" begin="${n(i * 0.42)}s" repeatCount="indefinite"/>
      </rect></g>`;

    return `<g transform="translate(${x} ${y})">
    ${R(0, 0, CW, CH, 15, p.card, p.line, 1.1)}
    ${shimmer}
    ${R(1.5, 18, 3.5, 92, 1.75, acc, null, 0, 'opacity=".85"')}
    ${R(18, 18, 28, 28, 9, p.card2, acc, 1, 'stroke-opacity=".45"')}
    ${T(32, 37, String(num), { cls: 'm', size: 13, weight: 700, fill: acc, anchor: 'middle' })}
    ${T(58, 34, title, { size: 15, weight: 600, fill: p.ink })}
    ${T(58, 60, desc[0], { size: 12.2, fill: p.mute })}
    ${T(58, 78, desc[1], { size: 12.2, fill: p.mute })}
    ${R(58, 92, pw, 22, 11, acc, acc, 1, 'fill-opacity=".12" stroke-opacity=".38"')}
    ${state}
    ${T(88, 107, label, { cls: 'm', size: 10.5, fill: acc, ls: 1.1 })}
  </g>`;
  }).join('\n  ');

  return svg(W, H, defs, `${head}\n  ${cards}`, 'Core AI Platform — eight workstreams');
}

function projects(p) {
  const W = 1000, CW = 478, CH = 118, GX = 16, GY = 16, X0 = 14, Y0 = 10;
  const rows = Math.ceil(PROJECTS.length / 2);
  const H = Y0 + rows * CH + (rows - 1) * GY + 10;
  const tone = { ai: p.violet, enterprise: p.cyan, mobile: p.green };
  const tname = { ai: 'AI & ML', enterprise: 'ENTERPRISE', mobile: 'MOBILE' };

  const defs = `<clipPath id="pc"><rect x="0" y="0" width="${CW}" height="${CH}" rx="15"/></clipPath>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${p.cyan}" stop-opacity="0"/>
  <stop offset=".5" stop-color="${p.cyan2}"/>
  <stop offset="1" stop-color="${p.violet}" stop-opacity="0"/>
</linearGradient>`;

  const cards = PROJECTS.map(([mono, title, sub, tag, tech], i) => {
    const x = X0 + (i % 2) * (CW + GX);
    const y = Y0 + Math.floor(i / 2) * (CH + GY);
    const acc = tone[tag];
    const tagW = monoW(tname[tag], 9.5) + 18;

    let tx = 16;
    const chips = tech.map((t) => {
      const el = chip(tx, 82, t, p, { size: 9.8, padX: 8, h: 20, fill: p.card2, stroke: p.line2, color: p.ink2, radius: 6 });
      tx += el.w + 7;
      return el.svg;
    }).join('\n    ');

    return `<g transform="translate(${x} ${y})">
    ${R(0, 0, CW, CH, 15, p.card, p.line, 1.1)}
    <g clip-path="url(#pc)">
      <rect x="-190" y="0" width="190" height="1.6" fill="url(#edge)">
        <animate attributeName="x" values="-190;${CW};${CW}" keyTimes="0;0.38;1" dur="6.5s" begin="${n(i * 0.33)}s" repeatCount="indefinite"/>
      </rect>
    </g>
    ${R(16, 16, 42, 42, 13, p.card2, acc, 1.1, 'stroke-opacity=".5"')}
    ${T(37, 43, mono, { cls: 'm', size: mono.length > 2 ? 12 : 14, weight: 700, fill: acc, anchor: 'middle' })}
    ${R(CW - 16 - tagW, 16, tagW, 20, 6, acc, null, 0, 'fill-opacity=".14"')}
    ${T(CW - 16 - tagW / 2, 30, tname[tag], { cls: 'm', size: 9.5, fill: acc, anchor: 'middle', ls: 0.8 })}
    ${T(70, 37, title, { size: 14.5, weight: 600, fill: p.ink })}
    ${T(70, 55, sub, { cls: 'm', size: 10.8, fill: acc })}
    ${chips}
  </g>`;
  }).join('\n  ');

  return svg(W, H, defs, cards, 'Selected projects');
}

function timeline(p) {
  const W = 1000, H = 344;
  const ENTRIES = [
    ['AUG 2024 — PRESENT', 'UNDP', 'Full Stack Software Engineer · AI Engineer',
      ['Core contributor to Mizan 3, the nationwide judicial case management platform. I build enterprise',
        'full-stack modules in ASP.NET Core and Angular, and lead the on-premise Core AI Platform.']],
    ['2020 — 2024', 'AXSOS AG', 'Software Development Trainee — Dual Study',
      ['Full stack work across enterprise projects, alternating three months at university with three months',
        "in the company. Shipped work on APCOA's Europe-wide parking platform and built AXSOS AlgoLab."]],
  ];

  const defs = `<linearGradient id="rail" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${p.cyan}"/><stop offset=".55" stop-color="${p.navy}"/>
  <stop offset="1" stop-color="${p.navy}" stop-opacity="0"/>
</linearGradient>`;

  const rail = `${R(32.5, 20, 2.4, 306, 1.2, p.line2)}
<rect x="32.5" y="20" width="2.4" height="0" rx="1.2" fill="url(#rail)">
  <animate attributeName="height" values="0;0;306;306" keyTimes="0;0.04;0.3;1" dur="11s" repeatCount="indefinite"/>
</rect>`;

  const items = ENTRIES.map(([when, org, role, body], i) => {
    const y = 16 + i * 162;
    const pw = monoW(when, 10.8) + 24;
    return `<g transform="translate(0 ${y})">
    <circle cx="33.7" cy="42" r="13" fill="${p.cyan}" opacity=".18">
      <animate attributeName="r" values="10;18;10" dur="3.2s" begin="${i * 1.1}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values=".22;0;.22" dur="3.2s" begin="${i * 1.1}s" repeatCount="indefinite"/>
    </circle>
    <circle cx="33.7" cy="42" r="7.5" fill="${p.bg2}" stroke="${p.cyan}" stroke-width="2.6"/>
    ${R(68, 0, 918, 146, 16, p.card, p.line, 1.1)}
    ${R(92, 18, pw, 22, 6, p.card2, p.line)}
    ${T(92 + pw / 2, 33, when, { cls: 'm', size: 10.8, fill: p.cyan, anchor: 'middle', ls: 0.9 })}
    ${T(92, 70, org, { size: 21, weight: 700, fill: p.ink })}
    ${T(92, 92, role, { size: 13.5, weight: 500, fill: p.cyan2 })}
    ${T(92, 116, body[0], { size: 12.2, fill: p.mute })}
    ${T(92, 134, body[1], { size: 12.2, fill: p.mute })}
  </g>`;
  }).join('\n  ');

  return svg(W, H, defs, `${rail}\n  ${items}`, 'Experience timeline');
}

function stats(p) {
  const W = 1000, H = 122, TW = 235, TH = 104;
  const TILES = [
    [['0', '1', '2', '3', '4', '5', '6+'], 'YEARS BUILDING SOFTWARE'],
    [['0', '2', '4', '6', '8', '10+'], 'PROJECTS DELIVERED'],
    [['0', '2', '3', '5', '6', '8'], 'AI WORKSTREAMS'],
    [['0', '1'], 'NATIONAL PLATFORM'],
  ];
  const DUR = 9, PHASE = 1.3;

  const defs = `<radialGradient id="glow">
  <stop offset="0" stop-color="${p.glow}" stop-opacity="${p.glowOp}"/>
  <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
</radialGradient>`;

  const tiles = TILES.map(([frames, label], i) => {
    const x = 14 + i * (TW + 13);
    const step = PHASE / (frames.length - 1);
    const nums = frames.map((f, j) => {
      const t0 = j * step, t1 = (j + 1) * step;
      const last = j === frames.length - 1;
      const kt = last
        ? `0;${n(t0 / DUR)};${n((t0 + 0.02) / DUR)};1`
        : `0;${n(t0 / DUR)};${n((t0 + 0.005) / DUR)};${n(t1 / DUR)};${n((t1 + 0.005) / DUR)};1`;
      const vals = last ? '0;0;1;1' : '0;0;1;1;0;0';
      return `${T(TW / 2, 60, f, { size: 38, weight: 700, fill: p.cyan, anchor: 'middle', op: 0, extra: `letter-spacing="-1"` }).replace('</text>', `<animate attributeName="opacity" values="${vals}" keyTimes="${kt}" dur="${DUR}s" repeatCount="indefinite"/></text>`)}`;
    }).join('\n    ');

    return `<g transform="translate(${x} 9)">
    ${R(0, 0, TW, TH, 15, p.card, p.line, 1.1)}
    <circle cx="${TW / 2}" cy="46" r="52" fill="url(#glow)">
      <animate attributeName="opacity" values=".55;1;.55" dur="4.2s" begin="${i * 0.5}s" repeatCount="indefinite"/>
    </circle>
    ${nums}
    ${T(TW / 2, 84, label, { cls: 'm', size: 9.6, fill: p.mute, anchor: 'middle', ls: 1.6 })}
  </g>`;
  }).join('\n  ');

  return svg(W, H, defs, tiles, 'By the numbers');
}

function marquee(p) {
  const W = 1000, H = 56, FS = 12.5;
  let x = 0;
  const parts = [];
  for (const t of MARQ) {
    parts.push(T(x, 35, t, { cls: 'm', size: FS, fill: p.ink2 }));
    x += monoW(t, FS) + 17;
    parts.push(`<g transform="translate(${n(x)} 31) rotate(45)"><rect x="-3.1" y="-3.1" width="6.2" height="6.2" rx="1.2" fill="${p.cyan}" opacity=".7"/></g>`);
    x += 24;
  }
  const total = x;
  const run = parts.join('');

  const defs = `<linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#000"/><stop offset=".05" stop-color="#fff"/>
  <stop offset=".95" stop-color="#fff"/><stop offset="1" stop-color="#000"/>
</linearGradient>
<mask id="fademask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>`;

  const body = `${R(0, 0, W, H, 0, p.bg2)}
${R(0, 0, W, 1, 0, p.line)}
${R(0, H - 1, W, 1, 0, p.line)}
<g mask="url(#fademask)">
  <g>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="${n(-total)} 0" dur="${n(total / 34)}s" repeatCount="indefinite"/>
    ${run}
    <g transform="translate(${n(total)} 0)">${run}</g>
  </g>
</g>`;

  return svg(W, H, defs, body, 'Technology marquee');
}

/** Staggered one-shot fade-in (plays on load, then holds). */
function reveal(delay, dur = 0.55) {
  return `<animate attributeName="opacity" from="0" to="1" begin="${n(delay)}s" dur="${dur}s" fill="freeze"/>`;
}

function about(p) {
  const W = 1000, H = 336;

  const LEAD = [
    'I build secure, scalable enterprise systems —',
    'and lately, the AI that runs inside them.',
  ];
  const PROSE = [
    'Hands-on since 2020, with a BSc in Information Technology from',
    'Al-Quds University (dual study with AXSOS AG) and an exchange',
    'semester at Mälardalen University in Sweden.',
    '',
    'Today I work with UNDP on Mizan 3 — the nationwide judicial case',
    'management platform used across every Palestinian court and',
    'prosecution office. I work end to end: database design, ASP.NET',
    'Core APIs, Angular frontend, containerised deployment and',
    "reporting — and I lead the platform's Core AI Platform.",
    '',
    "All of it runs on-premise, because judicial data doesn't leave",
    'the institution.',
  ];

  const CODE = [
    ['name', 'Tamer Mansour'],
    ['role', 'Full Stack Engineer · AI & ML'],
    ['current', 'Mizan 3 — Core AI Platform'],
    ['employer', 'UNDP · Ramallah, Palestine'],
    ['stack', '[ASP.NET Core, Angular,'],
    ['', ' Python, LLMs, RAG]'],
    ['focus', 'research-stage AI, shipped'],
    ['open_to', 'collaboration, hard problems'],
  ];

  const CX = 580, CW = 400, CY = 44, CH = 236, FS = 11.8;

  const codeDefs = CODE.map((_, i) =>
    `<clipPath id="cl${i}"><rect x="${CX + 18}" y="${CY + 44 + i * 22 - 12}" width="0" height="18">
    <animate attributeName="width" values="0;${CW - 36}" begin="${n(0.5 + i * 0.34)}s" dur="0.42s" fill="freeze"/>
  </rect></clipPath>`).join('\n');

  const codeBody = CODE.map(([key, val], i) => {
    const y = CY + 44 + i * 22;
    const keyTxt = key ? `${key}:`.padEnd(10, ' ') : ' '.repeat(10);
    return `<g clip-path="url(#cl${i})">
    ${T(CX + 18, y, keyTxt, { cls: 'm', size: FS, fill: p.cyan, extra: 'xml:space="preserve"' })}
    ${T(CX + 18 + monoW(keyTxt, FS), y, val, { cls: 'm', size: FS, fill: p.ink2, extra: 'xml:space="preserve"' })}
  </g>`;
  }).join('\n  ');

  const defs = `${codeDefs}
<linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${p.cyan}"/><stop offset="1" stop-color="${p.violet}"/>
</linearGradient>`;

  const prose = PROSE.map((l, i) => l
    ? `<g opacity="0">${reveal(0.25 + i * 0.07)}${T(20, 106 + i * 20, l, { size: 13.2, fill: p.mute })}</g>`
    : '').filter(Boolean).join('\n');

  const body = `${R(20, 26, 3, 46, 1.5, 'url(#bar)')}
<g opacity="0">${reveal(0.05)}${T(38, 48, LEAD[0], { size: 16.5, weight: 600, fill: p.ink })}</g>
<g opacity="0">${reveal(0.18)}${T(38, 70, LEAD[1], { size: 16.5, weight: 600, fill: p.ink })}</g>
${prose}
${R(CX, CY, CW, CH, 15, p.card, p.line, 1.1)}
${R(CX, CY, CW, 34, 15, p.card2)}
${R(CX, CY + 22, CW, 12, 0, p.card2)}
${R(CX, CY + 34, CW, 1, 0, p.line)}
<circle cx="${CX + 20}" cy="${CY + 17}" r="4.5" fill="#FF5F57" opacity=".9"/>
<circle cx="${CX + 36}" cy="${CY + 17}" r="4.5" fill="#FEBC2E" opacity=".9"/>
<circle cx="${CX + 52}" cy="${CY + 17}" r="4.5" fill="#28C840" opacity=".9"/>
${T(CX + CW / 2, CY + 21, 'profile.yml', { cls: 'm', size: 11, fill: p.mute, anchor: 'middle' })}
  ${codeBody}
<rect x="${CX + 18}" y="${CY + 44 + CODE.length * 22 - 12}" width="8" height="15" rx="1.5" fill="${p.cyan}" opacity="0">
  <animate attributeName="opacity" values="0;1" begin="${n(0.5 + CODE.length * 0.34)}s" dur="0.1s" fill="freeze"/>
  <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.49;0.5;1" dur="1.05s" begin="${n(0.6 + CODE.length * 0.34)}s" repeatCount="indefinite"/>
</rect>`;

  return svg(W, H, defs, body, 'About Tamer Mansour');
}

function mizan(p) {
  const W = 1000, CW = 318, CH = 78, GX = 14, GY = 14;
  const ITEMS = [
    ['Cases', 'Full lifecycle · courts, parties, hearings, docs'],
    ['Inspections', 'Judge profiles, visits, evaluations, complaints'],
    ['Advanced Search', 'Multi-filter case search engine + search pages'],
    ['Reports', 'CRUD components wired to DevExpress reporting'],
    ['Settings', 'Lookups, court setup, administrative controls'],
    ['Form Builder & Workflow', 'Backend and frontend foundations'],
  ];
  const H = 48 + 2 * CH + GY + 12;

  const cards = ITEMS.map(([t, d], i) => {
    const x = 14 + (i % 3) * (CW + GX);
    const y = 48 + Math.floor(i / 3) * (CH + GY);
    return `<g opacity="0" transform="translate(${x} ${y})">${reveal(0.1 + i * 0.09)}
    ${R(0, 0, CW, CH, 14, p.card, p.line, 1.1)}
    <circle cx="20" cy="27" r="4" fill="${p.cyan}">
      <animate attributeName="opacity" values=".45;1;.45" dur="${n(2.6 + i * 0.3)}s" repeatCount="indefinite"/>
    </circle>
    ${T(34, 32, t, { size: 13.4, weight: 600, fill: p.ink })}
    ${T(34, 55, d, { size: 10.9, fill: p.mute })}
  </g>`;
  }).join('\n  ');

  const body = `${T(20, 26, 'MIZAN 3 · MODULES I BUILT', { cls: 'm', size: 11, fill: p.cyan, ls: 2 })}
${T(980, 26, 'ASP.NET CORE · ANGULAR · SQL SERVER', { cls: 'm', size: 10.5, fill: p.mute, ls: 1.4, anchor: 'end' })}
  ${cards}`;

  return svg(W, H, '', body, 'Mizan 3 modules');
}

function stack(p) {
  const W = 1000, ROW = 48, X0 = 20, CX = 186;
  const GROUPS = [
    ['LANGUAGES', ['C#', 'TypeScript', 'Python', 'JavaScript', 'Java', 'SQL']],
    ['AI / ML', ['LLM Fine-Tuning', 'RAG', 'LangChain', 'HuggingFace', 'ChromaDB', 'Vector Search', 'OCR / HTR', 'NLP']],
    ['BACKEND', ['ASP.NET Core', 'ASP.NET MVC', 'Flask', 'Django', 'Spring Boot', 'Node.js', 'Microservices']],
    ['FRONTEND', ['Angular', 'React', 'Tailwind CSS', 'Bootstrap', 'DevExtreme', 'Material UI']],
    ['DATABASES', ['SQL Server', 'PostgreSQL', 'MongoDB', 'ChromaDB']],
    ['DEVOPS & TOOLS', ['Docker', 'Linux', 'IIS', 'Git', 'Postman', 'Swagger', 'Agile / Scrum']],
    ['MOBILE', ['Flutter', 'Android Studio']],
  ];
  const H = 18 + GROUPS.length * ROW + 12;
  let k = 0;

  const rows = GROUPS.map(([label, items], r) => {
    const y = 18 + r * ROW;
    let x = CX;
    const chips = items.map((t) => {
      const el = chip(x, y + 6, t, p, { size: 11, padX: 11, h: 26, fill: p.card, stroke: p.line, color: p.ink2, radius: 8 });
      x += el.w + 8;
      const g = `<g opacity="0">${reveal(0.1 + k * 0.045, 0.4)}${el.svg}</g>`;
      k++;
      return g;
    }).join('\n    ');

    return `<g>
    ${r ? R(X0, y - 5, 960, 1, 0, p.line2) : ''}
    <circle cx="${X0 + 4}" cy="${y + 15}" r="3.2" fill="${p.cyan}">
      <animate attributeName="opacity" values="1;.25;1" dur="${n(2.4 + r * 0.25)}s" repeatCount="indefinite"/>
    </circle>
    ${T(X0 + 16, y + 19, label, { cls: 'm', size: 10.8, fill: p.cyan, ls: 1.7 })}
    ${chips}
  </g>`;
  }).join('\n  ');

  return svg(W, H, '', rows, 'Tech stack');
}

function education(p) {
  const W = 1000, H = 172;
  const SCHOOLS = [
    ['Al-Quds University', 'BSc Information Technology · Dual Study', 'SEP 2019 — MAR 2024'],
    ['Mälardalen University, Sweden', 'Exchange · International IT Program', '2022 — 2023'],
  ];
  const LANGS = [
    ['Arabic', 'Native', 1],
    ['English', 'Intermediate', 0.66],
    ['Swedish', 'Basic', 0.3],
  ];

  const defs = `<linearGradient id="lvl" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${p.cyan}"/><stop offset="1" stop-color="${p.violet}"/>
</linearGradient>`;

  const cards = SCHOOLS.map(([name, sub, when], i) => {
    const x = 14 + i * 500;
    const pw = monoW(when, 10.2) + 22;
    return `<g opacity="0" transform="translate(${x} 10)">${reveal(0.1 + i * 0.12)}
    ${R(0, 0, 486, 88, 15, p.card, p.line, 1.1)}
    ${R(1.5, 16, 3.5, 56, 1.75, p.cyan, null, 0, 'opacity=".8"')}
    ${T(22, 34, name, { size: 15, weight: 600, fill: p.ink })}
    ${T(22, 56, sub, { size: 12.2, fill: p.mute })}
    ${R(22, 64, pw, 18, 5, p.card2, p.line)}
    ${T(22 + pw / 2, 76, when, { cls: 'm', size: 10.2, fill: p.cyan, anchor: 'middle', ls: 0.8 })}
  </g>`;
  }).join('\n  ');

  const langs = LANGS.map(([name, level, pct], i) => {
    const x = 14 + i * 332;
    const bw = 290;
    return `<g transform="translate(${x} 116)">
    ${T(8, 20, name, { size: 13.5, weight: 600, fill: p.ink })}
    ${T(8 + bw, 20, level, { cls: 'm', size: 10.5, fill: p.mute, anchor: 'end', ls: 1 })}
    ${R(8, 32, bw, 7, 3.5, p.line2)}
    <rect x="8" y="32" width="0" height="7" rx="3.5" fill="url(#lvl)">
      <animate attributeName="width" from="0" to="${n(bw * pct)}" begin="${n(0.3 + i * 0.18)}s" dur="1.1s" fill="freeze"/>
    </rect>
  </g>`;
  }).join('\n  ');

  const body = `${cards}
${T(22, 112, 'LANGUAGES', { cls: 'm', size: 10.8, fill: p.cyan, ls: 1.7 })}
  ${langs}`;

  return svg(W, H, defs, body, 'Education and languages');
}

function button(p, { icon, label, sub, brand, brandLight }) {
  const W = 206, H = 56;
  const c = p.name === 'light' ? (brandLight || brand) : brand;
  const accent = c === 'ink' ? p.ink : c;

  const defs = `<clipPath id="bc"><rect x="0" y="0" width="${W}" height="${H}" rx="14"/></clipPath>
<linearGradient id="sw" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${accent}" stop-opacity="0"/>
  <stop offset=".5" stop-color="${accent}" stop-opacity=".9"/>
  <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
</linearGradient>`;

  const body = `${R(0.7, 0.7, W - 1.4, H - 1.4, 14, p.card, p.line, 1.2)}
<g clip-path="url(#bc)">
  <rect x="-90" y="0" width="90" height="1.8" fill="url(#sw)">
    <animate attributeName="x" values="-90;${W};${W}" keyTimes="0;0.35;1" dur="4.6s" repeatCount="indefinite"/>
  </rect>
</g>
<g transform="translate(18 18) scale(0.83)"><path d="${icon}" fill="${accent}"/></g>
${T(52, 27, label, { size: 13.5, weight: 600, fill: p.ink })}
${T(52, 43, sub, { cls: 'm', size: 9.8, fill: p.mute })}`;

  return svg(W, H, defs, body, `${label} — ${sub}`);
}

function footer(p) {
  const W = 1000, H = 128;
  const period = 250, amp = 13;
  let d = 'M0 44';
  for (let i = 0; i < 10; i++) d += ` q${period / 4} ${-amp} ${period / 2} 0 t${period / 2} 0`;
  d += ` L${period * 10} ${H} L0 ${H} Z`;

  const defs = `<linearGradient id="wv" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${p.cyan}" stop-opacity=".55"/>
  <stop offset="1" stop-color="${p.navy}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="wv2" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${p.violet}" stop-opacity=".38"/>
  <stop offset="1" stop-color="${p.violet}" stop-opacity="0"/>
</linearGradient>
<clipPath id="fc"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath>`;

  const body = `<g clip-path="url(#fc)">
  <path d="${d}" fill="url(#wv2)" transform="translate(0 8)">
    <animateTransform attributeName="transform" type="translate" values="0 8;${-period} 8;0 8" dur="17s" repeatCount="indefinite"/>
  </path>
  <path d="${d}" fill="url(#wv)">
    <animateTransform attributeName="transform" type="translate" values="${-period} 0;0 0;${-period} 0" dur="12s" repeatCount="indefinite"/>
  </path>
</g>
${T(W / 2, 100, 'Designed & built by Tamer Mansour · Ramallah, Palestine', { size: 13.5, fill: p.ink2, anchor: 'middle', weight: 500 })}
${T(W / 2, 119, 'EVERY SECTION ABOVE IS A GENERATED, ANIMATED SVG — SEE tools/build-assets.mjs', { cls: 'm', size: 9.4, fill: p.mute, anchor: 'middle', ls: 1.2 })}`;

  return svg(W, H, defs, body, 'Designed and built by Tamer Mansour');
}

/* ───────────────────────────── write ───────────────────────────── */

const BUTTONS = [
  ['email', { icon: ICON.gmail, label: 'Email', sub: 'tmansour720@gmail.com', brand: '#EA4335' }],
  ['github', { icon: ICON.github, label: 'GitHub', sub: 'Tamer-Mansour', brand: '#EDF8FD', brandLight: '#171515' }],
  ['linkedin', { icon: ICON.linkedin, label: 'LinkedIn', sub: 'tamer-mansour', brand: '#0A66C2' }],
  ['facebook', { icon: ICON.facebook, label: 'Facebook', sub: 'tamer0110', brand: '#1877F2' }],
];

const files = [];
for (const p of [DARK, LIGHT]) {
  files.push([`hero-${p.name}.svg`, hero(p)]);
  files.push([`marquee-${p.name}.svg`, marquee(p)]);
  files.push([`stats-${p.name}.svg`, stats(p)]);
  files.push([`about-${p.name}.svg`, about(p)]);
  files.push([`modules-${p.name}.svg`, modules(p)]);
  files.push([`timeline-${p.name}.svg`, timeline(p)]);
  files.push([`education-${p.name}.svg`, education(p)]);
  files.push([`projects-${p.name}.svg`, projects(p)]);
  files.push([`mizan-${p.name}.svg`, mizan(p)]);
  files.push([`stack-${p.name}.svg`, stack(p)]);
  files.push([`footer-${p.name}.svg`, footer(p)]);
  for (const [key, cfg] of BUTTONS) files.push([`btn-${key}-${p.name}.svg`, button(p, cfg)]);
  for (const s of SECTIONS) files.push([`sec-${s[0]}-${p.name}.svg`, section(p, s)]);
}

for (const [name, content] of files) {
  writeFileSync(join(OUT, name), content, 'utf8');
}
console.log(`wrote ${files.length} files to assets/`);
