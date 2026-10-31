import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { Lock, Check, Star } from 'lucide-react';
import type { LessonStatus } from '@/state/progression';

/**
 * Winding learning path: a vertical trail of lessons grouped by unit/topic.
 * Each node's state (locked/unlocked/completed) comes from the progression model.
 */
export function LearningPathScreen() {
  const { t, lt } = useI18n();
  const { statusOf } = useProgress();
  const registry = loadRegistry();

  return (
    <div>
      <PageHeader title={t('path.title')} />
      <div className="space-y-10">
        {registry.units.map((unit) => (
          <section key={unit.id}>
            <div className="card p-4 mb-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">
                {t('path.unit')} {unit.order}
              </p>
              <h2 className="font-display text-lg font-extrabold">{lt(unit.title)}</h2>
              <p className="text-sm text-primary-100 mt-0.5">{lt(unit.description)}</p>
            </div>

            {unit.topicIds.map((topicId) => {
              const topic = registry.topics.find((tp) => tp.id === topicId);
              if (!topic) return null;
              return (
                <div key={topicId} className="mb-6">
                  <h3 className="font-semibold text-neutral-700 mb-3 px-2">{lt(topic.title)}</h3>
                  <PathTopic topicId={topicId} statuses={topic.lessonIds.map((id) => ({ id, status: statusOf(id) }))} />
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

function PathTopic({
  topicId,
  statuses,
}: {
  topicId: string;
  statuses: { id: string; status: LessonStatus }[];
}) {
  const { lt } = useI18n();
  const registry = loadRegistry();

  return (
    <div className="relative flex flex-col items-center gap-3">
      {statuses.map((s, i) => {
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
            onClick={() => navigate({ name: 'lesson', lessonId: s.id })}
          />
        );
      })}
    </div>
  );
}

function PathNode({
  status,
  index,
  align,
  label,
  emoji,
  onClick,
}: {
  status: LessonStatus;
  index: number;
  align: string;
  label: string;
  emoji?: string;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const locked = status === 'locked';
  const done = status === 'completed';

  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`group relative w-44 ${align} ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* connecting line */}
      {index > 0 && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-neutral-200 rounded-full" />
      )}
      <div
        className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
          locked
            ? 'bg-neutral-50 border-neutral-200 opacity-60'
            : done
            ? 'bg-primary-50 border-primary-300'
            : 'bg-white border-primary-400 shadow-card group-hover:shadow-pop group-active:scale-95'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full grid place-items-center text-xl shrink-0 ${
            locked
              ? 'bg-neutral-200'
              : done
              ? 'bg-primary-600 text-white'
              : 'bg-primary-100 text-primary-700'
          }`}
        >
          {locked ? (
            <Lock className="w-5 h-5 text-neutral-400" />
          ) : done ? (
            <Check className="w-6 h-6" />
          ) : (
            <span>{emoji ?? '📘'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0 text-start">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase">{t('path.lesson')} {index + 1}</p>
          <p className={`font-bold text-sm truncate ${locked ? 'text-neutral-400' : 'text-neutral-800'}`}>{label}</p>
        </div>
        {done && <Star className="w-4 h-4 text-accent-400 fill-accent-400 shrink-0" />}
      </div>
    </button>
  );
}
