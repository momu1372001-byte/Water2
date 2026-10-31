import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { Lock, GraduationCap, Check, Star } from 'lucide-react';

/**
 * Unit exam entry screen. Shows the unit's lessons, and unlocks the exam only
 * when all topics/lessons in the unit are complete. The exam itself runs the
 * practice flow across a sample of questions from all lessons in the unit —
 * planned for a later prompt; for now this is a gating/planning surface.
 */
export function ExamScreen({ unitId }: { unitId: string }) {
  const { t, lt } = useI18n();
  const { statusOf } = useProgress();
  const registry = loadRegistry();
  const unit = registry.units.find((u) => u.id === unitId);

  if (!unit) {
    return <div className="p-6 text-center text-neutral-500">{t('common.error')}</div>;
  }

  const topics = unit.topicIds
    .map((id) => registry.topics.find((tp) => tp.id === id))
    .filter((tp): tp is NonNullable<typeof tp> => Boolean(tp));

  const allLessons = topics.flatMap((tp) => tp.lessonIds);
  const completed = allLessons.filter((id) => statusOf(id) === 'completed');
  const allDone = completed.length === allLessons.length;

  return (
    <div>
      <PageHeader title={lt(unit.title)} subtitle={t('path.unit')} backTo={{ name: 'path' }} />

      <div className={`card p-6 mb-6 text-center ${allDone ? 'bg-gradient-to-br from-accent-400 to-accent-500 text-white border-0' : 'bg-neutral-50'}`}>
        <GraduationCap className={`w-12 h-12 mx-auto mb-3 ${allDone ? 'text-white' : 'text-neutral-300'}`} />
        <p className="font-display text-lg font-bold mb-1">{t('path.unit')} {unit.order}</p>
        <p className={`text-sm ${allDone ? 'text-white/90' : 'text-neutral-500'}`}>
          {completed.length} / {allLessons.length} {t('path.done')}
        </p>
        {allDone && <Star className="w-6 h-6 text-white fill-white mx-auto mt-2 animate-coin-bounce" />}
      </div>

      <div className="space-y-2 mb-6">
        {topics.map((topic) => (
          <div key={topic.id} className="card p-3">
            <p className="font-semibold text-neutral-800 mb-2">{lt(topic.title)}</p>
            <div className="flex gap-1.5">
              {topic.lessonIds.map((lid, i) => {
                const done = statusOf(lid) === 'completed';
                return (
                  <div
                    key={lid}
                    className={`flex-1 h-2 rounded-full ${done ? 'bg-primary-500' : 'bg-neutral-200'}`}
                    title={`${t('path.lesson')} ${i + 1}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {allDone ? (
        <button className="btn-primary w-full text-lg">
          <GraduationCap className="w-5 h-5" />
          {t('topic.start')} {t('path.unit')}
        </button>
      ) : (
        <div className="card p-6 text-center text-neutral-500">
          <Lock className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="font-semibold">{t('path.locked')}</p>
          <p className="text-sm mt-1">{t('topic.lessons')}</p>
          <button onClick={() => navigate({ name: 'path' })} className="btn-secondary mt-4">
            {t('nav.path')}
          </button>
        </div>
      )}
    </div>
  );
}
