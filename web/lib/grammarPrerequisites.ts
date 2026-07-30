// Grammar prerequisite awareness (Section 10.1).
// Defines prerequisite relationships between grammar topics.
// Before injecting a weak grammar topic, the system verifies prerequisites
// and injects them first if they remain weak.

export interface GrammarPrerequisite {
  topicSlug: string;
  prerequisiteSlugs: string[];
  /** Minimum confidence score (0-100) required for prerequisites before this topic is shown. */
  minimumPrerequisiteStrength: number;
}

const PREREQUISITES: GrammarPrerequisite[] = [
  {
    topicSlug: "verb-conjugation",
    prerequisiteSlugs: ["personal-pronouns"],
    minimumPrerequisiteStrength: 40,
  },
  {
    topicSlug: "sentence-position",
    prerequisiteSlugs: ["verb-conjugation"],
    minimumPrerequisiteStrength: 50,
  },
  {
    topicSlug: "time-manner-place",
    prerequisiteSlugs: ["sentence-position", "verb-conjugation"],
    minimumPrerequisiteStrength: 50,
  },
  {
    topicSlug: "definite-articles",
    prerequisiteSlugs: ["personal-pronouns"],
    minimumPrerequisiteStrength: 40,
  },
  {
    topicSlug: "indefinite-articles",
    prerequisiteSlugs: ["definite-articles"],
    minimumPrerequisiteStrength: 50,
  },
  {
    topicSlug: "adjective-endings",
    prerequisiteSlugs: ["definite-articles", "indefinite-articles"],
    minimumPrerequisiteStrength: 50,
  },
  {
    topicSlug: "comparative",
    prerequisiteSlugs: ["adjective-endings"],
    minimumPrerequisiteStrength: 40,
  },
  {
    topicSlug: "superlative",
    prerequisiteSlugs: ["comparative"],
    minimumPrerequisiteStrength: 40,
  },
  {
    topicSlug: "modal-verbs",
    prerequisiteSlugs: ["verb-conjugation"],
    minimumPrerequisiteStrength: 50,
  },
  {
    topicSlug: "sein-haben",
    prerequisiteSlugs: ["verb-conjugation"],
    minimumPrerequisiteStrength: 40,
  },
];

/** Get prerequisites for a given grammar topic slug. */
export function getPrerequisites(topicSlug: string): GrammarPrerequisite | undefined {
  return PREREQUISITES.find((p) => p.topicSlug === topicSlug);
}

/** Check if a topic's prerequisites are met given current concept strengths. */
export function arePrerequisitesMet(
  topicSlug: string,
  conceptStrengths: Record<string, number>,
): { met: boolean; missing: string[] } {
  const prereq = getPrerequisites(topicSlug);
  if (!prereq) return { met: true, missing: [] };

  const missing: string[] = [];
  for (const slug of prereq.prerequisiteSlugs) {
    const strength = conceptStrengths[slug] ?? 0;
    if (strength < prereq.minimumPrerequisiteStrength) {
      missing.push(slug);
    }
  }
  return { met: missing.length === 0, missing };
}

/** Get a map of { topicSlug: strength } from course data. */
export function buildConceptStrengthMap(
  grammarScores: Record<string, number | null | undefined>,
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const [key, score] of Object.entries(grammarScores)) {
    if (score !== null && score !== undefined) {
      map[key] = score;
    }
  }
  return map;
}
