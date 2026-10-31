import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { SceneBackground } from '@/components/SceneBackground';
import { useSpeech } from '@/hooks/useSpeech';
import { RotateCw, BookOpen, Lock, Volume2, ChevronRight, Brain, Target, AlertCircle, Check, X } from 'lucide-react';
import type { VocabularyItem } from '@/types/content';

export function RevisionScreen() {
  const { t, lt } = useI18n();
  const { statusOf, progress } = useProgress();
  const registry = loadRegistry();

  const completedLessons = Object.values(registry.lessons).filter(
    (l) => statusOf(l.id) === 'completed',
  );
  const allVocab = completedLessons.flatMap((l) => l.vocabulary);

  // Weak words: from lessons with < 80% accuracy
  const weakVocab = completedLessons
    .filter((l) => {
      const lp = progress.lessons[l.id];
      return lp && lp.bestAccuracy < 0.8;
    })
    .flatMap((l) => l.vocabulary);

  // "Due" words: all vocab from completed lessons (simplified SRS — no scheduling yet)
  const dueVocab = allVocab;

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState<Set<string>>(new Set());
  const [sessionWrong, setSessionWrong] = useState<Set<string>>(new Set());

  if (allVocab.length === 0) {
    return (
      <SceneBackground>
        <div>
          <PageHeader title={t('review.title')} backTo={{ name: 'home' }} />
          <div className="card p-8 text-center">
            <Lock className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="font-semibold text-neutral-600">{t('review.noWords')}</p>
            <p className="text-sm text-neutral-400 mt-1">{t('review.noWordsMsg')}</p>
            <button onClick={() => navigate({ name: 'path' })} className="btn-primary mt-4">
              {t('nav.path')}
            </button>
          </div>
        </div>
      </SceneBackground>
    );
  }

  // Review session mode
  if (sessionActive && dueVocab.length > 0) {
    const vocab = dueVocab[sessionIndex];
    if (!vocab) {
      setSessionActive(false);
      return null;
    }
    const sessionPct = ((sessionIndex + 1) / dueVocab.length) * 100;
    const isDone = sessionIndex >= dueVocab.length - 1;

    const markCorrect = () => {
      setSessionCorrect((s) => new Set(s).add(vocab.id));
      if (isDone) {
        setSessionActive(false);
      } else {
        setSessionIndex((i) => i + 1);
      }
    };
    const markWrong = () => {
      setSessionWrong((s) => new Set(s).add(vocab.id));
      if (isDone) {
        setSessionActive(false);
      } else {
        setSessionIndex((i) => i + 1);
      }
    };

    return (
      <SceneBackground variant="warm">
        <div>
          <PageHeader
            title={t('review.reviewSession')}
            subtitle={`${sessionIndex + 1} / ${dueVocab.length}`}
            backTo={{ name: 'home' }}
          />
          {/* Session progress */}
          <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden mb-5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300"
              style={{ width: `${sessionPct}%` }}
            />
          </div>

          {/* Flashcard-style review */}
          <ReviewCard vocab={vocab} lt={lt} t={t} />

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button onClick={markWrong} className="btn bg-accent-100 text-accent-700 border border-accent-200 hover:bg-accent-200">
              <X className="w-5 h-5" /> {t('review.needMore')}
            </button>
            <button onClick={markCorrect} className="btn bg-primary-100 text-primary-700 border border-primary-200 hover:bg-primary-200">
              <Check className="w-5 h-5" /> {t('review.gotIt')}
            </button>
          </div>
        </div>
      </SceneBackground>
    );
  }

  // Results after session
  if (!sessionActive && sessionCorrect.size + sessionWrong.size > 0) {
    return (
      <SceneBackground>
        <div>
          <PageHeader title={t('review.reviewSession')} backTo={{ name: 'home' }} />
          <div className="card p-6 text-center bg-gradient-to-br from-primary-50 to-white border-primary-200">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-lg text-neutral-900">{t('study.done')}</p>
            <p className="text-sm text-neutral-500 mt-1">
              {sessionCorrect.size} ✓ · {sessionWrong.size} ✗
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={() => navigate({ name: 'home' })} className="btn-secondary">
                {t('common.back')}
              </button>
              <button
                onClick={() => {
                  setSessionIndex(0);
                  setSessionCorrect(new Set());
                  setSessionWrong(new Set());
                  setSessionActive(true);
                }}
                className="btn-primary"
              >
                <RotateCw className="w-5 h-5" />
                {t('review.again')}
              </button>
            </div>
          </div>
        </div>
      </SceneBackground>
    );
  }

  return (
    <SceneBackground>
      <div>
        <PageHeader title={t('review.title')} subtitle={t('review.subtitle')} backTo={{ name: 'home' }} />

        {/* Start review button */}
        <button
          onClick={() => {
            setSessionIndex(0);
            setSessionCorrect(new Set());
            setSessionWrong(new Set());
            setSessionActive(true);
          }}
          className="card w-full p-5 mb-6 bg-gradient-to-r from-primary-600 to-primary-800 border-0 text-white flex items-center gap-4 hover:shadow-pop transition-all active:scale-[0.98]"
        >
          <div className="w-14 h-14 rounded-3xl bg-white/20 grid place-items-center shrink-0 backdrop-blur-sm">
            <RotateCw className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-start">
            <p className="font-display text-lg font-extrabold">{t('review.start')}</p>
            <p className="text-sm text-primary-100">{dueVocab.length} {t('review.wordsCount')}</p>
          </div>
          <ChevronRight className="w-6 h-6 text-white/70" />
        </button>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <ReviewStatCard
            icon={<Target className="w-5 h-5 text-primary-600" />}
            value={dueVocab.length}
            label={t('review.due')}
          />
          <ReviewStatCard
            icon={<Brain className="w-5 h-5 text-info-500" />}
            value={weakVocab.length}
            label={t('review.weak')}
          />
          <ReviewStatCard
            icon={<AlertCircle className="w-5 h-5 text-accent-500" />}
            value={0}
            label={t('review.incorrect')}
          />
        </div>

        {/* Vocab by lesson */}
        <div className="space-y-5">
          {completedLessons.map((lesson) => (
            <div key={lesson.id}>
              <button
                onClick={() => navigate({ name: 'study', lessonId: lesson.id })}
                className="flex items-center gap-2 mb-3 text-start hover:text-primary-600 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-primary-600" />
                <h2 className="font-semibold text-neutral-700">{lt(lesson.title)}</h2>
                <ChevronRight className="w-4 h-4 text-neutral-300" />
              </button>
              <div className="grid grid-cols-2 gap-2">
                {lesson.vocabulary.map((v) => (
                  <VocabCard key={v.id} vocab={v} lt={lt} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SceneBackground>
  );
}

function ReviewStatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="card p-3 flex flex-col items-center text-center">
      {icon}
      <span className="text-lg font-extrabold tabular-nums mt-1">{value}</span>
      <span className="text-[11px] text-neutral-500 leading-tight">{label}</span>
    </div>
  );
}

function VocabCard({ vocab, lt }: { vocab: VocabularyItem; lt: (l: Record<string, string> | undefined) => string }) {
  const { speak } = useSpeech();
  return (
    <div className="card p-3 flex items-center gap-2">
      <span className="text-xl shrink-0">{vocab.emoji ?? '🔤'}</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm text-neutral-900 truncate">{vocab.word}</p>
        <p className="text-xs text-neutral-500 truncate">{lt(vocab.translations)}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); speak(vocab.word); }}
        className="w-7 h-7 rounded-full bg-primary-100 hover:bg-primary-200 grid place-items-center transition-colors shrink-0"
        aria-label="pronounce"
      >
        <Volume2 className="w-3.5 h-3.5 text-primary-700" />
      </button>
    </div>
  );
}

function ReviewCard({ vocab, lt, t }: { vocab: VocabularyItem; lt: (l: Record<string, string> | undefined) => string; t: (key: never) => string }) {
  const { speak } = useSpeech();
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="card p-6 bg-gradient-to-br from-primary-50 to-white border-primary-200 cursor-pointer"
      onClick={() => setRevealed((r) => !r)}
    >
      <div className="text-center">
        {/* Emoji */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-200 grid place-items-center text-4xl mx-auto mb-4 shadow-card">
          {vocab.emoji ?? '📖'}
        </div>

        {/* Word */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <p className="font-display text-2xl font-extrabold text-neutral-900">{vocab.word}</p>
          <button
            onClick={(e) => { e.stopPropagation(); speak(vocab.word); }}
            className="w-9 h-9 rounded-full bg-primary-100 hover:bg-primary-200 grid place-items-center transition-colors"
            aria-label="pronunciation"
          >
            <Volume2 className="w-4 h-4 text-primary-700" />
          </button>
        </div>

        {vocab.ipa && <p className="text-sm text-neutral-400 font-mono mb-2">{vocab.ipa}</p>}

        {/* Translation (hidden until tapped) */}
        {revealed ? (
          <div className="animate-fade-in">
            <p className="text-lg font-bold text-primary-700">{lt(vocab.translations)}</p>
            {vocab.example && (
              <div className="mt-3 bg-white/60 rounded-2xl p-3">
                <p className="text-sm text-neutral-700">{vocab.example.english}</p>
                <p className="text-xs text-neutral-500 mt-1">{lt(vocab.example.translations)}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-primary-600 font-semibold mt-2">{t('study.tapFlip' as never)}</p>
        )}
      </div>
    </div>
  );
}
