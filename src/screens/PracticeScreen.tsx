import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { QuestionRenderer } from '@/components/QuestionRenderer';
import { Heart, Star, ChevronRight } from 'lucide-react';

const MAX_HEARTS = 5;

export function PracticeScreen({ lessonId }: { lessonId: string }) {
  const { t, lt, dir } = useI18n();
  const registry = loadRegistry();
  const { recordLesson } = useProgress();
  const lesson = registry.lessons[lessonId];

  const questions = useMemo(() => lesson?.practice.questions ?? [], [lesson]);
  const [current, setCurrent] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [finished, setFinished] = useState(false);

  if (!lesson) {
    return <div className="p-6 text-center text-neutral-500">{t('common.error')}</div>;
  }

  if (questions.length === 0) {
    return <div className="p-6 text-center text-neutral-500">No questions.</div>;
  }

  const question = questions[current];
  const progressPct = (current / questions.length) * 100;

  const handleAnswer = (result: { correct: boolean }) => {
    setShowFeedback(true);
    setLastCorrect(result.correct);
    if (result.correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (current + 1 >= questions.length || hearts - (lastCorrect ? 0 : 1) <= 0 && !lastCorrect) {
      // finished or out of hearts
      finishLesson();
      return;
    }
    setCurrent((c) => c + 1);
  };

  const finishLesson = () => {
    const xpEarned = correctCount * 10 + (correctCount === questions.length ? 20 : 0);
    recordLesson({ lessonId, correct: correctCount, total: questions.length, xpEarned });
    setFinished(true);
  };

  if (finished) {
    return <CompletionScreen correct={correctCount} total={questions.length} lessonId={lessonId} />;
  }

  if (hearts === 0) {
    return <OutOfHeartsScreen lessonId={lessonId} />;
  }

  const NextIcon = dir === 'rtl' ? ChevronRight : ChevronRight;

  return (
    <div className="min-h-screen flex flex-col" style={{ minHeight: '100dvh' }}>
      {/* Top bar: progress + hearts */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-30rem mx-auto px-4 py-3" style={{ maxWidth: '30rem' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ name: 'lesson', lessonId })}
              className="text-neutral-400 hover:text-neutral-700 text-xl leading-none shrink-0"
            >
              ✕
            </button>
            <div className="flex-1 h-2.5 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Heart className="w-4 h-4 text-error-500 fill-error-500" />
              <span className="text-sm font-bold tabular-nums text-neutral-700">{hearts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-6 max-w-30rem mx-auto w-full" style={{ maxWidth: '30rem' }}>
        <QuestionRenderer key={question.id} question={question} onAnswer={handleAnswer} />
      </div>

      {/* Feedback bar */}
      {showFeedback && (
        <div className="sticky bottom-0 z-20 animate-float-up">
          <div
            className={`px-4 py-4 ${lastCorrect ? 'bg-primary-50 border-t-2 border-primary-200' : 'bg-error-50 border-t-2 border-error-200'}`}
          >
            <div className="max-w-30rem mx-auto flex items-center justify-between" style={{ maxWidth: '30rem' }}>
              <div className="flex items-center gap-2">
                {lastCorrect ? (
                  <>
                    <Star className="w-6 h-6 text-accent-400 fill-accent-400 animate-pop-in" />
                    <span className="font-bold text-primary-700">{t('practice.correct')}</span>
                  </>
                ) : (
                  <span className="font-bold text-error-600">{t('practice.incorrect')}</span>
                )}
              </div>
              <button
                onClick={handleNext}
                className="btn-primary"
              >
                {current + 1 >= questions.length ? t('practice.finish') : t('practice.next')}
                <NextIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompletionScreen({ correct, total, lessonId }: { correct: number; total: number; lessonId: string }) {
  const { t, lt } = useI18n();
  const registry = loadRegistry();
  const lesson = registry.lessons[lessonId];
  const xp = correct * 10 + (correct === total ? 20 : 0);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="app-shell items-center justify-center">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
        <div className="text-6xl mb-4 animate-pop-in">🏆</div>
        <h1 className="font-display text-2xl font-extrabold text-neutral-900 mb-2">{t('lesson.complete')}</h1>
        {lesson && <p className="text-neutral-500 mb-8">{lt(lesson.title)}</p>}

        <div className="grid grid-cols-3 gap-3 w-full mb-8">
          <ResultCard icon={<Star className="w-6 h-6 text-accent-400 fill-accent-400" />} value={xp} label={t('home.xp')} />
          <ResultCard icon={<span className="text-2xl">🎯</span>} value={`${pct}%`} label={t('practice.progress')} />
          <ResultCard icon={<span className="text-2xl">✅</span>} value={`${correct}/${total}`} label={t('lesson.questions')} />
        </div>

        <div className="w-full space-y-3">
          <button onClick={() => navigate({ name: 'path' })} className="btn-primary w-full">
            {t('nav.path')}
          </button>
          <button onClick={() => navigate({ name: 'lesson', lessonId })} className="btn-secondary w-full">
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="card p-4 flex flex-col items-center">
      <div className="mb-1">{icon}</div>
      <span className="text-xl font-extrabold tabular-nums">{value}</span>
      <span className="text-[11px] text-neutral-500">{label}</span>
    </div>
  );
}

function OutOfHeartsScreen({ lessonId }: { lessonId: string }) {
  const { t } = useI18n();
  return (
    <div className="app-shell items-center justify-center">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">💔</div>
        <h1 className="font-display text-2xl font-extrabold text-neutral-900 mb-2">{t('practice.incorrect')}</h1>
        <p className="text-neutral-500 mb-8">{t('practice.progress')}</p>
        <div className="w-full space-y-3">
          <button onClick={() => navigate({ name: 'lesson', lessonId })} className="btn-primary w-full">
            {t('common.retry')}
          </button>
          <button onClick={() => navigate({ name: 'study', lessonId })} className="btn-secondary w-full">
            {t('lesson.study')}
          </button>
        </div>
      </div>
    </div>
  );
}
