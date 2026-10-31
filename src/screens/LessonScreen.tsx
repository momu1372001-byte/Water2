import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { SceneBackground } from '@/components/SceneBackground';
import { Mascot } from '@/components/Mascot';
import { Gamepad2, Layers, BookOpen, ListChecks, Clock, Volume2, ChevronRight } from 'lucide-react';

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const { t, lt } = useI18n();
  const { statusOf } = useProgress();
  const registry = loadRegistry();
  const lesson = registry.lessons[lessonId];

  if (!lesson) {
    return <div className="p-6 text-center text-neutral-500">{t('common.error')}</div>;
  }

  const status = statusOf(lessonId);
  const isCompleted = status === 'completed';
  const estimatedMin = Math.ceil(lesson.practice.questions.length * 0.5);
  const vocabCount = lesson.vocabulary.length;
  const cardCount = lesson.flashcards.length;

  return (
    <SceneBackground>
      <div>
        <PageHeader
          title={lt(lesson.title)}
          subtitle={lt(lesson.subtitle)}
          backTo={{ name: 'topic', topicId: lesson.topicId }}
        />

        {/* Mascot encouragement */}
        <div className="mb-6 flex justify-center">
          <Mascot
            mood={isCompleted ? 'celebrate' : 'encourage'}
            messageKey={isCompleted ? 'lesson.complete' : 'lesson.start'}
            size="md"
          />
        </div>

        {/* Lesson stats bar */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <MetaChip icon={<Clock className="w-4 h-4" />} value={`${estimatedMin} ${t('topic.min')}`} />
          <MetaChip icon={<BookOpen className="w-4 h-4" />} value={`${vocabCount} ${t('lesson.vocabCount')}`} />
          <MetaChip icon={<Layers className="w-4 h-4" />} value={`${cardCount} ${t('lesson.cardCount')}`} />
        </div>

        {/* Two modes — Practice (primary, large) */}
        <div className="space-y-4">
          {/* Practice — primary mode */}
          <button
            onClick={() => navigate({ name: 'practice', lessonId })}
            className="card w-full p-6 text-start bg-gradient-to-br from-primary-500 to-primary-700 border-0 text-white hover:shadow-pop transition-all active:scale-[0.98] relative overflow-hidden group"
          >
            <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-white/10 group-hover:scale-110 transition-transform" />
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-white/20 grid place-items-center shrink-0 backdrop-blur-sm">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-100">{t('lesson.practice')}</span>
                  {isCompleted && <span className="chip bg-white/20 text-white text-[10px] font-bold">{t('path.done')}</span>}
                </div>
                <p className="font-display text-xl font-extrabold mt-1">{t('lesson.playLearn')}</p>
                <p className="text-sm text-primary-100 mt-0.5">{lesson.practice.questions.length} {t('lesson.questions')}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Study — secondary mode */}
          <button
            onClick={() => navigate({ name: 'study', lessonId })}
            className="card w-full p-5 text-start hover:shadow-pop transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-info-100 grid place-items-center shrink-0">
                <Layers className="w-7 h-7 text-info-600" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-info-500">{t('lesson.study')}</span>
                <p className="font-display text-lg font-extrabold text-neutral-900 mt-0.5">{t('lesson.learnFirst')}</p>
                <p className="text-sm text-neutral-500 mt-0.5">{cardCount} {t('study.cardCount')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
            </div>
          </button>
        </div>

        {/* Vocabulary preview rail */}
        {lesson.vocabulary.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-base font-bold mb-3 flex items-center gap-2 text-neutral-900">
              <BookOpen className="w-4 h-4 text-primary-600" />
              {t('lesson.study')}
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {lesson.vocabulary.map((v) => (
                <div
                  key={v.id}
                  className="card px-4 py-3 flex items-center gap-3 shrink-0 min-w-[160px] hover:shadow-pop transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 grid place-items-center text-xl shrink-0">
                    {v.emoji ?? '🔤'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-neutral-900 truncate">{v.word}</p>
                    <p className="text-xs text-neutral-500 truncate">{lt(v.translations)}</p>
                    {v.ipa && <p className="text-[10px] text-neutral-400 truncate font-mono">{v.ipa}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick stats footer */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="card p-3 flex items-center gap-3">
            <ListChecks className="w-5 h-5 text-primary-600 shrink-0" />
            <div>
              <p className="text-lg font-extrabold text-neutral-900">{lesson.practice.questions.length}</p>
              <p className="text-[11px] text-neutral-400">{t('lesson.questions')}</p>
            </div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-info-500 shrink-0" />
            <div>
              <p className="text-lg font-extrabold text-neutral-900">{vocabCount}</p>
              <p className="text-[11px] text-neutral-400">{t('lesson.vocabCount')}</p>
            </div>
          </div>
        </div>
      </div>
    </SceneBackground>
  );
}

function MetaChip({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
      {icon}
      {value}
    </div>
  );
}
