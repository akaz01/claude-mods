// Copyright 2026 Anthropic PBC
// SPDX-License-Identifier: Apache-2.0
// Modified 2026 by suhoon (Windows port / display changes). Original: https://github.com/anthropics/claude-code-playground — see NOTICE.
//
// Token Weather: a live traffic light for the context window, above the prompt.
//
// turn.complete: after each main-loop turn, read the context window's fill
// from $.session.usage() (the same figures the status line shows) and keep
// the last HISTORY readings.
// session.start: take a first reading, so the band shows before any turn.
// ui.render (AbovePrompt): one line: traffic light, signal word, percent, tokens
// used of the window, and a block-character chart of the recent turns.
//
// The host reads on(...) and $.noun.method(...) from source, so they are
// spelled literally, and helpers that take $ are top-level functions.

const HISTORY = 12;
const BARS = "▁▂▃▄▅▆▇█";

// Traffic-light bands, by percent of the window used. One lamp (a single-width
// ●, not an emoji) that changes color.
const LAMP = "●";
const SIGNAL = [
  { upTo: 50, word: "Go", color: "green" },
  { upTo: 75, word: "Caution", color: "yellow" },
  { upTo: 90, word: "Stop", color: "red" },
  { upTo: Infinity, word: "Compact soon", color: "red" },
];

// Readings: { tokens, window, percent }, oldest first.
let readings = [];
let stale = false;

export function register(on) {
  on("session.start", async ($, e, next) => {
    const result = await next(e);
    readings = [];
    stale = false;
    await takeReading($);
    return result;
  });

  on("turn.complete", async ($, e, next) => {
    const result = await next(e);
    if (e.agentId) {
      return result;
    }
    await takeReading($);
    return result;
  });

  on("session.measure", async ($, e, next) => {
    const result = await next(e);
    await takeReading($);
    return result;
  });

  // Stack the light over whatever the plugins beneath draw, so another mod's
  // band (replay-theater's hint) never hides it and it never hides theirs.
  on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
    if (e.hasSurvey || readings.length === 0) {
      return next(e);
    }
    const { Box, Text } = $.ui.resolve(e);
    const below = await next(e);
    const light = band(Box, Text, e.bodyColumns ?? 80);
    return below ? Box({ flexDirection: "column", children: [light, below] }) : light;
  });
}

async function takeReading($) {
  try {
    const { context } = await $.session.usage();
    if (!context || !Number.isFinite(context.window) || context.window <= 0 || !Number.isFinite(context.tokens) || context.tokens < 0) {
      stale = true;
      return;
    }
    const tokens = context.tokens;
    const percent = Math.round(context.percent ?? (tokens / context.window) * 100);
    // The session.start reading is 0 before any response; drop it once real readings arrive.
    readings = readings.filter((r) => r.tokens > 0);
    const last = readings[readings.length - 1];
    if (!last || last.tokens !== tokens || last.window !== context.window || last.percent !== percent) {
      readings.push({ tokens, window: context.window, percent });
    }
    stale = false;
    if (readings.length > HISTORY) {
      readings = readings.slice(-HISTORY);
    }
    $.ui.invalidate("ui.render");
  } catch {
    // No reading this turn; the band keeps the last one.
    stale = true;
  }
}

function band(Box, Text, columns) {
  const now = readings[readings.length - 1];
  const f = signalFor(now.percent);
  const trend = trendWord();
  const parts = [
    Text({ wrap: "truncate-end", color: stale ? 'gray' : f.color, bold: true, children: `${LAMP}  ${f.word}` }),
    Text({ wrap: "truncate-end", children: `  ${now.percent}% of context` }),
    Text({ wrap: "truncate-end", dimColor: true, children: `  ${short(now.tokens)} / ${short(now.window)}` }),
  ];
  if (stale) parts.push(Text({ wrap: "truncate-end", dimColor: true, children: '  STALE' }));
  if (columns >= 60) {
    parts.push(Text({ wrap: "truncate-end", dimColor: true, children: "   last turns " }));
    parts.push(Text({ wrap: "truncate-end", color: f.color, children: chart() }));
    if (trend) {
      parts.push(Text({ wrap: "truncate-end", dimColor: true, children: `  ${trend}` }));
    }
  }
  return Box({ flexDirection: "row", paddingX: 1, children: parts });
}

export function signalFor(percent) {
  return SIGNAL.find((band) => percent < band.upTo) ?? SIGNAL[SIGNAL.length - 1];
}

// Bars scale to the busiest reading shown, so growth shows at any fill level.
function chart() {
  const top = Math.max(...readings.map((r) => r.tokens), 1);
  const bars = readings.map((r) => BARS[Math.min(BARS.length - 1, Math.floor((r.tokens / top) * (BARS.length - 1)))]);
  return bars.join("");
}

function trendWord() {
  if (readings.length < 2) {
    return "";
  }
  const delta = readings[readings.length - 1].tokens - readings[readings.length - 2].tokens;
  if (delta > 0) return `▲ +${short(delta)} last turn`;
  if (delta < 0) return `▼ ${short(-delta)} last turn`;
  return "steady";
}

function short(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return String(n);
}
