/**
 * Learning progression model.
 *
 * - Lessons unlock sequentially: a lesson is unlocked when the previous lesson
 *   in the same topic is completed. The first lesson of the first topic is
 *   always unlocked.
 * - A topic is complete when all 3 lessons are completed.
 * - A unit is complete when all its topics are complete.
 * - XP is awarded per completed lesson (base 10 + difficulty bonus per
 *   correct question). Streak increments per day a lesson is completed.
 *
 * Progress is persisted guest-first (localStorage). When the user signs in,
 * the guest progress is merged into their account (see migration.ts).
 */

import type { ContentRegistry } from '@/types/content';

export type LessonStatus = 'locked' | 'unlocked' | 'completed';

export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  /** Best accuracy 0..1 across attempts. */
  bestAccuracy: number;
  /** XP earned from this lesson. */
  xp: number;
  /** ISO date of last attempt. */
  lastAttemptedAt?: string;
  /** Number of attempts. */
  attempts: number;
}

export interface ProgressState {
  /** Map of lessonId -> progress. */
  lessons: Record<string, LessonProgress>;
  /** Total XP. */
  totalXp: number;
  /** Current streak in days. */
  streak: number;
  /** ISO date of last activity (YYYY-MM-DD). */
  lastActiveDate?: string;
  /** Whether this profile is a guest (not yet linked to an account). */
  isGuest: boolean;
  /** User id once signed in, else null. */
  userId: string | null;
}

export function emptyProgress(): ProgressState {
  return { lessons: {}, totalXp: 0, streak: 0, isGuest: true, userId: null };
}

/** Ordered lesson ids across the whole course (unit -> topic -> 3 lessons). */
export function orderedLessonIds(registry: ContentRegistry): string[] {
  const ids: string[] = [];
  for (const unit of registry.units) {
    for (const topicId of unit.topicIds) {
      const topic = registry.topics.find((t) => t.id === topicId);
      if (!topic) continue;
      ids.push(...topic.lessonIds);
    }
  }
  return ids;
}

/** Returns the lesson status, deriving locked/unlocked from sequence. */
export function getLessonStatus(
  lessonId: string,
  progress: ProgressState,
  registry: ContentRegistry,
): LessonStatus {
  const lp = progress.lessons[lessonId];
  if (lp?.status === 'completed') return 'completed';
  const ordered = orderedLessonIds(registry);
  const idx = ordered.indexOf(lessonId);
  if (idx <= 0) return 'unlocked'; // first lesson always unlocked
  const prevId = ordered[idx - 1];
  const prev = progress.lessons[prevId];
  return prev?.status === 'completed' ? 'unlocked' : 'locked';
}

export interface LessonResult {
  lessonId: string;
  correct: number;
  total: number;
  xpEarned: number;
}

/** Apply a completed-lesson result to progress, returning a new state. */
export function applyLessonResult(
  prev: ProgressState,
  result: LessonResult,
  now: Date = new Date(),
): ProgressState {
  const accuracy = result.total > 0 ? result.correct / result.total : 0;
  const existing = prev.lessons[result.lessonId];
  const lessons: Record<string, LessonProgress> = {
    ...prev.lessons,
    [result.lessonId]: {
      lessonId: result.lessonId,
      status: 'completed',
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
      xp: Math.max(existing?.xp ?? 0, result.xpEarned),
      lastAttemptedAt: now.toISOString(),
      attempts: (existing?.attempts ?? 0) + 1,
    },
  };

  const today = now.toISOString().slice(0, 10);
  let streak = prev.streak;
  let lastActiveDate = prev.lastActiveDate;
  if (lastActiveDate !== today) {
    const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
    if (lastActiveDate === yesterday) streak += 1;
    else streak = 1;
    lastActiveDate = today;
  }

  // Recompute total XP from lessons (idempotent).
  const totalXp = Object.values(lessons).reduce((sum, l) => sum + l.xp, 0);

  return { ...prev, lessons, totalXp, streak, lastActiveDate };
}
