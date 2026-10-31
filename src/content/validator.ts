import type {
  ContentIssue,
  LessonContent,
  Question,
} from '@/types/content';

export const SCHEMA_VERSION = '1.0.0';

const VALID_KINDS = new Set<Question['kind']>([
  'instructional-card',
  'image-choice',
  'word-choice',
  'sentence-choice',
  'fill-blank-choice',
  'speaking',
  'spelling',
  'multiple-choice',
  'select-image',
  'translate-prompt',
  'translate-choice',
  'type-what-you-hear',
  'listen-and-choose',
  'word-order',
  'fill-blank',
  'match-pairs',
  'true-false',
  'tap-to-build',
]);

const REQUIRED_LOCALIZED = ['ar'] as const;

function hasLocalized(t: unknown): t is Record<string, string> {
  if (!t || typeof t !== 'object') return false;
  const rec = t as Record<string, string>;
  return REQUIRED_LOCALIZED.every((k) => typeof rec[k] === 'string' && rec[k].length > 0);
}

function isString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function isAudioRef(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false;
  const a = v as Record<string, unknown>;
  return typeof a.src === 'string';
}

/** Validate a single question object; returns the typed question or null + issues. */
function validateQuestion(
  raw: unknown,
  source: string,
  issues: ContentIssue[],
): Question | null {
  if (!raw || typeof raw !== 'object') {
    issues.push({ severity: 'error', code: 'schema-mismatch', message: 'Question is not an object', source });
    return null;
  }
  const q = raw as Record<string, unknown>;
  if (!isString(q.id)) {
    issues.push({ severity: 'error', code: 'schema-mismatch', message: 'Question missing id', source });
    return null;
  }
  if (!isString(q.kind) || !VALID_KINDS.has(q.kind as Question['kind'])) {
    issues.push({
      severity: 'error',
      code: 'invalid-question-type',
      message: `Invalid or unknown question kind: ${String(q.kind)}`,
      source: `${source}#${q.id}`,
    });
    return null;
  }
  if (!hasLocalized(q.prompt)) {
    issues.push({
      severity: 'error',
      code: 'schema-mismatch',
      message: `Question ${q.id} missing prompt translation (ar)`,
      source,
    });
    return null;
  }
  // Per-kind sanity checks (structural; full type is asserted on cast).
  switch (q.kind as Question['kind']) {
    case 'instructional-card':
      if (!isString(q.englishText) || !hasLocalized(q.translation)) {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (instructional-card) needs englishText + translation`, source });
        return null;
      }
      break;
    case 'image-choice':
      if (!isString(q.stem) || !Array.isArray(q.options) || typeof q.answer !== 'string') {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (image-choice) needs stem + options[] + answer:string`, source });
        return null;
      }
      break;
    case 'word-choice':
    case 'sentence-choice':
    case 'fill-blank-choice':
      if (!Array.isArray(q.options) || typeof q.answer !== 'number') {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (${q.kind}) needs options[] + answer:number`, source });
        return null;
      }
      break;
    case 'speaking':
      if (!isString(q.englishText) || !hasLocalized(q.translation)) {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (speaking) needs englishText + translation`, source });
        return null;
      }
      break;
    case 'spelling':
      if (!Array.isArray(q.answers)) {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (spelling) needs answers[]`, source });
        return null;
      }
      break;
    case 'multiple-choice':
    case 'translate-choice':
    case 'listen-and-choose': {
      if (!Array.isArray(q.options) || typeof q.answer !== 'number') {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (${q.kind}) needs options[] + answer:number`, source });
        return null;
      }
      break;
    }
    case 'select-image': {
      if (!Array.isArray(q.options) || typeof q.answer !== 'string') {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (select-image) needs options[] + answer:string`, source });
        return null;
      }
      break;
    }
    case 'translate-prompt':
    case 'type-what-you-hear':
    case 'fill-blank': {
      if (!Array.isArray(q.answers)) {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (${q.kind}) needs answers[]`, source });
        return null;
      }
      break;
    }
    case 'word-order': {
      if (!Array.isArray(q.tokens)) {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (word-order) needs tokens[]`, source });
        return null;
      }
      break;
    }
    case 'match-pairs': {
      if (!Array.isArray(q.pairs)) {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (match-pairs) needs pairs[]`, source });
        return null;
      }
      break;
    }
    case 'true-false': {
      if (typeof q.isTrue !== 'boolean') {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (true-false) needs isTrue:boolean`, source });
        return null;
      }
      break;
    }
    case 'tap-to-build': {
      if (!Array.isArray(q.bank)) {
        issues.push({ severity: 'error', code: 'schema-mismatch', message: `Question ${q.id} (tap-to-build) needs bank[]`, source });
        return null;
      }
      break;
    }
  }
  // Grammar notes + feedback validation (optional, present on all kinds).
  if (q.grammarNotes !== undefined && !hasLocalized(q.grammarNotes)) {
    issues.push({ severity: 'warning', code: 'schema-mismatch', message: `Question ${q.id} has grammarNotes but missing required locale (ar)`, source: `${source}#${q.id}` });
  }
  if (q.feedback !== undefined) {
    const f = q.feedback as Record<string, unknown>;
    if (!hasLocalized(f.explanation)) {
      issues.push({ severity: 'warning', code: 'schema-mismatch', message: `Question ${q.id} feedback.explanation missing required locale (ar)`, source: `${source}#${q.id}` });
    }
    if (f.commonMistake !== undefined && !hasLocalized(f.commonMistake)) {
      issues.push({ severity: 'warning', code: 'schema-mismatch', message: `Question ${q.id} feedback.commonMistake missing required locale (ar)`, source: `${source}#${q.id}` });
    }
  }
  return q as unknown as Question;
}

/**
 * Validate a raw lesson JSON object. Returns the typed content or null.
 * Accumulates non-fatal issues (missing assets) into the issues array.
 */
export function validateLesson(
  raw: unknown,
  source: string,
  issues: ContentIssue[],
): LessonContent | null {
  if (!raw || typeof raw !== 'object') {
    issues.push({ severity: 'error', code: 'schema-mismatch', message: 'Lesson JSON is not an object', source });
    return null;
  }
  const c = raw as Record<string, unknown>;
  const fatal: string[] = [];
  if (!isString(c.$schema)) fatal.push('$schema');
  if (!isString(c.id)) fatal.push('id');
  if (!hasLocalized(c.title)) fatal.push('title');
  if (!isString(c.topicId)) fatal.push('topicId');
  if (c.orderInTopic !== 1 && c.orderInTopic !== 2 && c.orderInTopic !== 3) fatal.push('orderInTopic (must be 1,2,3)');
  if (!Array.isArray(c.vocabulary)) fatal.push('vocabulary[]');
  if (!Array.isArray(c.flashcards)) fatal.push('flashcards[]');
  if (!c.practice || typeof c.practice !== 'object' || !Array.isArray((c.practice as Record<string, unknown>).questions)) {
    fatal.push('practice.questions[]');
  }
  if (fatal.length > 0) {
    issues.push({
      severity: 'error',
      code: 'schema-mismatch',
      message: `Lesson missing/invalid fields: ${fatal.join(', ')}`,
      source,
    });
    return null;
  }

  // Validate vocabulary.
  const vocab = c.vocabulary as Record<string, unknown>[];
  for (const v of vocab) {
    if (!isString(v.id) || !isString(v.word) || !hasLocalized(v.translations)) {
      issues.push({ severity: 'error', code: 'schema-mismatch', message: 'Vocabulary item missing id/word/translations', source });
      return null;
    }
    if (v.audio && !isAudioRef(v.audio)) {
      issues.push({ severity: 'warning', code: 'missing-audio', message: `Vocab ${v.id} audio has no src`, source });
    }
    if (v.image && !isString(v.image)) {
      issues.push({ severity: 'warning', code: 'missing-image', message: `Vocab ${v.id} image is invalid`, source });
    }
  }

  // Validate questions.
  const practice = c.practice as { questions: unknown[] };
  const questions: Question[] = [];
  for (const qraw of practice.questions) {
    const q = validateQuestion(qraw, source, issues);
    if (q) questions.push(q);
  }

  const lesson: LessonContent = {
    $schema: c.$schema as string,
    id: c.id as string,
    title: c.title as Record<string, string>,
    subtitle: c.subtitle as Record<string, string> | undefined,
    topicId: c.topicId as string,
    orderInTopic: c.orderInTopic as 1 | 2 | 3,
    vocabulary: vocab as unknown as LessonContent['vocabulary'],
    sentences: c.sentences as LessonContent['sentences'] | undefined,
    grammar: c.grammar as LessonContent['grammar'] | undefined,
    flashcards: c.flashcards as LessonContent['flashcards'],
    practice: { questions },
  };
  return lesson;
}
