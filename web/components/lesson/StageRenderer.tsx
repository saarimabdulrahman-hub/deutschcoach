"use client";

import type { LessonDetail, LessonListItem, VocabEntry } from "@/types";
import type { LessonStageDef } from "./lessonStages";
import type { LessonNavApi } from "./useLessonNavigation";
import type { MasteryResult } from "@/hooks/useMastery";
import type { CheckpointQuestion } from "./CheckpointStage";

import { LessonWelcome } from "./LessonWelcome";
import { ListenFirstContent } from "./ListenFirstContent";
import { DialogueContent } from "./DialogueContent";
import { VocabularyContent } from "./VocabularyContent";
import { PronunciationContent } from "./PronunciationContent";
import { CheckpointStage } from "./CheckpointStage";
import { GrammarContent } from "./GrammarContent";
import { GrammarPractice } from "./GrammarPractice";
import { DictationContent } from "./DictationContent";
import { MobileDictationContent } from "./MobileDictationContent";
import { SpeakingPlaceholder } from "./SpeakingPlaceholder";
import { LessonMasterySummary } from "./LessonMasterySummary";
import { CompletionContent } from "./CompletionContent";
import { MatchingExercise } from "@/components/interaction/MatchingExercise";
import { FillInExercise } from "@/components/interaction/FillInExercise";
import { RecallExercise } from "@/components/interaction/RecallExercise";

// StageRenderer (Section 8.6). Renders the current lesson stage by selecting
// the appropriate component based on the stage key. Drives stage rendering
// from the lesson's stage configuration. Content-agnostic shell — all
// lesson-stage-specific data is passed in as props.

export interface StageRendererProps {
  data: LessonDetail;
  stage: LessonStageDef;
  nav: LessonNavApi;
  dialogueLines: { id: number; speaker: string; german: string; translation: string }[];
  vocabWords: string[];
  isLoading: boolean;
  nextLesson: LessonListItem | undefined;
  level: string;
  mastery: MasteryResult;
  recordScore: (checkpointId: string, correct: number, total: number) => void;
  onNavigateNext: (lessonId: number) => void;
  /** Weak vocabulary for adaptive injection (Section 10.1). */
  weakVocab?: string[];
  /** Weak grammar slugs for adaptive injection (Section 10.1). */
  weakGrammar?: string[];
}

export function StageRenderer({
  data, stage, nav, dialogueLines, vocabWords, isLoading, nextLesson, level, mastery, recordScore, onNavigateNext,
  weakVocab, weakGrammar,
}: StageRendererProps) {
  const dialogueProps = {
    sceneTitle: data.lesson.title,
    sceneDescription: data.lesson.description ?? undefined,
    welcomeMessage: `👋 Hi! Today we're learning "${data.lesson.title}". Don't worry — I'll help you pronounce every word.`,
    lines: dialogueLines.length ? dialogueLines.map((dl) => ({
      id: dl.id, speaker: dl.speaker, german: dl.german, translation: dl.translation,
    })) : [{ id: 0, speaker: "Speaker", german: data.lesson.content?.slice(0, 100) ?? "[Content]", translation: "Read the lesson content." }],
    loading: isLoading,
  };

  const vocabPairs = data.vocabulary.map((v) => ({ id: v.id, left: v.german, right: v.english }));
  const exerciseItems = data.exercises.map((e: Record<string, unknown>, i) => ({
    id: i, front: (e.question as string) ?? "", back: (e.answer as string) ?? "",
    hint: (e.hint as string) ?? e.question ? "Fill in the blank." : undefined,
  }));

  switch (stage.key) {
    // ── Welcome / Objectives ─────────────────────────────────────
    case "welcome":
    case "objectives":
      return <LessonWelcome lesson={data.lesson}
        vocabCount={data.vocabulary.length} exerciseCount={data.exercises.length}
        onStart={nav.goNext} />;

    // ── Listen First (audio-only) ────────────────────────────────
    case "listen":
      return <ListenFirstContent
        dialogueText={dialogueLines.length ? dialogueLines.map((l) => l.german).join(". ") : data.lesson.content ?? ""}
        onContinue={nav.goNext} />;

    // ── Dialogue / Interactive Dialogue / Role-play ──────────────
    case "dialogue":
    case "interactive-dialogue":
    case "role-play":
      return <DialogueContent {...dialogueProps} />;

    // ── Vocabulary / Vocab Explorer / See / Hear ────────────────
    case "vocabulary":
    case "vocab-explorer":
    case "see":
    case "hear":
      return <VocabularyContent vocabulary={data.vocabulary} weakWords={weakVocab} />;

    // ── Pronunciation Practice ───────────────────────────────────
    case "pronounce":
      return <PronunciationContent vocabulary={data.vocabulary} />;

    // ── Checkpoint / Comprehension Check ─────────────────────────
    case "checkpoint":
    case "comprehension-check":
      return <CheckpointStage title="Checkpoint" questions={generateDialogueCheckpoint(data, dialogueLines)}
        onComplete={(correct, total) => {
          recordScore("checkpoint-dialogue", correct, total);
          nav.goNext();
        }} />;

    case "checkpoint-grammar":
      return <CheckpointStage title="Grammar Check" questions={generateGrammarCheckpoint(data)}
        onComplete={(correct, total) => {
          recordScore("checkpoint-grammar", correct, total);
          nav.goNext();
        }} />;

    case "checkpoint-final":
      return <CheckpointStage title="Final Check" questions={generateFinalCheckpoint(data)}
        onComplete={(correct, total) => {
          recordScore("checkpoint-final", correct, total);
          nav.goNext();
        }} />;

    // ── Grammar / Grammar Discovery / Observe / Discover / Explain
    case "grammar":
    case "grammar-discovery":
    case "observe":
    case "discover":
    case "explain":
      return <GrammarContent grammarTopics={data.grammar_topics} weakGrammar={weakGrammar} />;

    // ── Grammar Practice (Section 10.3 adaptive reinforcement)
    case "grammar-practice":
      return <GrammarPractice grammarTopics={data.grammar_topics} weakGrammar={weakGrammar} />;

    // ── Practice / Apply / Guided Practice ───────────────────────
    case "guided-practice":
    case "practice":
    case "apply":
    case "match":
      return <MatchingExercise pairs={vocabPairs} />;

    // ── Interactive Exercise ─────────────────────────────────────
    case "interactive-exercise":
      return <FillInExercise items={exerciseItems} />;

    // ── Dictation (type what you hear) ───────────────────────────
    case "type":
      return <DictationContent vocabulary={data.vocabulary} />;

    // ── Mobile Dictation (with German char keys) ─────────────────
    case "mobile-dictation":
      return <MobileDictationContent vocabulary={data.vocabulary} />;

    // ── Recall / Mini Review ─────────────────────────────────────
    case "recall":
    case "mini-review":
      return <RecallExercise items={data.vocabulary.map((v) => ({
        id: v.id, front: v.german, back: v.english,
      }))} />;

    // ── Speaking / Speak ─────────────────────────────────────────
    case "speaking":
    case "speak":
      return <SpeakingPlaceholder vocabulary={vocabWords} />;

    // ── Summary / Learning Summary ───────────────────────────────
    case "summary":
    case "learning-summary":
      return <LessonMasterySummary
        title={data.lesson.title}
        mastery={mastery}
        wordCount={data.vocabulary.length}
        patternName={data.grammar_topics?.[0]?.title}
        nextTitle={nextLesson?.title}
        onNextLesson={nextLesson ? () => onNavigateNext(nextLesson.id) : undefined}
      />;

    // ── Celebration ──────────────────────────────────────────────
    case "celebration":
      return <CompletionContent mode="celebration"
        title={data.lesson.title}
        wordCount={data.vocabulary.length}
        patternName={data.grammar_topics?.[0]?.title}
        onFinish={nav.goNext}
      />;

    default:
      return (
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: 12 }}>🚧</span>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>Coming soon</p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>This lesson stage is being built. Check back soon!</p>
        </div>
      );
  }
}

// ── Checkpoint question generators (co-located with the renderer) ─────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDialogueCheckpoint(
  data: LessonDetail,
  dialogueLines: { id: number; speaker: string; german: string; translation: string }[]
): CheckpointQuestion[] {
  const questions: CheckpointQuestion[] = [];

  const speakers = [...new Set(dialogueLines.map((l) => l.speaker))];
  if (speakers.length >= 2) {
    const nonFirst = speakers.filter((s) => s !== speakers[0]);
    const targetSpeaker = nonFirst.length > 0 ? nonFirst[0] : speakers[0];
    const targetLines = dialogueLines.filter((l) => l.speaker === targetSpeaker);
    if (targetLines.length > 0) {
      const example = targetLines[0];
      questions.push({
        question: `In the dialogue, who says "${example.german}"?`,
        options: shuffleArray([targetSpeaker, ...speakers.filter((s) => s !== targetSpeaker).slice(0, 2), "A narrator"]).slice(0, 4),
        correctIndex: 0,
        explanation: `"${example.german}" is spoken by ${targetSpeaker}. It means "${example.translation}".`,
      });
    }
  } else if (speakers.length === 1) {
    questions.push({
      question: `Who speaks in this dialogue?`,
      options: [speakers[0], "The teacher", "Anna", "You"],
      correctIndex: 0,
      explanation: `This dialogue features ${speakers[0]}.`,
    });
  }

  const vocabInDialogue = data.vocabulary.filter((v) =>
    dialogueLines.some((l) => l.german.toLowerCase().includes(v.german.toLowerCase()))
  );
  if (vocabInDialogue.length > 0) {
    const pick = vocabInDialogue[Math.floor(Math.random() * vocabInDialogue.length)];
    const distractors = data.vocabulary
      .filter((v) => v.german !== pick.german)
      .slice(0, 3)
      .map((v) => v.english);
    while (distractors.length < 3) distractors.push("a different word");
    questions.push({
      question: `In context, what does "${pick.german}" mean?`,
      options: shuffleArray([pick.english, ...distractors]),
      correctIndex: 0,
      explanation: `"${pick.german}" translates to "${pick.english}" in this context.${pick.example_sentence ? ` Example: ${pick.example_sentence}` : ""}`,
    });
  }

  if (dialogueLines.length >= 2) {
    const line = dialogueLines[Math.floor(Math.random() * dialogueLines.length)];
    const wrongTranslations = dialogueLines
      .filter((l) => l.id !== line.id)
      .slice(0, 3)
      .map((l) => l.translation);
    while (wrongTranslations.length < 3) wrongTranslations.push("something else");
    questions.push({
      question: `What does "${line.german}" mean in English?`,
      options: shuffleArray([line.translation, ...wrongTranslations]),
      correctIndex: 0,
      explanation: `"${line.german}" means "${line.translation}" in English. This is spoken by ${line.speaker}.`,
    });
  }

  if (questions.length < 2) {
    questions.push({
      question: "What language skill does this dialogue help you practice?",
      options: ["Listening and comprehension", "Writing essays", "Reading novels", "Learning math"],
      correctIndex: 0,
      explanation: "Dialogues help you practice listening to natural German speech and understanding context.",
    });
  }

  return questions.slice(0, 3);
}

function generateGrammarCheckpoint(data: LessonDetail): CheckpointQuestion[] {
  const questions: CheckpointQuestion[] = [];
  const topics = data.grammar_topics ?? [];

  if (topics.length > 0) {
    const topic = topics[0];
    if (topic.content) {
      const sentences = topic.content.split(/[.!?]+/).filter(Boolean);
      if (sentences.length > 1) {
        const excerpt = sentences[Math.floor(Math.random() * (sentences.length - 1))].trim().slice(0, 80);
        questions.push({
          question: `Which grammar pattern is described as "${excerpt}..."?`,
          options: shuffleArray([topic.title, ...(data.grammar_topics?.slice(1).map((g) => g.title) ?? []).slice(0, 3)]).slice(0, 4),
          correctIndex: 0,
          explanation: topic.content.slice(0, 150),
        });
      }
    }

    const allExamples = topics.flatMap((t) => t.examples ?? []);
    const validExamples = allExamples.filter((ex: any) => ex.de && ex.en);
    if (validExamples.length >= 2) {
      const ex = validExamples[Math.floor(Math.random() * validExamples.length)] as any;
      const wrongAnswers = validExamples
        .filter((e: any) => e.en !== ex.en)
        .slice(0, 3)
        .map((e: any) => e.en) as string[];
      while (wrongAnswers.length < 3) wrongAnswers.push("a different meaning");
      questions.push({
        question: `What does the German example "${ex.de}" mean?`,
        options: shuffleArray([ex.en, ...wrongAnswers]),
        correctIndex: 0,
        explanation: `"${ex.de}" translates to "${ex.en}". This illustrates the ${topic?.title ?? "grammar"} pattern.`,
      });
    }

    if (topic?.title) {
      const contextWords = ["sentence", "verb", "noun", "pattern", "rule", "structure"];
      const word = contextWords[Math.floor(Math.random() * contextWords.length)];
      questions.push({
        question: `What should you focus on when practicing "${topic.title}"?`,
        options: shuffleArray([
          `Understanding the ${word} of the pattern`,
          "Only memorizing vocabulary",
          "Skipping the examples",
          "Writing in English first",
        ]),
        correctIndex: 0,
        explanation: `When studying "${topic.title}", focus on understanding how the ${word} works in context using the examples provided.`,
      });
    }
  }

  if (questions.length < 2) {
    questions.push({
      question: "Why is it important to study grammar patterns?",
      options: [
        "They help you construct correct sentences",
        "They are not important",
        "Only vocabulary matters",
        "German has no grammar",
      ],
      correctIndex: 0,
      explanation: "Grammar patterns are the building blocks that let you construct your own sentences correctly in German.",
    });
  }

  return questions.slice(0, 3);
}

function generateFinalCheckpoint(data: LessonDetail): CheckpointQuestion[] {
  const questions: CheckpointQuestion[] = [];
  const vocab = data.vocabulary;

  if (vocab.length > 0) {
    const pick = vocab[Math.floor(Math.random() * vocab.length)];
    const distractors = vocab
      .filter((v) => v.german !== pick.german)
      .slice(0, 3)
      .map((v) => v.english);
    while (distractors.length < 3) distractors.push("something else");
    questions.push({
      question: `You learned "${pick.german}" — what does it mean?`,
      options: shuffleArray([pick.english, ...distractors]),
      correctIndex: 0,
      explanation: `"${pick.german}" means "${pick.english}".${pick.example_sentence ? ` E.g., "${pick.example_sentence}"` : ""} This is a ${pick.part_of_speech ?? "word"} ${pick.gender ? `(gender: ${pick.gender})` : ""}.`,
    });
  }

  const topics = data.lesson.topics ?? [];
  const topicWords = topics.length > 0 ? topics : ["conversation", "vocabulary"];
  const scenario = topicWords[0].includes("greet") ? "greeting someone" :
    topicWords[0].includes("intro") ? "introducing yourself" :
    topicWords[0].includes("number") ? "using numbers" :
    topicWords[0].includes("food") ? "ordering food" :
    topicWords[0].includes("family") ? "talking about family" :
    "using your new German skills";
  questions.push({
    question: `After this lesson, what can you practice in real life?`,
    options: shuffleArray([
      scenario.charAt(0).toUpperCase() + scenario.slice(1),
      "Writing a novel",
      "Solving math problems",
      "Painting a picture",
    ]),
    correctIndex: 0,
    explanation: `This lesson covers ${topicWords.join(", ")}, so you can practice ${scenario} in German.`,
  });

  if (vocab.length > 1) {
    const w1 = vocab[0];
    const w2 = vocab[1];
    questions.push({
      question: `The words "${w1.german}" and "${w2.german}" are from this lesson. What do they have in common?`,
      options: shuffleArray([
        `They're both ${w1.part_of_speech ?? "words"} in this lesson's vocabulary`,
        "They mean the same thing",
        "They're opposite in meaning",
        "They're only for A1 level",
      ]),
      correctIndex: 0,
      explanation: `"${w1.german}" (${w1.english}) and "${w2.german}" (${w2.english}) are both part of this lesson's vocabulary set to help you build contextual understanding.`,
    });
  }

  if (questions.length < 2) {
    questions.push({
      question: "What is the best way to reinforce what you just learned?",
      options: ["Practice regularly with spaced repetition", "Only study once", "Skip difficult words", "Use Google Translate"],
      correctIndex: 0,
      explanation: "Spaced repetition helps move new vocabulary from short-term to long-term memory through timed review intervals.",
    });
  }

  return questions.slice(0, 3);
}
