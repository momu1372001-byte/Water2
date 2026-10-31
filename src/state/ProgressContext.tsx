import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ContentRegistry } from '@/types/content';
import {
  applyLessonResult,
  emptyProgress,
  getLessonStatus,
  orderedLessonIds,
  type LessonResult,
  type LessonStatus,
  type ProgressState,
} from './progression';
import { loadRegistry } from '@/content/registry';
import { guestStore, saveGuestProgress } from './guestStore';
import { migrateGuestToAccount } from './migration';

interface ProgressContextValue {
  progress: ProgressState;
  recordLesson: (result: LessonResult) => void;
  statusOf: (lessonId: string) => LessonStatus;
  orderedLessons: string[];
  reset: () => void;
  migrate: (userId: string) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const registry = useMemo<ContentRegistry>(() => loadRegistry(), []);
  const [progress, setProgress] = useState<ProgressState>(() => guestStore.load() ?? emptyProgress());

  // Persist to localStorage on every change while in guest mode.
  useEffect(() => {
    if (progress.isGuest) saveGuestProgress(progress);
  }, [progress]);

  const ordered = useMemo(() => orderedLessonIds(registry), [registry]);

  const recordLesson = useCallback((result: LessonResult) => {
    setProgress((prev) => applyLessonResult(prev, result));
  }, []);

  const statusOf = useCallback(
    (lessonId: string) => getLessonStatus(lessonId, progress, registry),
    [progress, registry],
  );

  const reset = useCallback(() => {
    setProgress(emptyProgress());
    guestStore.clear();
  }, []);

  const migrate = useCallback(async (userId: string) => {
    await migrateGuestToAccount(progress, userId);
    setProgress((prev) => ({ ...prev, isGuest: false, userId }));
  }, [progress]);

  const value = useMemo<ProgressContextValue>(
    () => ({ progress, recordLesson, statusOf, orderedLessons: ordered, reset, migrate }),
    [progress, recordLesson, statusOf, ordered, reset, migrate],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
