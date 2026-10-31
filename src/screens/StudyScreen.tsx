import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { Check, X, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

export function StudyScreen({ lessonId }: { lessonId: string }) {
  const { t, lt, dir } = useI18n();
  const registry = loadRegistry();
  const lesson = registry.lessons[lessonId];

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());

  if (!lesson) {
    return <div className="p-6 text-center text-neutral-500">{t('common.error')}</div>;
  }

  const cards = lesson.flashcards;
  const card = cards[index];

  const Next = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const Prev = dir === 'rtl' ? ChevronRight : ChevronLeft;

  const goNext = () => {
    setFlipped(false);
    setIndex((i) => Math.min(cards.length - 1, i + 1));
  };
  const goPrev = () => {
    setFlipped(false);
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

  if (!card) return null;

  const isDone = known.size + unknown.size >= cards.length;

  return (
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
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              known.has(i) ? 'bg-primary-500' : unknown.has(i) ? 'bg-accent-400' : i === index ? 'bg-neutral-400' : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>

      {/* Flip card */}
      <div
        className="relative w-full aspect-[4/3] cursor-pointer mb-5"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="absolute inset-0 transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front — learner language */}
          <div
            className="absolute inset-0 card grid place-items-center p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <p className="text-sm text-neutral-400 mb-3 flex items-center gap-1 justify-center">
                <RotateCw className="w-3.5 h-3.5" /> {t('study.flip')}
              </p>
              <p className="font-display text-3xl font-extrabold text-neutral-900">{lt(card.front)}</p>
            </div>
          </div>
          {/* Back — English target */}
          <div
            className="absolute inset-0 card grid place-items-center p-6 bg-primary-50 border-primary-200"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-center">
              <p className="font-display text-3xl font-extrabold text-primary-800">{card.back}</p>
              {card.audio && (
                <p className="text-xs text-neutral-400 mt-2">🔊 audio</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {!isDone ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={markUnknown} className="btn bg-accent-100 text-accent-700 border border-accent-200 hover:bg-accent-200">
              <X className="w-5 h-5" /> {t('study.dontKnow')}
            </button>
            <button onClick={markKnown} className="btn bg-primary-100 text-primary-700 border border-primary-200 hover:bg-primary-200">
              <Check className="w-5 h-5" /> {t('study.know')}
            </button>
          </div>
          <div className="flex justify-between">
            <button onClick={goPrev} disabled={index === 0} className="btn-ghost px-3 py-2">
              <Prev className="w-5 h-5" /> {t('study.prev')}
            </button>
            <button onClick={goNext} disabled={index === cards.length - 1} className="btn-ghost px-3 py-2">
              {t('study.next')} <Next className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <div className="card p-6 bg-primary-50 border-primary-200">
            <p className="text-3xl mb-2">🎉</p>
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
              {t('lesson.practice')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
