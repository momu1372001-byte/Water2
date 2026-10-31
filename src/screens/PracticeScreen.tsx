import { useState, useMemo, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { QuestionRenderer } from '@/components/QuestionRenderer';
import { Mascot } from '@/components/Mascot';
import { ConfettiBurst, FeedbackOverlay } from '@/components/GameFeedback';
import { Heart, Star, ChevronRight, X, BookOpen } from 'lucide-react';
import { playCorrect, playIncorrect, playComplete } from '@/hooks/useSound';
import type { UiKey } from '@/i18n/keys';

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
  const [showConfetti, setShowConfetti] = useState(false);

  // Sound feedback on answer
  useEffect(() => {
    if (showFeedback) {
      if (lastCorrect) playCorrect();
      else playIncorrect();
    }
  }, [showFeedback, lastCorrect]);

  if (!lesson) {
    return <div className="p-6 text-center text-neutral-500">{t('common.error')}</div>;
  }

  if (questions.length === 0) {
    return <div className="p-6 text-center text-neutral-500">No questions.</div>;
  }

  const question = questions[current];
  const progressPct = (current / questions.length) * 100;

  // Pick a random encouragement message
  const encourageKeys: UiKey[] = ['practice.encourage1', 'practice.encourage2', 'practice.encourage3', 'practice.encourage4'];
  const encourageKey = encourageKeys[current % encourageKeys.length];

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
    const willLoseHeart = !lastCorrect;
    const newHearts = willLoseHeart ? hearts - 1 : hearts;

    if (current + 1 >= questions.length || newHearts <= 0) {
      finishLesson();
      return;
    }
    setShowFeedback(false);
    setCurrent((c) => c + 1);
  };

  const finishLesson = () => {
    const xpEarned = correctCount * 10 + (correctCount === questions.length ? 20 : 0);
    recordLesson({ lessonId, correct: correctCount, total: questions.length, xpEarned });
    setFinished(true);
    playComplete();
    if (correctCount === questions.length) {
      setShowConfetti(true);
    }
  };

  if (finished) {
    return (
      <>
        <ConfettiBurst trigger={showConfetti} />
        <CompletionScreen correct={correctCount} total={questions.length} lessonId={lessonId} />
      </>
    );
  }

  if (hearts === 0) {
    return <OutOfHeartsScreen lessonId={lessonId} />;
  }

  const NextIcon = ChevronRight;

  return (
    <div className="min-h-screen flex flex-col scene-bg" style={{ minHeight: '100dvh' }}>
      <FeedbackOverlay show={showFeedback} correct={lastCorrect} />

      {/* Top bar: progress + hearts */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-30rem mx-auto px-4 py-3" style={{ maxWidth: '30rem' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ name: 'lesson', lessonId })}
              className="text-neutral-400 hover:text-neutral-700 shrink-0 w-8 h-8 grid place-items-center rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 h-2.5 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Heart className={`w-4 h-4 ${hearts > 0 ? 'text-error-500 fill-error-500' : 'text-neutral-300'}`} />
              <span className="text-sm font-bold tabular-nums text-neutral-700">{hearts}</span>
            </div>
          </div>
          {/* Question counter */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] font-semibold text-neutral-400">
              {t('practice.progress')}: {current + 1} / {questions.length}
            </span>
            <span className="text-[11px] font-semibold text-primary-600">
              {correctCount} {t('practice.correct').replace('!', '')}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-6 max-w-30rem mx-auto w-full" style={{ maxWidth: '30rem' }}>
        <div key={question.id} className="animate-slide-in">
          <QuestionRenderer question={question} onAnswer={handleAnswer} />
        </div>
      </div>

      {/* Feedback bar */}
      {showFeedback && (
        <div className="sticky bottom-0 z-20 animate-float-up">
          <div
            className={`px-4 py-5 ${
              lastCorrect
                ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-t-2 border-primary-300'
                : 'bg-gradient-to-r from-error-50 to-error-100 border-t-2 border-error-300'
            }`}
          >
            <div className="max-w-30rem mx-auto flex items-center justify-between" style={{ maxWidth: '30rem' }}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full grid place-items-center ${
                    lastCorrect ? 'bg-primary-600' : 'bg-error-500'
                  } animate-bounce-in`}
                >
                  {lastCorrect ? (
                    <Star className="w-5 h-5 text-white fill-white" />
                  ) : (
                    <X className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className={`font-bold ${lastCorrect ? 'text-primary-700' : 'text-error-600'}`}>
                    {lastCorrect ? t('practice.correct') : t('practice.incorrect')}
                  </p>
                  {lastCorrect && (
                    <p className="text-xs text-primary-600">{t(encourageKey)}</p>
                  )}
                </div>
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

      {/* Mascot in corner (only when not showing feedback) */}
      {!showFeedback && current > 0 && current % 5 === 0 && (
        <div className="fixed bottom-4 start-4 z-10 animate-fade-in">
          <Mascot mood="encourage" messageKey={encourageKey} size="sm" />
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
  const isPerfect = correct === total;

  return (
    <div className="app-shell scene-bg items-center justify-center">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
        {/* Mascot celebration */}
        <div className="mb-6">
          <Mascot mood="celebrate" messageKey={isPerfect ? 'practice.perfect' as UiKey : 'practice.greatJob' as UiKey} size="lg" />
        </div>

        {/* Trophy */}
        <div className="text-6xl mb-4 animate-bounce-in">🏆</div>

        <h1 className="font-display text-2xl font-extrabold text-neutral-900 mb-2">
          {isPerfect ? t('practice.perfect') : t('lesson.complete')}
        </h1>
        {lesson && <p className="text-neutral-500 mb-8">{lt(lesson.title)}</p>}

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 w-full mb-8">
          <ResultCard
            icon={<Star className="w-6 h-6 text-accent-400 fill-accent-400" />}
            value={xp}
            label={t('home.xp')}
            highlight
          />
          <ResultCard
            icon={<span className="text-2xl">🎯</span>}
            value={`${pct}%`}
            label={t('practice.progress')}
          />
          <ResultCard
            icon={<span className="text-2xl">✅</span>}
            value={`${correct}/${total}`}
            label={t('lesson.questions')}
          />
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button onClick={() => navigate({ name: 'path' })} className="btn-primary w-full text-lg">
            {t('nav.path')}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate({ name: 'lesson', lessonId })} className="btn-secondary">
              <BookOpen className="w-5 h-5" />
              {t('lesson.study')}
            </button>
            <button onClick={() => navigate({ name: 'practice', lessonId })} className="btn-secondary">
              {t('practice.retry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ icon, value, label, highlight }: { icon: React.ReactNode; value: string | number; label: string; highlight?: boolean }) {
  return (
    <div className={`card p-4 flex flex-col items-center ${highlight ? 'border-accent-200 bg-accent-50' : ''}`}>
      <div className="mb-1">{icon}</div>
      <span className="text-xl font-extrabold tabular-nums">{value}</span>
      <span className="text-[11px] text-neutral-500">{label}</span>
    </div>
  );
}

function OutOfHeartsScreen({ lessonId }: { lessonId: string }) {
  const { t } = useI18n();
  return (
    <div className="app-shell scene-bg items-center justify-center">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
        <div className="text-6xl mb-4 animate-bounce-in">💔</div>
        <h1 className="font-display text-2xl font-extrabold text-neutral-900 mb-2">{t('practice.outOfHearts')}</h1>
        <p className="text-neutral-500 mb-8">{t('practice.outOfHeartsMsg')}</p>
        <div className="w-full space-y-3">
          <button onClick={() => navigate({ name: 'practice', lessonId })} className="btn-primary w-full">
            {t('practice.retry')}
          </button>
          <button onClick={() => navigate({ name: 'study', lessonId })} className="btn-secondary w-full">
            <BookOpen className="w-5 h-5" />
            {t('practice.studyFirst')}
          </button>
        </div>
      </div>
    </div>
  );
}
