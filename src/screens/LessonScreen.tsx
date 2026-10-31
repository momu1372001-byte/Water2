import { useI18n } from '@/i18n/I18nContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { Gamepad2, Layers, ListChecks, BookOpen } from 'lucide-react';

/**
 * Lesson selection: the learner chooses between Practice (main game) and
 * Study (flashcards). Both consume the same lesson JSON data.
 */
export function LessonScreen({ lessonId }: { lessonId: string }) {
  const { t, lt } = useI18n();
  const registry = loadRegistry();
  const lesson = registry.lessons[lessonId];

  if (!lesson) {
    return <div className="p-6 text-center text-neutral-500">{t('common.error')}</div>;
  }

  return (
    <div>
      <PageHeader title={lt(lesson.title)} subtitle={lt(lesson.subtitle)} backTo={{ name: 'topic', topicId: lesson.topicId }} />

      {/* Vocabulary preview */}
      {lesson.vocabulary.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-600" /> {t('lesson.study')}
          </h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {lesson.vocabulary.map((v) => (
              <div key={v.id} className="card px-3 py-2 flex items-center gap-2 shrink-0">
                <span className="text-xl">{v.emoji ?? '🔤'}</span>
                <div>
                  <p className="font-bold text-sm text-neutral-900">{v.word}</p>
                  <p className="text-xs text-neutral-500">{lt(v.translations)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two modes */}
      <div className="space-y-3">
        <ModeCard
          icon={<Gamepad2 className="w-7 h-7" />}
          color="primary"
          title={t('lesson.practice')}
          subtitle={`${lesson.practice.questions.length} ${t('lesson.questions')}`}
          onClick={() => navigate({ name: 'practice', lessonId })}
        />
        <ModeCard
          icon={<Layers className="w-7 h-7" />}
          color="info"
          title={t('lesson.study')}
          subtitle={`${lesson.flashcards.length} ${t('lesson.study')}`}
          onClick={() => navigate({ name: 'study', lessonId })}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="card p-3 text-center">
          <ListChecks className="w-5 h-5 text-primary-600 mx-auto mb-1" />
          <p className="text-xs text-neutral-500">{lesson.practice.questions.length}</p>
          <p className="text-[11px] text-neutral-400">{t('lesson.questions')}</p>
        </div>
        <div className="card p-3 text-center">
          <BookOpen className="w-5 h-5 text-info-500 mx-auto mb-1" />
          <p className="text-xs text-neutral-900 font-bold">{lesson.vocabulary.length}</p>
          <p className="text-[11px] text-neutral-400">vocabulary</p>
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  subtitle,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: 'primary' | 'info';
  onClick: () => void;
}) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-700',
    info: 'bg-info-100 text-info-600',
  };
  return (
    <button
      onClick={onClick}
      className="card w-full p-5 flex items-center gap-4 text-start hover:shadow-pop hover:-translate-y-0.5 transition-all active:scale-[0.98]"
    >
      <div className={`w-16 h-16 rounded-2xl grid place-items-center shrink-0 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-lg text-neutral-900">{title}</p>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>
    </button>
  );
}
