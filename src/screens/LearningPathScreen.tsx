import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { SceneBackground } from '@/components/SceneBackground';
import { Lock, Check, Star, Play, BookOpen, ChevronRight } from 'lucide-react';
import type { LessonStatus } from '@/state/progression';

export function LearningPathScreen() {
  const { t, lt } = useI18n();
  const { statusOf } = useProgress();
  const registry = loadRegistry();

  return (
    <SceneBackground>
      <div>
        <PageHeader title={t('path.title')} backTo={{ name: 'home' }} />
        <div className="space-y-10">
          {registry.units.map((unit) => {
            const unitLessonIds = unit.topicIds.flatMap((tid) => {
              const topic = registry.topics.find((tp) => tp.id === tid);
              return topic?.lessonIds ?? [];
            });
            const unitCompleted = unitLessonIds.filter((id) => statusOf(id) === 'completed').length;
            const unitPct = unitLessonIds.length > 0 ? Math.round((unitCompleted / unitLessonIds.length) * 100) : 0;

            return (
              <section key={unit.id}>
                {/* Unit banner */}
                <div className="relative card p-5 mb-6 bg-gradient-to-br from-primary-600 to-primary-800 border-0 text-white overflow-hidden">
                  <div className="absolute -top-4 -end-4 w-24 h-24 rounded-full bg-white/10" />
                  <div className="absolute -bottom-6 -start-2 w-16 h-16 rounded-full bg-white/5" />
                  <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">
                      {t('path.unit')} {unit.order}
                    </p>
                    <h2 className="font-display text-lg font-extrabold mt-1">{lt(unit.title)}</h2>
                    {lt(unit.description) && <p className="text-sm text-primary-100 mt-0.5">{lt(unit.description)}</p>}
                    {/* Unit progress */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 h-2 rounded-full bg-primary-900/40 overflow-hidden">
                        <div className="h-full rounded-full bg-accent-400 transition-all duration-500" style={{ width: `${unitPct}%` }} />
                      </div>
                      <span className="text-xs font-bold tabular-nums">{unitCompleted}/{unitLessonIds.length}</span>
                    </div>
                  </div>
                </div>

                {/* Topics with winding path */}
                {unit.topicIds.map((topicId) => {
                  const topic = registry.topics.find((tp) => tp.id === topicId);
                  if (!topic) return null;
                  const topicLessonStatuses = topic.lessonIds.map((id) => ({
                    id,
                    status: statusOf(id) as LessonStatus,
                  }));
                  const topicCompleted = topicLessonStatuses.filter((s) => s.status === 'completed').length;
                  const topicPct = Math.round((topicCompleted / 3) * 100);

                  return (
                    <div key={topicId} className="mb-8">
                      {/* Topic header card */}
                      <button
                        onClick={() => navigate({ name: 'topic', topicId })}
                        className="card w-full p-4 flex items-center gap-3 mb-5 hover:shadow-pop transition-all active:scale-[0.98] text-start"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-100 to-accent-200 grid place-items-center shrink-0">
                          <BookOpen className="w-6 h-6 text-accent-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-neutral-900 truncate">{lt(topic.title)}</p>
                          <p className="text-xs text-neutral-500">{t('path.lessonsCount')}: 3</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-primary-600">{topicPct}%</span>
                          <ChevronRight className="w-4 h-4 text-neutral-300" />
                        </div>
                      </button>

                      {/* Winding lesson path */}
                      <div className="relative flex flex-col items-center gap-4 py-2">
                        {/* SVG connecting path */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                          <path
                            d="M50% 0 Q 20% 25%, 50% 50% T 50% 100%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-neutral-200 path-connector"
                          />
                        </svg>

                        {topicLessonStatuses.map((s, i) => {
                          const lesson = registry.lessons[s.id];
                          if (!lesson) return null;
                          const zigzag = i % 2 === 0 ? 'self-start' : 'self-end';
                          return (
                            <PathNode
                              key={s.id}
                              status={s.status}
                              index={i}
                              align={zigzag}
                              label={lt(lesson.title)}
                              emoji={lesson.vocabulary[0]?.emoji}
                              questionCount={lesson.practice.questions.length}
                              onClick={() => navigate({ name: 'lesson', lessonId: s.id })}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Unit exam */}
                {unitCompleted === unitLessonIds.length && unitLessonIds.length > 0 && (
                  <button
                    onClick={() => navigate({ name: 'exam', unitId: unit.id })}
                    className="card w-full p-4 flex items-center gap-3 mb-6 bg-gradient-to-r from-accent-400 to-accent-500 border-0 text-white hover:shadow-pop transition-all active:scale-[0.98]"
                  >
                    <Star className="w-6 h-6 text-white fill-white/50" />
                    <div className="flex-1 text-start">
                      <p className="font-bold">{t('path.unit')} {unit.order} — {t('topic.review')}</p>
                      <p className="text-sm text-white/80">{t('path.done')}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </SceneBackground>
  );
}

function PathNode({
  status,
  index,
  align,
  label,
  emoji,
  questionCount,
  onClick,
}: {
  status: LessonStatus;
  index: number;
  align: string;
  label: string;
  emoji?: string;
  questionCount: number;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const locked = status === 'locked';
  const done = status === 'completed';
  const isCurrent = status === 'unlocked';

  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`group relative w-44 ${align} ${locked ? 'cursor-not-allowed' : 'cursor-pointer'} z-10`}
    >
      {/* Pulse ring for current lesson */}
      {isCurrent && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-primary-300/40 animate-pulse-ring" />
        </div>
      )}

      <div
        className={`relative flex items-center gap-3 p-3 rounded-3xl border-2 transition-all ${
          locked
            ? 'bg-neutral-50 border-neutral-200 opacity-50'
            : done
            ? 'bg-primary-50 border-primary-300 shadow-path-node'
            : 'bg-white border-primary-400 shadow-path-node-active group-hover:shadow-pop group-active:scale-95'
        }`}
      >
        <div
          className={`relative w-12 h-12 rounded-full grid place-items-center text-xl shrink-0 transition-all ${
            locked
              ? 'bg-neutral-200'
              : done
              ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
              : 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700'
          }`}
        >
          {locked ? (
            <Lock className="w-5 h-5 text-neutral-400" />
          ) : done ? (
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          ) : (
            <span>{emoji ?? '📘'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0 text-start">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase">
            {t('path.lesson')} {index + 1}
          </p>
          <p className={`font-bold text-sm truncate ${locked ? 'text-neutral-400' : 'text-neutral-800'}`}>{label}</p>
          {!locked && (
            <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
              <Play className="w-2.5 h-2.5" />
              {questionCount} {t('lesson.questions')}
            </p>
          )}
        </div>
        {done && <Star className="w-5 h-5 text-accent-400 fill-accent-400 shrink-0 animate-coin-bounce" />}
      </div>
    </button>
  );
}
