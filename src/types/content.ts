/**
 * Core domain types for the English-learning content model.
 *
 * These are pure data types — no rendering, no persistence, no i18n concerns
 * live here. The content registry produces these from raw JSON; the renderer
 * consumes them.
 */

/** Localized text keyed by learner interface language code (ar, fr, hi, ...). */
export type LocalizedText = Record<string, string>;

/** Asset references — paths relative to content root, resolved by registry. */
export interface AudioRef {
  /** Spoken audio path (mp3/ogg) relative to content folder. */
  src: string;
  /** Optional text transcript. */
  transcript?: string;
}

/** A single vocabulary entry in a lesson. */
export interface VocabularyItem {
  id: string;
  word: string;
  ipa?: string;
  partOfSpeech?: string;
  translations: LocalizedText;
  example: {
    english: string;
    translations: LocalizedText;
    audio?: AudioRef;
  };
  audio?: AudioRef;
  /** Visual: an emoji or short symbol used as a lightweight placeholder. */
  emoji?: string;
  /** Optional image path (relative). */
  image?: string;
}

/** A standalone example sentence with translation + audio. */
export interface ExampleSentence {
  id: string;
  english: string;
  translations: LocalizedText;
  audio?: AudioRef;
}

/** Grammar explanation block, fully localized. */
export interface GrammarNote {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
  examples?: ExampleSentence[];
}

/** A study flashcard — may reference a vocab item or be standalone. */
export interface Flashcard {
  id: string;
  front: LocalizedText;
  /** The English target (word/phrase/sentence). */
  back: string;
  audio?: AudioRef;
  image?: string;
  /** Optional link back to a vocabulary item. */
  vocabId?: string;
}

/**
 * Discriminated union of all practice question types.
 * Every question has a stable `id` and a `kind` discriminator.
 */
export type Question =
  | MultipleChoiceQuestion
  | SelectImageQuestion
  | TranslatePromptQuestion
  | TranslateChoiceQuestion
  | TypeWhatYouHearQuestion
  | ListenAndChooseQuestion
  | WordOrderQuestion
  | FillBlankQuestion
  | MatchPairsQuestion
  | TrueFalseQuestion
  | TapToBuildQuestion;

interface QuestionBase {
  id: string;
  /** Instruction shown above the question, localized. */
  prompt: LocalizedText;
  /** Audio played when the question appears, if any. */
  promptAudio?: AudioRef;
  /** Stable reference to the vocabulary item this question exercises, if any. */
  vocabId?: string;
  /** Approximate difficulty 1..5 used for ordering/XP weighting. */
  difficulty?: number;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  kind: 'multiple-choice';
  /** The English prompt text (word/sentence) the learner must interpret. */
  stem: string;
  stemAudio?: AudioRef;
  options: string[];
  /** Index into options. */
  answer: number;
}

export interface SelectImageQuestion extends QuestionBase {
  kind: 'select-image';
  stem: string;
  stemAudio?: AudioRef;
  /** Each option references an image path + a label. */
  options: { id: string; image: string; label: string }[];
  /** id of the correct option. */
  answer: string;
}

export interface TranslatePromptQuestion extends QuestionBase {
  kind: 'translate-prompt';
  /** Source text in the learner's language to translate INTO English. */
  source: LocalizedText;
  /** Accepted English answers (allow minor casing/punctuation tolerance). */
  answers: string[];
  /** Optional bank of word tokens for tap-to-build fallback. */
  wordBank?: string[];
}

export interface TranslateChoiceQuestion extends QuestionBase {
  kind: 'translate-choice';
  source: LocalizedText;
  /** English options to choose the correct translation from. */
  options: string[];
  answer: number;
}

export interface TypeWhatYouHearQuestion extends QuestionBase {
  kind: 'type-what-you-hear';
  audio: AudioRef;
  /** Accepted English transcriptions. */
  answers: string[];
}

export interface ListenAndChooseQuestion extends QuestionBase {
  kind: 'listen-and-choose';
  audio: AudioRef;
  options: string[];
  answer: number;
}

export interface WordOrderQuestion extends QuestionBase {
  kind: 'word-order';
  /** Tokens in correct order. */
  tokens: string[];
  /** Shuffled tokens presented to the learner (precomputed by author). */
  shuffled: string[];
}

export interface FillBlankQuestion extends QuestionBase {
  kind: 'fill-blank';
  /** Sentence with `___` placeholder(s) for the blank. */
  sentence: string;
  /** Accepted fill-in answers. */
  answers: string[];
  options?: string[];
}

export interface MatchPairsQuestion extends QuestionBase {
  kind: 'match-pairs';
  pairs: { left: string; right: string }[];
}

export interface TrueFalseQuestion extends QuestionBase {
  kind: 'true-false';
  statement: string;
  statementAudio?: AudioRef;
  /** Whether the statement is true. */
  isTrue: boolean;
}

export interface TapToBuildQuestion extends QuestionBase {
  kind: 'tap-to-build';
  /** Target English sentence. */
  target: string;
  /** Tokens including distractors, shuffled. */
  bank: string[];
}

/** A lesson's practice sequence — the "Main experience". */
export interface PracticeSequence {
  /** Ordered list of questions across the 28-question system. */
  questions: Question[];
}

/** A complete lesson content document. */
export interface LessonContent {
  /** Schema version of this content file, e.g. "1.0.0". */
  $schema: string;
  id: string;
  /** Display title localized. */
  title: LocalizedText;
  subtitle?: LocalizedText;
  /** Stable topic id this lesson belongs to. */
  topicId: string;
  /** 1-based index within the topic (must be 1..3). */
  orderInTopic: 1 | 2 | 3;
  vocabulary: VocabularyItem[];
  sentences?: ExampleSentence[];
  grammar?: GrammarNote[];
  flashcards: Flashcard[];
  practice: PracticeSequence;
}

/** A topic groups exactly 3 lessons. */
export interface Topic {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  /** lesson ids in order 1..3. */
  lessonIds: [string, string, string];
  /** stable unit id. */
  unitId: string;
}

/** A unit groups a configurable number of topics. */
export interface Unit {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  topicIds: string[];
  /** 1-based order within the course. */
  order: number;
}

/** A course groups units. */
export interface Course {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  /** Target language being learned — always "en" for this app. */
  targetLanguage: 'en';
  /** Default learner interface language. */
  defaultInterfaceLanguage: string;
  unitIds: string[];
}

/** The full registry snapshot returned by the content service. */
export interface ContentRegistry {
  course: Course;
  units: Unit[];
  topics: Topic[];
  lessons: Record<string, LessonContent>;
  /** Validation issues detected at load time (never fatal — surfaced in UI). */
  issues: ContentIssue[];
}

export type IssueSeverity = 'error' | 'warning';

export interface ContentIssue {
  severity: IssueSeverity;
  code:
    | 'duplicate-id'
    | 'invalid-question-type'
    | 'missing-audio'
    | 'missing-image'
    | 'schema-mismatch'
    | 'orphaned-lesson'
    | 'topic-lesson-count';
  message: string;
  /** File or entity id the issue pertains to. */
  source: string;
}
