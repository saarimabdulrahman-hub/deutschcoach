// Grammar discovery template configuration (Section 8.7).
// Maps lesson grammar topic slugs to discovery templates.
// Lessons reference template + topic slug — this is the single source of truth.
// Falls back to slug-based inference when no explicit template is registered.

export type GrammarTemplate = "declension" | "conjugation" | "position" | "comparison";

// Explicit slug → template mapping. Add new topics here as they appear in the curriculum.
const SLUG_TEMPLATES: Record<string, GrammarTemplate> = {
  // Declension
  "definite-articles": "declension",
  "indefinite-articles": "declension",
  "possessive-pronouns": "declension",
  "personal-pronouns": "declension",
  "adjective-endings": "declension",

  // Conjugation
  "verb-conjugation": "conjugation",
  "regular-verbs": "conjugation",
  "sein-haben": "conjugation",
  "modal-verbs": "conjugation",

  // Position
  "sentence-position": "position",
  "verb-position": "position",
  "time-manner-place": "position",

  // Comparison
  "comparative": "comparison",
  "superlative": "comparison",
};

/** Infer template from a grammar topic's slug and title when not explicitly registered. */
function inferTemplate(slug: string, title: string): GrammarTemplate {
  const s = slug.toLowerCase();
  const t = title.toLowerCase();

  if (s.includes("conjugation") || s.includes("verb") || s.includes("sein") || s.includes("haben") || s.includes("modal") ||
      t.includes("conjugation") || t.includes("verb")) {
    return "conjugation";
  }
  if (s.includes("position") || s.includes("time") || s.includes("manner") || s.includes("place") ||
      t.includes("position") || t.includes("word order")) {
    return "position";
  }
  if (s.includes("comparative") || s.includes("superlative") || s.includes("adjective") || s.includes("comparison") ||
      t.includes("comparative") || t.includes("superlative") || t.includes("adjective")) {
    return "comparison";
  }
  return "declension"; // default: declension covers articles, noun cases, pronouns
}

/** Resolve the discovery template for a grammar topic. */
export function getGrammarTemplate(slug?: string, title?: string): GrammarTemplate {
  if (slug && SLUG_TEMPLATES[slug.toLowerCase()]) {
    return SLUG_TEMPLATES[slug.toLowerCase()];
  }
  return inferTemplate(slug ?? "", title ?? "");
}
