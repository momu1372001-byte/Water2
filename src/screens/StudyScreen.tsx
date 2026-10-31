import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { SceneBackground } from '@/components/SceneBackground';
import { useSpeech } from '@/hooks/useSpeech';
import { Check, X, RotateCw, ChevronLeft, ChevronRight, Volume2, Eye, EyeOff, BookOpen, Sparkles } from 'lucide-react';
import type { Flashcard, VocabularyItem, GrammarNote } from '@/types/content';

export function StudyScreen({ lessonId }: { lessonId: string }) {
  const { t, lt, dir } = useI18n();
  const registry = loadRegistry();
  const lesson = registry.lessons[lessonId];

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const [revealedSentence, setRevealedSentence] = useState<Set<number>>(new Set());
  const [showGrammar, setShowGrammar] = useState(false);

  if (!lesson) {
    return <div className="p-6 text-center text-neutral-500">{t('common.error')}</div>;
  }

  const cards = lesson.flashcards;
  const card = cards[index];
  const vocab = lesson.vocabulary.find((v) => v.id === card?.vocabId);
  const grammar = lesson.grammar?.[0];

  const Next = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const Prev = dir === 'rtl' ? ChevronRight : ChevronLeft;

  const goNext = () => {
    setFlipped(false);
    setShowGrammar(false);
    setIndex((i) => Math.min(cards.length - 1, i + 1));
  };
  const goPrev = () => {
    setFlipped(false);
    setShowGrammar(false);
    setIndex((i) => Math.max(0, i - 1));
  };

  const markKnown = () => {
    setKnown((s) => new Set(s).add(index));
    setUnknown((s) => { const n = new Set(s); n.delete(index); return n; });
    if (index < cards.length - 1) goNext();
  };
  const markUnknown = () => {
    setUnknown((s) => new Set(s).add(index));
    setKnown((s) => { const n = new Set(s); n.delete(index); return n; });
    if (index < cards.length - 1) goNext();
  };

  const toggleSentenceReveal = () => {
    setRevealedSentence((s) => {
      const n = new Set(s);
      if (n.has(index)) n.delete(index);
      else n.add(index);
      return n;
    });
  };

  if (!card) return null;

  const isDone = known.size + unknown.size >= cards.length;
  const sentenceRevealed = revealedSentence.has(index);

  return (
    <SceneBackground variant="warm">
      <div>
        <PageHeader
          title={lt(lesson.title)}
          subtitle={`${index + 1} / ${cards.length}`}
          backTo={{ name: 'lesson', lessonId }}
        />

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-5">
          {cards.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                known.has(i)
                  ? 'bg-primary-500'
                  : unknown.has(i)
                  ? 'bg-accent-400'
                  : i === index
                  ? 'bg-neutral-400'
                  : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>

        {/* Flashcard */}
        <div
          className="relative w-full aspect-[4/3] cursor-pointer mb-3 flip-card"
          onClick={() => setFlipped((f) => !f)}
        >
          <div className={`absolute inset-0 flip-inner ${flipped ? 'flipped' : ''}`}>
            {/* Front */}
            <FlashcardFront
              card={card}
              vocab={vocab}
              lt={lt}
              sentenceRevealed={sentenceRevealed}
              onReveal={toggleSentenceReveal}
              onSpeak={useSpeak}
              t={t}
            />
            {/* Back */}
            <FlashcardBack
              card={card}
              vocab={vocab}
              grammar={grammar}
              lt={lt}
              onSpeak={useSpeak}
              t={t}
            />
          </div>
        </div>

        {/* Flip hint */}
        {!flipped && (
          <p className="text-center text-xs text-neutral-400 flex items-center justify-center gap-1.5 mb-4 animate-fade-in">
            <RotateCw className="w-3.5 h-3.5" />
            {t('study.tapFlip')}
          </p>
        )}

        {/* Grammar notes toggle (when flipped) */}
        {flipped && grammar && (
          <div className="mb-4">
            <button
              onClick={(e) => { e.stopPropagation(); setShowGrammar((s) => !s); }}
              className="btn-ghost w-full text-sm text-info-600"
            >
              <BookOpen className="w-4 h-4" />
              {t('study.grammar')}
            </button>
            {showGrammar && (
              <div className="card p-4 mt-2 bg-info-50 border-info-200 animate-slide-in">
                <p className="font-bold text-neutral-900 text-sm mb-1">{lt(grammar.title)}</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{lt(grammar.body)}</p>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        {!isDone ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); markUnknown(); }}
                className="btn bg-accent-100 text-accent-700 border border-accent-200 hover:bg-accent-200"
              >
                <X className="w-5 h-5" /> {t('study.dontKnow')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); markKnown(); }}
                className="btn bg-primary-100 text-primary-700 border border-primary-200 hover:bg-primary-200"
              >
                <Check className="w-5 h-5" /> {t('study.know')}
              </button>
            </div>
            <div className="flex justify-between">
              <button onClick={(e) => { e.stopPropagation(); goPrev(); }} disabled={index === 0} className="btn-ghost px-3 py-2">
                <Prev className="w-5 h-5" /> {t('study.prev')}
              </button>
              <button onClick={(e) => { e.stopPropagation(); goNext(); }} disabled={index === cards.length - 1} className="btn-ghost px-3 py-2">
                {t('study.next')} <Next className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="card p-6 bg-gradient-to-br from-primary-50 to-white border-primary-200">
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-bold text-lg text-neutral-900">{t('study.done')}</p>
              <p className="text-sm text-neutral-500 mt-1">
                {known.size} ✓ · {unknown.size} ✗
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate({ name: 'lesson', lessonId })} className="btn-secondary">
                {t('common.back')}
              </button>
              <button onClick={() => navigate({ name: 'practice', lessonId })} className="btn-primary">
                <Sparkles className="w-5 h-5" />
                {t('lesson.practice')}
              </button>
            </div>
          </div>
        )}
      </div>
    </SceneBackground>
  );
}

// Shared speech instance for the speak buttons
function useSpeak() {
  const { speak } = useSpeech();
  return speak;
}

function FlashcardFront({
  card,
  vocab,
  lt,
  sentenceRevealed,
  onReveal,
  onSpeak,
  t,
}: {
  card: Flashcard;
  vocab?: VocabularyItem;
  lt: (l: Record<string, string> | undefined) => string;
  sentenceRevealed: boolean;
  onReveal: () => void;
  onSpeak: (text: string, lang?: string, rate?: number) => void;
  t: (key: never) => string;
}) {
  const exampleSentence = vocab?.example;

  return (
    <div className="absolute inset-0 flip-face card p-6 flex flex-col">
      {/* Image / emoji area */}
      <div className="flex-1 flex items-center justify-center mb-4">
        {card.image ? (
          <img
            src={card.image}
            alt={card.back}
            className="max-h-full max-w-full rounded-2xl object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-200 grid place-items-center text-5xl shadow-card">
            {vocab?.emoji ?? '📖'}
          </div>
        )}
      </div>

      {/* Word + pronunciation */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-2">
          <p className="font-display text-2xl font-extrabold text-neutral-900">{card.back}</p>
          <button
            onClick={(e) => { e.stopPropagation(); onSpeak(card.back); }}
            className="w-9 h-9 rounded-full bg-primary-100 hover:bg-primary-200 grid place-items-center transition-colors"
            aria-label="pronunciation"
          >
            <Volume2 className="w-4 h-4 text-primary-700" />
          </button>
        </div>
        {vocab?.ipa && (
          <p className="text-sm text-neutral-400 font-mono mt-1">{vocab.ipa}</p>
        )}
        {vocab?.partOfSpeech && (
          <p className="text-xs text-neutral-400 italic mt-0.5">{vocab.partOfSpeech}</p>
        )}
      </div>

      {/* Example sentence */}
      {exampleSentence && (
        <div className="bg-neutral-50 rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="text-sm font-medium text-neutral-700">{exampleSentence.english}</p>
            <button
              onClick={(e) => { e.stopPropagation(); onSpeak(exampleSentence.english); }}
              className="w-7 h-7 rounded-full bg-info-100 hover:bg-info-200 grid place-items-center transition-colors shrink-0"
              aria-label="sentence audio"
            >
              <Volume2 className="w-3.5 h-3.5 text-info-600" />
            </button>
          </div>
          {/* Reveal sentence translation */}
          <button
            onClick={(e) => { e.stopPropagation(); onReveal(); }}
            className="text-xs text-primary-600 font-semibold flex items-center gap-1 mx-auto mt-1"
          >
            {sentenceRevealed ? (
              <>
                <EyeOff className="w-3 h-3" /> {lt(exampleSentence.translations)}
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" /> {t('study.reveal' as never)}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function FlashcardBack({
  card,
  vocab,
  grammar,
  lt,
  onSpeak,
  t,
}: {
  card: Flashcard;
  vocab?: VocabularyItem;
  grammar?: GrammarNote;
  lt: (l: Record<string, string> | undefined) => string;
  onSpeak: (text: string, lang?: string, rate?: number) => void;
  t: (key: never) => string;
}) {
  return (
    <div className="absolute inset-0 flip-face flip-back card p-6 bg-gradient-to-br from-primary-50 to-white border-primary-200 flex flex-col">
      {/* Translation */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
          {t('study.translation' as never)}
        </p>
        <p className="font-display text-2xl font-extrabold text-primary-800 text-center">
          {lt(card.front)}
        </p>
        {vocab && (
          <p className="font-display text-lg text-neutral-700 mt-2">{vocab.word}</p>
        )}
        {vocab?.partOfSpeech && (
          <p className="text-xs text-neutral-400 italic mt-1">{vocab.partOfSpeech}</p>
        )}
      </div>

      {/* Pronunciation button */}
      <div className="flex justify-center mb-3">
        <button
          onClick={(e) => { e.stopPropagation(); onSpeak(card.back); }}
          className="w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 grid place-items-center transition-colors"
          aria-label="pronunciation"
        >
          <Volume2 className="w-5 h-5 text-primary-700" />
        </button>
      </div>

      {/* Grammar note preview */}
      {grammar && (
        <div className="bg-white/60 rounded-2xl p-3 border border-primary-100">
          <p className="text-xs font-bold text-info-600 mb-1">{t('study.grammar' as never)}</p>
          <p className="text-sm text-neutral-600 leading-relaxed">{lt(grammar.body)}</p>
        </div>
      )}
    </div>
  );
}
