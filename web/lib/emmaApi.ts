/**
 * Emma API client (Phase 3 Section 9.2). Thin wrappers around the dedicated
 * Emma backend endpoints: hint, pronounce, encourage, explain-grammar.
 *
 * Each call is fire-and-forget with a local fallback so the UI never blocks.
 */

import { api } from "./api";

interface HintResponse {
  hint: string;
}

interface PronounceResponse {
  feedback: string;
  score: number;
}

interface EncourageResponse {
  message: string;
}

interface ExplainGrammarResponse {
  explanation: string;
}

/** Get a contextual hint from Emma. Falls back to a local hint on error. */
export async function fetchEmmaHint(
  question: string,
  context: {
    lessonTitle?: string;
    stage?: string;
    stageLabel?: string;
    vocabulary?: string[];
    grammarPattern?: string;
  }
): Promise<string> {
  try {
    const res = await api.post<HintResponse>("/emma/hint", {
      lesson_context: {
        lesson_title: context.lessonTitle ?? "",
        stage: context.stage ?? "",
        stage_label: context.stageLabel ?? "",
        vocabulary: context.vocabulary ?? [],
        grammar_pattern: context.grammarPattern ?? null,
      },
      question,
    });
    return res.hint;
  } catch {
    return "Think about what you already know from this lesson. Try breaking the problem down into smaller steps. 💡";
  }
}

/** Get pronunciation feedback from Emma. Falls back on error. */
export async function fetchEmmaPronunciation(
  lessonText: string
): Promise<PronounceResponse> {
  try {
    return await api.post<PronounceResponse>("/emma/pronounce", { lesson_text: lessonText });
  } catch {
    return {
      feedback: "Keep practicing! Focus on the vowel sounds — German vowels are clearer than English ones. 🎤",
      score: 70,
    };
  }
}

/** Get encouragement from Emma based on checkpoint score. */
export async function fetchEmmaEncouragement(
  checkpointScore: number,
  lessonTitle: string
): Promise<string> {
  try {
    const res = await api.post<EncourageResponse>("/emma/encourage", {
      checkpoint_score: checkpointScore,
      lesson_title: lessonTitle,
    });
    return res.message;
  } catch {
    if (checkpointScore >= 80) return "Excellent work! You're mastering this lesson. 🌟";
    if (checkpointScore >= 50) return "Good progress! Keep reviewing and you'll nail it. 💪";
    return "Every attempt builds your skills. Keep going! 🌱";
  }
}

/** Get a grammar explanation from Emma. */
export async function fetchEmmaGrammarExplanation(
  topicSlug: string,
  topicTitle: string,
  topicContent?: string | null
): Promise<string> {
  try {
    const res = await api.post<ExplainGrammarResponse>("/emma/explain-grammar", {
      topic_slug: topicSlug,
      topic_title: topicTitle,
      topic_content: topicContent ?? null,
    });
    return res.explanation;
  } catch {
    return `**${topicTitle}**: This pattern helps build correct German sentences. Study the examples and try creating your own! 📚`;
  }
}
