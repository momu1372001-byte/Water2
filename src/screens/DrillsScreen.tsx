import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { SceneBackground } from '@/components/SceneBackground';
import { Dumbbell, Lock, ChevronRight, Play, RotateCw } from 'lucide-react';
import type { LessonStatus } from '@/state/progression';

export function DrillsScreen() {
  const { t, lt } = useI18n();
  const { statusOf, orderedLessons, progress } = useProgress();
  const registry = loadRegistry();

  // Available lessons: unlocked or completed (can replay)
  const availableLessons = orderedLessons
    .map((id) => ({
      id,
      lesson: registry.lessons[id],
      status: statusOf(id) as LessonStatus,
    }))
    .filter((e) => e.lesson && e.status !== 'locked');

  // Current in-progress lesson (unlocked but not completed)
  const inProgress = availableLessons.find((e) => e.status === 'unlocked');
  const completedLessons = availableLessons.filter((e) => e.status === 'completed');

  return (
    <SceneBackground variant="cool">
      <div>
        <PageHeader title={t('drills.title')} subtitle={t('drills.subtitle')} />

        {availableLessons.length === 0 ? (
          <div className="card p-8 text-center">
            <Lock className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="font-semibold text-neutral-600">{t('drills.noDrills')}</p>
            <p className="text-sm text-neutral-400 mt-1">{t('drills.noDrillsMsg')}</p>
            <button onClick={() => navigate({ name: 'path' })} className="btn-primary mt-4">
              {t('nav.path')}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* In-progress drill */}
            {inProgress && (
              <div>
                <h2 className="font-display text-base font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary-600" />
                  {t('drills.current')}
                </h2>
                <DrillCard
                  lessonId={inProgress.id}
                  title={lt(inProgress.lesson.title)}
                  subtitle={lt(inProgress.lesson.subtitle)}
                  status={inProgress.status}
                  questionCount={inProgress.lesson.practice.questions.length}
                  highlighted
                  actionLabel={t('drills.continue')}
                  onClick={() => navigate({ name: 'practice', lessonId: inProgress.id })}
                />
              </div>
            )}

            {/* Available replays */}
            {completedLessons.length > 0 && (
              <div>
                <h2 className="font-display text-base font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-info-600" />
                  {t('drills.available')}
                </h2>
                <div className="space-y-3">
                  {completedLessons.map((e) => (
                    <DrillCard
                      key={e.id}
                      lessonId={e.id}
                      title={lt(e.lesson.title)}
                      subtitle={lt(e.lesson.subtitle)}
                      status={e.status}
                      questionCount={e.lesson.practice.questions.length}
                      accuracy={progress.lessons[e.id]?.bestAccuracy}
                      actionLabel={t('drills.start')}
                      onClick={() => navigate({ name: 'practice', lessonId: e.id })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SceneBackground>
  );
}

function DrillCard({
  title,
  subtitle,
  status,
  questionCount,
  accuracy,
  highlighted,
  actionLabel,
  onClick,
}: {
  lessonId: string;
  title: string;
  subtitle?: string;
  status: LessonStatus;
  questionCount: number;
  accuracy?: number;
  highlighted?: boolean;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`card w-full p-4 flex items-center gap-4 text-start transition-all hover:shadow-pop hover:-translate-y-0.5 active:scale-[0.98] ${
        highlighted ? 'border-primary-300 bg-primary-50' : ''
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 ${highlighted ? 'bg-primary-600' : 'bg-info-100'}`}>
        {status === 'completed' ? (
          <RotateCw className={`w-5 h-5 ${highlighted ? 'text-white' : 'text-info-600'}`} />
        ) : (
          <Play className={`w-5 h-5 ${highlighted ? 'text-white' : 'text-info-600'}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-neutral-900 truncate">{title}</p>
        {subtitle && <p className="text-xs text-neutral-500 truncate">{subtitle}</p>}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] text-neutral-400">{questionCount}</span>
          {accuracy !== undefined && accuracy > 0 && (
            <span className="text-[11px] text-primary-600 font-semibold">{Math.round(accuracy * 100)}%</span>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
    </button>
  );
}
