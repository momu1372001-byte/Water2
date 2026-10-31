import type {
  ContentIssue,
  ContentRegistry,
  Course,
  LessonContent,
  Topic,
  Unit,
} from '@/types/content';
import { SCHEMA_VERSION, validateLesson } from './validator';

/**
 * Automatic content discovery via Vite's `import.meta.glob`.
 *
 * Drop a valid JSON file under `src/content/lessons/*.json` and the lesson is
 * automatically discovered, validated, and registered — no React/TS code
 * changes required.
 *
 * Build-time limitation: Vite's glob is resolved at BUILD time. New JSON files
 * added after a build require a rebuild/dev-restart to be picked up. This is
 * inherent to static bundlers; there is no runtime filesystem in the browser.
 *
 * Course/unit/topic structure lives in `src/content/course.json` (single
 * source of truth). Lessons are linked by stable IDs to their topic.
 */

// Eagerly import all lesson JSON + the course definition as JSON modules.
const lessonModules = import.meta.glob<Record<string, unknown>>('./lessons/*.json', {
  eager: true,
  import: 'default',
});
const courseModule = (
  import.meta.glob<Record<string, unknown>>('./course.json', {
    eager: true,
    import: 'default',
  })
)['./course.json'];

let cached: ContentRegistry | null = null;

export function loadRegistry(): ContentRegistry {
  if (cached) return cached;

  const issues: ContentIssue[] = [];
  const lessons: Record<string, LessonContent> = {};
  const seenIds = new Set<string>();

  // Validate + collect lessons.
  for (const [path, raw] of Object.entries(lessonModules)) {
    const lesson = validateLesson(raw, path, issues);
    if (!lesson) continue;
    if (seenIds.has(lesson.id)) {
      issues.push({
        severity: 'error',
        code: 'duplicate-id',
        message: `Duplicate lesson id "${lesson.id}"`,
        source: path,
      });
      continue;
    }
    seenIds.add(lesson.id);
    if (lesson.$schema !== SCHEMA_VERSION) {
      issues.push({
        severity: 'warning',
        code: 'schema-mismatch',
        message: `Lesson ${lesson.id} schema "${lesson.$schema}" != "${SCHEMA_VERSION}"`,
        source: path,
      });
    }
    lessons[lesson.id] = lesson;
  }

  // Validate course structure.
  const course = courseModule as unknown as Course;
  if (!course || !course.unitIds) {
    throw new Error('course.json is missing or invalid');
  }

  // Collect units + topics from course.json companions.
  const unitModules = import.meta.glob<Record<string, unknown>>('./units/*.json', {
    eager: true,
    import: 'default',
  });
  const topicModules = import.meta.glob<Record<string, unknown>>('./topics/*.json', {
    eager: true,
    import: 'default',
  });

  const units: Unit[] = [];
  const unitSeen = new Set<string>();
  for (const raw of Object.values(unitModules)) {
    const u = raw as unknown as Unit;
    if (!u.id || !u.topicIds) {
      issues.push({ severity: 'error', code: 'schema-mismatch', message: 'Unit missing id/topicIds', source: 'units' });
      continue;
    }
    if (unitSeen.has(u.id)) {
      issues.push({ severity: 'error', code: 'duplicate-id', message: `Duplicate unit id "${u.id}"`, source: 'units' });
      continue;
    }
    unitSeen.add(u.id);
    units.push(u);
  }
  units.sort((a, b) => a.order - b.order);

  const topics: Topic[] = [];
  const topicSeen = new Set<string>();
  for (const raw of Object.values(topicModules)) {
    const t = raw as unknown as Topic;
    if (!t.id || !t.lessonIds || !t.unitId) {
      issues.push({ severity: 'error', code: 'schema-mismatch', message: 'Topic missing id/unitId/lessonIds', source: 'topics' });
      continue;
    }
    if (topicSeen.has(t.id)) {
      issues.push({ severity: 'error', code: 'duplicate-id', message: `Duplicate topic id "${t.id}"`, source: 'topics' });
      continue;
    }
    if (t.lessonIds.length !== 3) {
      issues.push({
        severity: 'error',
        code: 'topic-lesson-count',
        message: `Topic "${t.id}" must have exactly 3 lessons, has ${t.lessonIds.length}`,
        source: 'topics',
      });
    }
    topicSeen.add(t.id);
    topics.push(t);
  }

  // Orphaned lesson check: every lesson must belong to a topic.
  for (const lessonId of Object.keys(lessons)) {
    const owner = topics.find((t) => t.lessonIds.includes(lessonId as never));
    if (!owner) {
      issues.push({
        severity: 'warning',
        code: 'orphaned-lesson',
        message: `Lesson "${lessonId}" is not referenced by any topic`,
        source: lessonId,
      });
    }
  }

  cached = {
    course,
    units,
    topics,
    lessons,
    issues,
  };
  return cached;
}

export function getLesson(id: string): LessonContent | undefined {
  return loadRegistry().lessons[id];
}

export function getTopic(id: string): Topic | undefined {
  return loadRegistry().topics.find((t) => t.id === id);
}

export function getUnit(id: string): Unit | undefined {
  return loadRegistry().units.find((u) => u.id === id);
}
