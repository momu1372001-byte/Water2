import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { SceneBackground } from '@/components/SceneBackground';
import { Lock, Check, Play, Clock, ChevronRight, Star } from 'lucide-react';

export function TopicDetailScreen({ topicId }: { topicId: string }) {
  const { t, lt } = useI18n();
  const { statusOf, progress } = useProgress();
  const registry = loadRegistry();
  const topic = registry.topics.find((tp) => tp.id === topicId);

  if (!topic) {
    return (
      <div className="p-6 text-center text-neutral-500">
        <p>{t('common.error')}</p>
      </div>
    );
  }

  const unit = registry.units.find((u) => u.id === topic.unitId);
  const topicLessonIds = topic.lessonIds;
  const completedCount = topicLessonIds.filter((id) => statusOf(id) === 'completed').length;
  const topicPct = Math.round((completedCount / 3) * 100);

  return (
    <SceneBackground>
      <div>
        <PageHeader title={lt(topic.title)} subtitle={lt(topic.description)} backTo={{ name: 'path' }} />

        {/* Topic hero card */}
        <div className="relative card p-6 mb-6 bg-gradient-to-br from-primary-500 to-primary-700 border-0 text-white overflow-hidden">
          <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -start-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-sm text-primary-100 leading-relaxed">{lt(topic.description)}</p>
            <p className="mt-3 text-xs font-semibold text-primary-100">
              {unit ? lt(unit.title) : ''}
            </p>
            {/* Progress bar */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-2 rounded-full bg-primary-900/30 overflow-hidden">
                <div className="h-full rounded-full bg-accent-400 transition-all duration-500" style={{ width: `${topicPct}%` }} />
              </div>
              <span className="text-xs font-bold tabular-nums">{completedCount}/3</span>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <h2 className="font-display text-lg font-bold mb-3 text-neutral-900">{t('topic.lessons')}</h2>
        <div className="space-y-4">
          {topicLessonIds.map((lessonId, i) => {
            const lesson = registry.lessons[lessonId];
            if (!lesson) return null;
            const status = statusOf(lessonId);
            const locked = status === 'locked';
            const done = status === 'completed';
            const lessonProgress = progress.lessons[lessonId];
            const accuracy = lessonProgress?.bestAccuracy;
            const estimatedMin = Math.ceil(lesson.practice.questions.length * 0.5);

            return (
              <button
                key={lessonId}
                disabled={locked}
                onClick={() => navigate({ name: 'lesson', lessonId })}
                className={`card w-full p-4 text-start transition-all ${
                  locked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-pop hover:-translate-y-0.5 active:scale-[0.98]'
                } ${done ? 'border-primary-200 bg-primary-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Lesson number / icon */}
                  <div
                    className={`relative w-14 h-14 rounded-2xl grid place-items-center shrink-0 ${
                      locked
                        ? 'bg-neutral-100'
                        : done
                        ? 'bg-gradient-to-br from-primary-500 to-primary-700'
                        : 'bg-gradient-to-br from-accent-100 to-accent-200'
                    }`}
                  >
                    {locked ? (
                      <Lock className="w-6 h-6 text-neutral-400" />
                    ) : done ? (
                      <Check className="w-7 h-7 text-white" strokeWidth={3} />
                    ) : (
                      <span className="text-2xl">{lesson.vocabulary[0]?.emoji ?? '📘'}</span>
                    )}
                    {done && (
                      <div className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-accent-400 grid place-items-center">
                        <Star className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Lesson info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase">
                        {t('path.lesson')} {i + 1}
                      </span>
                      {done && accuracy !== undefined && (
                        <span className="text-[11px] text-primary-600 font-semibold">
                          {Math.round(accuracy * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-neutral-900 truncate">{lt(lesson.title)}</p>
                    {lt(lesson.subtitle) && (
                      <p className="text-xs text-neutral-500 truncate mt-0.5">{lt(lesson.subtitle)}</p>
                    )}
                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {estimatedMin} {t('topic.min')}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {lesson.practice.questions.length} {t('lesson.questions')}
                      </span>
                    </div>
                  </div>

                  {/* Action / arrow */}
                  <div className="shrink-0">
                    {locked ? (
                      <span className="text-neutral-300 text-sm font-medium">{t('path.locked')}</span>
                    ) : done ? (
                      <span className="chip bg-primary-100 text-primary-700 text-xs font-bold">
                        {t('path.done')}
                      </span>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-600 grid place-items-center">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </SceneBackground>
  );
}
