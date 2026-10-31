import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { Lock, Check, BookOpen, GraduationCap } from 'lucide-react';

export function TopicDetailScreen({ topicId }: { topicId: string }) {
  const { t, lt } = useI18n();
  const { statusOf } = useProgress();
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

  return (
    <div>
      <PageHeader title={lt(topic.title)} subtitle={lt(topic.description)} backTo={{ name: 'path' }} />
      <div className="card p-5 mb-6 bg-gradient-to-br from-primary-50 to-white border-primary-200">
        <p className="text-sm text-neutral-600 leading-relaxed">{lt(topic.description)}</p>
        <p className="mt-3 text-xs font-semibold text-primary-700">{unit ? lt(unit.title) : ''}</p>
      </div>

      <h2 className="font-display text-lg font-bold mb-3">{t('topic.lessons')}</h2>
      <div className="space-y-3">
        {topic.lessonIds.map((lessonId, i) => {
          const lesson = registry.lessons[lessonId];
          if (!lesson) return null;
          const status = statusOf(lessonId);
          const locked = status === 'locked';
          return (
            <button
              key={lessonId}
              disabled={locked}
              onClick={() => navigate({ name: 'lesson', lessonId })}
              className={`card w-full p-4 flex items-center gap-4 text-start transition-all ${
                locked ? 'opacity-60' : 'hover:shadow-pop hover:-translate-y-0.5'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 text-lg ${
                  locked ? 'bg-neutral-100' : status === 'completed' ? 'bg-primary-600' : 'bg-primary-100'
                }`}
              >
                {locked ? (
                  <Lock className="w-5 h-5 text-neutral-400" />
                ) : status === 'completed' ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <span>{lesson.vocabulary[0]?.emoji ?? '📘'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase">
                  {t('path.lesson')} {i + 1}
                </p>
                <p className="font-bold text-neutral-900 truncate">{lt(lesson.title)}</p>
                <p className="text-xs text-neutral-500">{lesson.practice.questions.length} {t('lesson.questions')}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
