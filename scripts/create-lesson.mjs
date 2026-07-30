#!/usr/bin/env node

/**
 * Lesson Authoring CLI (Section 12.8).
 * Usage: node scripts/create-lesson.mjs --type <dialogue|grammar|vocabulary|mixed> --title "..." --level A1 --unit 1
 *
 * Generates a complete lesson scaffold in backend/data/curriculum/{level}/{order}-{slug}.md
 * with frontmatter, stage configuration, placeholder exercises, checkpoints, and dialogue entries.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURRICULUM_DIR = path.resolve(__dirname, "..", "backend", "data", "curriculum");

// ── Argument parsing ────────────────────────────────────────────────────

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i].replace(/^--/, "");
  args[key] = process.argv[i + 1];
}

const { type = "mixed", title, level = "A1", unit = "1", grammar_topic } = args;

if (!title) {
  console.error("Usage: node scripts/create-lesson.mjs --type <type> --title \"...\" --level A1 --unit 1 [--grammar_topic dative]");
  process.exit(1);
}

// ── Grammar template auto-selection ─────────────────────────────────────

const GRAMMAR_TEMPLATES = {
  "dative": "declension",
  "accusative": "declension",
  "genitive": "declension",
  "definite-articles": "declension",
  "indefinite-articles": "declension",
  "adjective-endings": "declension",
  "possessive-pronouns": "declension",
  "personal-pronouns": "declension",
  "verb-conjugation": "conjugation",
  "regular-verbs": "conjugation",
  "sein-haben": "conjugation",
  "modal-verbs": "conjugation",
  "sentence-position": "position",
  "verb-position": "position",
  "time-manner-place": "position",
  "comparative": "comparison",
  "superlative": "comparison",
};

const grammarTemplate = GRAMMAR_TEMPLATES[grammar_topic] || "declension";

// ── Slug generation ────────────────────────────────────────────────────

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

// ── Stage templates ────────────────────────────────────────────────────

const STAGE_TEMPLATES = {
  dialogue: [
    { key: "listen", label: "Listen" },
    { key: "dialogue", label: "Dialogue" },
    { key: "vocabulary", label: "Vocabulary" },
    { key: "pronounce", label: "Pronounce" },
    { key: "role-play", label: "Role-play" },
    { key: "comprehension-check", label: "Comprehension Check" },
  ],
  grammar: [
    { key: "observe", label: "Observe" },
    { key: "discover", label: "Discover" },
    { key: "explain", label: "Explain" },
    { key: "practice", label: "Practice" },
    { key: "apply", label: "Apply" },
    { key: "mini-review", label: "Mini Review" },
  ],
  vocabulary: [
    { key: "listen", label: "Listen" },
    { key: "see", label: "See" },
    { key: "hear", label: "Hear" },
    { key: "match", label: "Match" },
    { key: "type", label: "Type" },
    { key: "recall", label: "Recall" },
    { key: "speak", label: "Speak" },
  ],
  mixed: [
    { key: "welcome", label: "Welcome" },
    { key: "objectives", label: "Objectives" },
    { key: "interactive-dialogue", label: "Interactive Dialogue" },
    { key: "vocab-explorer", label: "Vocab Explorer" },
    { key: "checkpoint", label: "Checkpoint" },
    { key: "grammar-discovery", label: "Grammar Discovery" },
    { key: "guided-practice", label: "Guided Practice" },
    { key: "mini-review", label: "Mini Review" },
    { key: "summary", label: "Summary" },
  ],
};

const stages = STAGE_TEMPLATES[type] || STAGE_TEMPLATES.mixed;

// ── Lesson content generation ──────────────────────────────────────────

function generateExercises() {
  return [
    { type: "fill-blank", question: "[Fill in the blank — question 1]", answer: "[answer]" },
    { type: "fill-blank", question: "[Fill in the blank — question 2]", answer: "[answer]" },
    { type: "fill-blank", question: "[Fill in the blank — question 3]", answer: "[answer]" },
    { type: "multiple-choice", question: "[Multiple choice question 1]?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "[correct option]" },
    { type: "multiple-choice", question: "[Multiple choice question 2]?", options: ["Option A", "Option B", "Option C", "Option D"], answer: "[correct option]" },
    { type: "translate", prompt: "[Translate this sentence]", answer: "[translation]" },
  ];
}

function generateCheckpoints() {
  return [
    {
      title: "Checkpoint 1",
      questions: [
        { question: "[Checkpoint question 1?]", options: ["Option A", "Option B", "Option C"], correctIndex: 0, explanation: "[Explanation]" },
        { question: "[Checkpoint question 2?]", options: ["Option A", "Option B", "Option C"], correctIndex: 0, explanation: "[Explanation]" },
        { question: "[Checkpoint question 3?]", options: ["Option A", "Option B", "Option C"], correctIndex: 0, explanation: "[Explanation]" },
      ],
    },
    {
      title: "Checkpoint 2",
      questions: [
        { question: "[Checkpoint question 1?]", options: ["Option A", "Option B", "Option C"], correctIndex: 0, explanation: "[Explanation]" },
        { question: "[Checkpoint question 2?]", options: ["Option A", "Option B", "Option C"], correctIndex: 0, explanation: "[Explanation]" },
        { question: "[Checkpoint question 3?]", options: ["Option A", "Option B", "Option C"], correctIndex: 0, explanation: "[Explanation]" },
      ],
    },
  ];
}

// ── Frontmatter generation ─────────────────────────────────────────────

const frontmatter = {
  title,
  level,
  unit: parseInt(unit),
  order: 1,
  lesson_type: type,
  topics: grammar_topic ? [grammar_topic] : ["[topic]"],
  grammar_template: type === "grammar" ? grammarTemplate : undefined,
  vocabulary: [],
  grammar: type === "grammar" ? [
    {
      slug: grammar_topic || "[grammar-slug]",
      title: grammar_topic ? `${grammar_topic.charAt(0).toUpperCase() + grammar_topic.slice(1)}` : "[Grammar Title]",
      description: "[Grammar description — what this pattern is and when to use it]",
      examples: [
        { de: "[German example sentence]", en: "[English translation]" },
        { de: "[German example sentence]", en: "[English translation]" },
      ],
    },
  ] : [],
  exercises: generateExercises(),
  checkpoints: generateCheckpoints(),
  stages,
};

// ── File output ────────────────────────────────────────────────────────

function yamlValue(v, pad) {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return `"${String(v).replace(/"/g, '\\"')}"`;
}

function serializeYaml(obj, indent = 0) {
  const pad = "  ".repeat(indent);
  let out = "";
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    if (key === "stages") {
      out += `${pad}stages:\n`;
      for (const s of val) {
        out += `${pad}  - key: ${s.key}\n`;
        out += `${pad}    label: "${s.label}"\n`;
      }
    } else if (Array.isArray(val)) {
      if (val.length === 0) {
        out += `${pad}${key}: []\n`;
      } else if (typeof val[0] === "string") {
        out += `${pad}${key}:\n`;
        for (const item of val) {
          out += `${pad}  - ${yamlValue(item)}\n`;
        }
      } else {
        out += `${pad}${key}:\n`;
        for (const item of val) {
          out += `${pad}  -\n`;
          for (const [k, v] of Object.entries(item)) {
            if (Array.isArray(v)) {
              out += `${pad}    ${k}:\n`;
              for (const opt of v) {
                if (typeof opt === "object" && opt !== null) {
                  out += `${pad}      -\n`;
                  for (const [ok, ov] of Object.entries(opt)) {
                    out += `${pad}        ${ok}: ${yamlValue(ov)}\n`;
                  }
                } else {
                  out += `${pad}      - ${yamlValue(opt)}\n`;
                }
              }
            } else if (typeof v === "object" && v !== null) {
              out += `${pad}    ${k}:\n`;
              for (const [ok, ov] of Object.entries(v)) {
                out += `${pad}      ${ok}: ${yamlValue(ov)}\n`;
              }
            } else {
              out += `${pad}    ${k}: ${yamlValue(v)}\n`;
            }
          }
        }
      }
    } else if (typeof val === "object" && val !== null) {
      out += `${pad}${key}:\n`;
      out += serializeYaml(val, indent + 1);
    } else {
      out += `${pad}${key}: ${yamlValue(val)}\n`;
    }
  }
  return out;
}

function dialogueLines(type) {
  if (type === "dialogue") {
    return `
## Dialogue

*Speaker A:* [German dialogue line 1]
*Speaker B:* [German dialogue line 2]
*Speaker A:* [German dialogue line 3]
*Speaker B:* [German dialogue line 4]

## Vocabulary

Add vocabulary practice content here.

## Grammar

Add grammar content here.

## Practice

Complete the exercises below.
`;
  }
  return `
## Content

Add lesson content here.

## Practice

Complete the exercises below.
`;
}

const stageList = stages.map((s) => `  - ${s.key}: "${s.label}"`).join("\n");

const markdown = `---
${serializeYaml(frontmatter).trim()}
---

# ${title}

${dialogueLines(type)}

---

## Lesson Metadata

- **Type:** ${type}
- **Level:** ${level}
- **Unit:** ${unit}
- **Stages:**
${stageList}
`;

// ── Write file ─────────────────────────────────────────────────────────

const levelDir = path.join(CURRICULUM_DIR, level.toLowerCase());
if (!fs.existsSync(levelDir)) {
  fs.mkdirSync(levelDir, { recursive: true });
}

// Find next order number
const existing = fs.readdirSync(levelDir).filter((f) => f.endsWith(".md"));
const nextOrder = existing.length + 1;
const filename = `${String(nextOrder).padStart(2, "0")}-${slug}.md`;
const filepath = path.join(levelDir, filename);

fs.writeFileSync(filepath, markdown, "utf-8");
console.log(`✅ Lesson scaffold created: ${filepath}`);
console.log(`   Type: ${type} | Level: ${level} | Unit: ${unit}`);
if (grammar_topic) console.log(`   Grammar template: ${grammarTemplate}`);
console.log(`   Stages: ${stages.length}`);
console.log("   Placeholder exercises: 6 (3 fill-blank, 2 MC, 1 translate)");
console.log("   Checkpoint sets: 2 (3 questions each)");
