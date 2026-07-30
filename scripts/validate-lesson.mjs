#!/usr/bin/env node

/**
 * Lesson Validation Script (Section 12.9).
 * Validates lesson markdown files against content standards.
 * Designed to run in CI on lesson PRs.
 *
 * Usage: node scripts/validate-lesson.mjs [filepath]
 * Exit code: 0 = pass, 1 = fail
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURRICULUM_DIR = path.resolve(__dirname, "..", "backend", "data", "curriculum");

// ── Requirements (Section 5.6) ──────────────────────────────────────────

const MIN_VOCAB = 4;
const MIN_EXERCISES = 8;
const MIN_CHECKPOINTS = 2;
const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1"];
const VALID_TYPES = ["dialogue", "grammar", "vocabulary", "mixed"];

let errors = [];
let warnings = [];

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return null;
  const end = content.indexOf("---", 3);
  if (end === -1) return null;
  const yaml = content.slice(3, end).trim();
  const data = {};

  // Simple multi-line YAML parser for curriculum format
  const lines = yaml.split("\n");
  let currentKey = null;
  let currentIndent = 0;
  let arrayStack = [];

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trim().startsWith("#")) continue;
    const line = rawLine.replace(/\t/g, "  ");
    const indent = line.search(/\S/);
    const trimmed = line.trim();

    // Detect key: value
    const kvMatch = trimmed.match(/^([\w-]+):\s*(.*)/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();
      if (val === "" || val === "[]") {
        data[currentKey] = [];
      } else if (val.startsWith("[")) {
        try { data[currentKey] = JSON.parse(val.replace(/'/g, '"')); } catch { data[currentKey] = val; }
      } else if (val === "true") {
        data[currentKey] = true;
      } else if (val === "false") {
        data[currentKey] = false;
      } else if (!isNaN(Number(val))) {
        data[currentKey] = Number(val);
      } else {
        data[currentKey] = val.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      }
      continue;
    }

    // Array items: `- key: value` or `- value`
    const itemMatch = trimmed.match(/^-\s*(?:([\w-]+):\s*)?(.*)/);
    if (itemMatch) {
      const itemKey = itemMatch[1];
      const itemVal = itemMatch[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      if (currentKey && Array.isArray(data[currentKey])) {
        if (itemKey) {
          const last = data[currentKey][data[currentKey].length - 1];
          if (last && typeof last === "object" && !Array.isArray(last)) {
            last[itemKey] = itemVal;
          } else {
            const obj = {};
            obj[itemKey] = itemVal;
            data[currentKey].push(obj);
          }
        } else if (itemVal) {
          data[currentKey].push(itemVal);
        }
      }
      continue;
    }

    // Nested key under array item (indented)
    if (currentKey && indent > 2) {
      const nvMatch = trimmed.match(/^([\w-]+):\s*(.*)/);
      if (nvMatch) {
        const nvVal = nvMatch[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
        // Try to set on last element of parent array
        for (const arrKey of Object.keys(data)) {
          if (Array.isArray(data[arrKey]) && data[arrKey].length > 0) {
            const last = data[arrKey][data[arrKey].length - 1];
            if (typeof last === "object") {
              // Handle nested arrays (e.g., examples)
              const nestedArr = trimmed.match(/^([\w-]+):\s*$/);
              if (nestedArr) {
                if (!last[nestedArr[1]]) last[nestedArr[1]] = [];
              } else {
                last[nvMatch[1]] = nvVal || [];
              }
            }
          }
        }
      }
    }
  }

  return data;
}

function countInContent(content, regex) {
  return (content.match(regex) || []).length;
}

function validateLesson(filepath) {
  errors = [];
  warnings = [];
  const basename = path.basename(filepath);
  const content = fs.readFileSync(filepath, "utf-8");

  const data = parseFrontmatter(content);
  if (!data) {
    errors.push("Missing or invalid YAML frontmatter");
    return { file: basename, passed: false, errors, warnings };
  }

  // Level
  if (!data.level || !VALID_LEVELS.includes(data.level)) {
    errors.push(`Invalid or missing level: ${data.level || "(none)"}`);
  }

  // Lesson type
  if (data.lesson_type && !VALID_TYPES.includes(data.lesson_type)) {
    errors.push(`Invalid lesson_type: ${data.lesson_type}`);
  }

  // Title
  if (!data.title) errors.push("Missing title");

  // Vocabulary count (count - german: entries in the YAML)
  const vocabCount = countInContent(content, /^[ \t]*- german:/gm);
  if (vocabCount < MIN_VOCAB) {
    errors.push(`Vocabulary: ${vocabCount} words (minimum ${MIN_VOCAB})`);
  }

  // Dialogue presence (in markdown body)
  const dialogueLines = countInContent(content, /^\*{1,2}\w[\w\s]*:/m);
  if (dialogueLines === 0 && data.lesson_type !== "grammar") {
    warnings.push(`No dialogue speaker lines found`);
  }

  // Exercises count (count - type: entries in YAML)
  const exerciseCount = countInContent(content, /^[ \t]*- type:/gm);
  if (exerciseCount < MIN_EXERCISES) {
    warnings.push(`Exercises: ${exerciseCount} (recommended ${MIN_EXERCISES})`);
  }

  // Checkpoints (check for stages_config or checkpoints in YAML)
  const checkpointsCount = countInContent(content, /checkpoint/m);
  if (checkpointsCount < MIN_CHECKPOINTS) {
    warnings.push(`Checkpoints: ${checkpointsCount} references (recommended ${MIN_CHECKPOINTS})`);
  }

  // Grammar references
  const grammarItems = Array.isArray(data.grammar) ? data.grammar : [];
  for (const g of grammarItems) {
    if (!g.slug) warnings.push(`Grammar entry missing slug`);
  }

  const passed = errors.length === 0;
  return { file: basename, passed, errors, warnings };
}

// ── Main ────────────────────────────────────────────────────────────────

const targetFile = process.argv[2];

if (targetFile) {
  const result = validateLesson(path.resolve(targetFile));
  for (const e of result.errors) console.log(`  ❌ ${e}`);
  for (const w of result.warnings) console.log(`  ⚠️  ${w}`);
  console.log(result.passed ? `✅ ${result.file}: PASS` : `❌ ${result.file}: FAIL`);
  process.exit(result.passed ? 0 : 1);
} else {
  const dirs = fs.readdirSync(CURRICULUM_DIR).filter((d) => /^[a-z]\d$/.test(d));
  let total = 0, passed = 0;

  for (const dir of dirs) {
    const dirPath = path.join(CURRICULUM_DIR, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md")).sort();
    for (const file of files) {
      total++;
      const result = validateLesson(path.join(dirPath, file));
      if (result.passed) passed++;
      for (const e of result.errors) console.log(`  ❌ ${result.file}: ${e}`);
      for (const w of result.warnings) console.log(`  ⚠️  ${result.file}: ${w}`);
    }
  }

  console.log(`\n📊 ${passed}/${total} lessons passed`);
  process.exit(passed === total ? 0 : 1);
}
