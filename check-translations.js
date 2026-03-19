#!/usr/bin/env node
/**
 * check-translations.js
 * Compares ar.json, en.json, fr.json for missing or extra keys.
 * Prints a summary to the console AND writes translation-audit.md in the project root.
 *
 * Usage:
 *   node check-translations.js <path-to-messages-folder>
 *
 * Example:
 *   node check-translations.js ./messages
 *   node check-translations.js ./src/i18n/messages
 *
 * The folder must contain: ar.json, en.json, fr.json
 * Report saved to: ./translation-audit.md  (relative to cwd — run from project root)
 */

const fs = require("fs");
const path = require("path");

// ─── Config ───────────────────────────────────────────────────────────────────

const LOCALES = ["en", "ar", "fr"];
const REPORT_FILE = path.resolve(process.cwd(), "translation-audit.md");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively flatten { a: { b: { c: 1 } } } → { "a.b.c": 1 } */
function flatten(obj, prefix = "", result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, fullKey, result);
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

function loadLocale(folder, locale) {
  const filePath = path.resolve(folder, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌  File not found: ${filePath}`);
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return flatten(JSON.parse(raw));
  } catch (e) {
    console.error(`❌  Failed to parse ${filePath}: ${e.message}`);
    process.exit(1);
  }
}

function setDiff(a, b) {
  return [...a].filter((k) => !b.has(k));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const folder = process.argv[2];

if (!folder) {
  console.error("Usage: node check-translations.js <path-to-messages-folder>");
  process.exit(1);
}

// Load & flatten
const data = {};
for (const locale of LOCALES) {
  data[locale] = loadLocale(folder, locale);
}

const keySets = {};
for (const locale of LOCALES) {
  keySets[locale] = new Set(Object.keys(data[locale]));
}

// Master key set (union of all locales)
const allKeys = new Set(LOCALES.flatMap((l) => [...keySets[l]]));

// Per-locale missing keys
const missing = {};
for (const locale of LOCALES) {
  missing[locale] = setDiff([...allKeys], keySets[locale]).sort();
}

// Orphan keys — present in only ONE locale
const orphans = [...allKeys].filter((key) => {
  return LOCALES.filter((l) => keySets[l].has(key)).length === 1;
}).sort();

// Empty values
const empty = {};
for (const locale of LOCALES) {
  empty[locale] = Object.entries(data[locale])
    .filter(([, v]) => v === "" || v === null || v === undefined)
    .map(([k]) => k)
    .sort();
}

// Counts
const totalKeys = allKeys.size;
const totalMissing = LOCALES.reduce((sum, l) => sum + missing[l].length, 0);
const totalEmpty = LOCALES.reduce((sum, l) => sum + empty[l].length, 0);
const runDate = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
const isClean = totalMissing === 0 && orphans.length === 0;

// ─── Build Markdown ───────────────────────────────────────────────────────────

const md = [];

md.push(`# Translation Audit Report`);
md.push(``);
md.push(`**Generated:** ${runDate}  `);
md.push(`**Messages folder:** \`${path.resolve(folder)}\`  `);
md.push(`**Status:** ${isClean ? "✅ All locales are in sync" : "❌ Locales are out of sync — fix issues below before shipping"}`);
md.push(``);

// Key counts
md.push(`## Key Counts`);
md.push(``);
md.push(`| Locale | Keys |`);
md.push(`|--------|------|`);
for (const locale of LOCALES) {
  md.push(`| ${locale.toUpperCase()} | ${keySets[locale].size} |`);
}
md.push(`| **All (union)** | **${totalKeys}** |`);
md.push(``);

// Summary
md.push(`## Summary`);
md.push(``);
md.push(`| Check | Count |`);
md.push(`|-------|-------|`);
md.push(`| 🔴 Missing keys (total across all locales) | ${totalMissing} |`);
md.push(`| 🟡 Orphan keys (in only one locale) | ${orphans.length} |`);
md.push(`| ⚪ Empty values (total across all locales) | ${totalEmpty} |`);
md.push(``);

// Missing keys
md.push(`## 🔴 Missing Keys`);
md.push(`> A key exists in at least one other locale but is absent here.`);
md.push(``);

let anyMissing = false;
for (const locale of LOCALES) {
  if (missing[locale].length === 0) {
    md.push(`### ${locale.toUpperCase()} — ✅ none missing`);
    md.push(``);
  } else {
    anyMissing = true;
    md.push(`### ${locale.toUpperCase()} — ${missing[locale].length} missing key(s)`);
    md.push(``);
    md.push(`| Key | Other locales have |`);
    md.push(`|-----|--------------------|`);
    for (const key of missing[locale]) {
      const examples = LOCALES
        .filter((l) => l !== locale && data[l][key] !== undefined)
        .map((l) => `**${l.toUpperCase()}:** \`${String(data[l][key]).slice(0, 60)}\``)
        .join(" / ");
      md.push(`| \`${key}\` | ${examples || "—"} |`);
    }
    md.push(``);
  }
}

if (!anyMissing) {
  md.push(`✅ No missing keys across any locale.`);
  md.push(``);
}

// Orphans
md.push(`## 🟡 Orphan Keys`);
md.push(`> These keys exist in only ONE locale. Usually a renamed key or a leftover.`);
md.push(``);

if (orphans.length === 0) {
  md.push(`✅ No orphan keys found.`);
  md.push(``);
} else {
  md.push(`| Key | Present only in |`);
  md.push(`|-----|-----------------|`);
  for (const key of orphans) {
    const owner = LOCALES.find((l) => keySets[l].has(key));
    md.push(`| \`${key}\` | ${owner.toUpperCase()} |`);
  }
  md.push(``);
}

// Empty values
md.push(`## ⚪ Empty Values`);
md.push(`> Keys that exist but have a blank or null value.`);
md.push(``);

for (const locale of LOCALES) {
  if (empty[locale].length === 0) {
    md.push(`### ${locale.toUpperCase()} — ✅ no empty values`);
    md.push(``);
  } else {
    md.push(`### ${locale.toUpperCase()} — ${empty[locale].length} empty value(s)`);
    md.push(``);
    for (const key of empty[locale]) {
      md.push(`- \`${key}\``);
    }
    md.push(``);
  }
}

// Write markdown file
fs.writeFileSync(REPORT_FILE, md.join("\n"), "utf8");

// ─── Console output ───────────────────────────────────────────────────────────

const SEP = "─".repeat(72);
console.log("\n" + SEP);
console.log("  TRANSLATION KEY AUDIT");
console.log(SEP);

console.log(`\n📦  Key counts`);
for (const locale of LOCALES) {
  console.log(`   ${locale.toUpperCase().padEnd(12)} ${keySets[locale].size}`);
}
console.log(`   ${"ALL (union)".padEnd(12)} ${totalKeys}`);

console.log(`\n🔴  Missing keys  : ${totalMissing}`);
for (const locale of LOCALES) {
  if (missing[locale].length > 0) {
    console.log(`   ${locale.toUpperCase()} (${missing[locale].length}): ${missing[locale].slice(0, 5).join(", ")}${missing[locale].length > 5 ? ` … +${missing[locale].length - 5} more` : ""}`);
  }
}

console.log(`\n🟡  Orphan keys   : ${orphans.length}`);
if (orphans.length > 0) {
  for (const key of orphans.slice(0, 10)) {
    const owner = LOCALES.find((l) => keySets[l].has(key));
    console.log(`   ${key}  →  only in ${owner.toUpperCase()}`);
  }
  if (orphans.length > 10) console.log(`   … +${orphans.length - 10} more (see report)`);
}

console.log(`\n⚪  Empty values  : ${totalEmpty}`);

const statusLine = isClean
  ? "✅  All locales are in sync."
  : "❌  Locales are out of sync — fix the issues listed in the report.";

console.log(`\n${statusLine}`);
console.log(`\n📄  Report saved → ${REPORT_FILE}`);
console.log("\n" + SEP + "\n");

// Non-zero exit for CI
if (!isClean) process.exit(1);