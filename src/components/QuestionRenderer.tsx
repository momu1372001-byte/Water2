import { useState, type ReactNode } from 'react';
import { useSpeech } from '@/hooks/useSpeech';
import { useI18n } from '@/i18n/I18nContext';
import type { Question } from '@/types/content';
import { Check, X, Mic, Volume2 } from 'lucide-react';

export interface AnswerResult {
  correct: boolean;
}

interface QuestionRendererProps {
  question: Question;
  onAnswer: (result: AnswerResult) => void;
}

/**
 * Dispatches to the correct renderer by question `kind`. Each renderer manages
 * its own input state and calls `onAnswer` when the learner confirms.
 */
export function QuestionRenderer({ question, onAnswer }: QuestionRendererProps) {
  const { lt } = useI18n();

  switch (question.kind) {
    case 'instructional-card':
      return <InstructionalRenderer question={question} />;
    case 'image-choice':
      return <ImageChoiceRenderer question={question} onAnswer={onAnswer} />;
    case 'word-choice':
    case 'sentence-choice':
    case 'fill-blank-choice':
      return <StructuredChoiceRenderer question={question} onAnswer={onAnswer} />;
    case 'speaking':
      return <SpeakingRenderer question={question} />;
    case 'spelling':
      return <TextRenderer question={question} onAnswer={onAnswer} />;
    case 'multiple-choice':
      return <ChoiceRenderer question={question} onAnswer={onAnswer} />;
    case 'translate-choice':
      return <ChoiceRenderer question={question} onAnswer={onAnswer} />;
    case 'listen-and-choose':
      return <ChoiceRenderer question={question} onAnswer={onAnswer} />;
    case 'select-image':
      return <ImageChoiceRenderer question={question} onAnswer={onAnswer} />;
    case 'true-false':
      return <TrueFalseRenderer question={question} onAnswer={onAnswer} />;
    case 'translate-prompt':
      return <TextRenderer question={question} onAnswer={onAnswer} />;
    case 'type-what-you-hear':
      return <TextRenderer question={question} onAnswer={onAnswer} />;
    case 'fill-blank':
      return <TextRenderer question={question} onAnswer={onAnswer} />;
    case 'word-order':
      return <WordOrderRenderer question={question} onAnswer={onAnswer} />;
    case 'tap-to-build':
      return <TapToBuildRenderer question={question} onAnswer={onAnswer} />;
    case 'match-pairs':
      return <MatchPairsRenderer question={question} onAnswer={onAnswer} />;
    default:
      return <div className="text-error-500">Unsupported: {(question as Question).kind}</div>;
  }
}

// ---------- Reference-driven presentation and choice renderers ----------

function InstructionalRenderer({ question }: { question: Extract<Question, { kind: 'instructional-card' }> }) {
  const { lt, t } = useI18n();
  return (
    <div className="space-y-5 text-center">
      <Prompt text={lt(question.prompt)} />
      <div className="card p-5 bg-neutral-900 text-white border-neutral-800">
        {question.image ? (
          <img src={question.image} alt="" loading="lazy" className="w-28 h-28 object-contain mx-auto mb-4" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
        ) : <div className="w-24 h-24 rounded-3xl bg-primary-500/20 grid place-items-center mx-auto mb-4"><Volume2 className="w-10 h-10 text-accent-400" /></div>}
        <p className="font-display text-2xl font-bold" dir="ltr">{question.englishText}</p>
        <p className="mt-2 text-neutral-300">{lt(question.translation)}</p>
      </div>
      <AudioButton audio={question.audio} text={question.englishText} />
      {question.showMicrophone && <MicrophoneButton />}
      <button className="btn-primary w-full">{t('common.continue')}</button>
    </div>
  );
}

function ImageChoiceRenderer({ question, onAnswer }: { question: Extract<Question, { kind: 'image-choice' | 'select-image' }>; onAnswer: (r: AnswerResult) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const { lt } = useI18n();
  const isCorrect = selected === question.answer;
  const handleCheck = () => { if (!selected) return; setChecked(true); onAnswer({ correct: isCorrect }); };
  return (
    <div className="space-y-4">
      <Prompt text={lt(question.prompt)} />
      <div className="text-center py-3"><p className="font-display text-2xl font-bold text-neutral-900" dir="ltr">{question.stem}</p><AudioButton text={question.stem} compact /></div>
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option) => {
          const chosen = selected === option.id;
          const correct = checked && option.id === question.answer;
          const wrong = checked && chosen && !correct;
          return <button key={option.id} disabled={checked} onClick={() => setSelected(option.id)} className={`overflow-hidden rounded-2xl border-2 text-center transition-all active:scale-[0.98] ${correct ? 'border-primary-500 bg-primary-50' : wrong ? 'border-error-500 bg-error-50' : chosen ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 bg-white'}`}>
            <img src={option.image} alt={option.label} loading="lazy" className="w-full aspect-square object-cover bg-neutral-100" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            <span className="block p-2 font-semibold text-neutral-800">{option.label}</span>
          </button>;
        })}
      </div>
      <CheckButton disabled={!selected} checked={checked} isCorrect={isCorrect} onCheck={handleCheck} />
    </div>
  );
}

function StructuredChoiceRenderer({ question, onAnswer }: { question: Extract<Question, { kind: 'word-choice' | 'sentence-choice' | 'fill-blank-choice' }>; onAnswer: (r: AnswerResult) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const { lt } = useI18n();
  const isCorrect = selected === question.answer;
  const source = question.kind === 'fill-blank-choice' ? question.sentence : lt(question.source);
  return <div className="space-y-4">
    <Prompt text={lt(question.prompt)} />
    <div className="card p-6 text-center"><p className="font-display text-xl font-bold text-neutral-900" dir={question.kind === 'word-choice' ? 'rtl' : 'ltr'}>{source}</p>{question.kind === 'fill-blank-choice' && question.translation && <p className="text-sm text-neutral-500 mt-2">{lt(question.translation)}</p>}</div>
    <div className="space-y-2.5">{question.options.map((option, index) => <button key={`${option}-${index}`} disabled={checked} onClick={() => setSelected(index)} className={`w-full p-4 rounded-2xl border-2 text-center font-medium text-neutral-800 transition-all ${checked && index === question.answer ? 'border-primary-500 bg-primary-50' : checked && selected === index ? 'border-error-500 bg-error-50' : selected === index ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 bg-white'}`}>{option}</button>)}</div>
    <CheckButton disabled={selected === null} checked={checked} isCorrect={isCorrect} onCheck={() => { if (selected !== null) { setChecked(true); onAnswer({ correct: isCorrect }); } }} />
  </div>;
}

function SpeakingRenderer({ question }: { question: Extract<Question, { kind: 'speaking' }> }) {
  const { lt, t } = useI18n();
  return <div className="space-y-5 text-center"><Prompt text={lt(question.prompt)} /><div className="card p-6"><p className="font-display text-2xl font-bold text-neutral-900" dir="ltr">{question.englishText}</p><p className="text-neutral-500 mt-2">{lt(question.translation)}</p></div><div className="flex justify-center gap-4"><AudioButton audio={question.audio} text={question.englishText} /><MicrophoneButton /></div><button className="btn-primary w-full">{t('common.continue')}</button></div>;
}

function MicrophoneButton() {
  const [message, setMessage] = useState<string | null>(null);
  const start = () => setMessage('Microphone practice is available when speech recognition is supported by this browser.');
  return <div><button onClick={start} className="w-16 h-16 rounded-full bg-accent-400 text-neutral-900 grid place-items-center mx-auto active:scale-95" aria-label="microphone"><Mic className="w-7 h-7" /></button>{message && <p className="text-xs text-neutral-500 mt-2">{message}</p>}</div>;
}

// ---------- Choice (multiple-choice / translate-choice / listen) ----------

function ChoiceRenderer({ question, onAnswer }: { question: Question; onAnswer: (r: AnswerResult) => void }) {
  const { lt } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  if (question.kind !== 'multiple-choice' && question.kind !== 'translate-choice' && question.kind !== 'listen-and-choose') {
    return null;
  }

  const correctIdx = question.answer;
  const isCorrect = selected === correctIdx;

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    onAnswer({ correct: isCorrect });
  };

  return (
    <div className="space-y-4">
      <Prompt text={lt(question.prompt)} />
      {question.kind === 'multiple-choice' && (
        <div className="text-center py-6">
          <p className="font-display text-2xl font-bold text-neutral-900">{question.stem}</p>
        </div>
      )}
      {question.kind === 'listen-and-choose' && (
        <div className="text-center py-6">
          <AudioButton audio={question.audio} />
        </div>
      )}
      {question.kind === 'translate-choice' && (
        <div className="text-center py-6">
          <p className="font-display text-xl text-neutral-800">{lt(question.source)}</p>
        </div>
      )}
      <div className="space-y-2.5">
        {question.options.map((opt, i) => {
          const isSel = selected === i;
          let cls = 'border-neutral-200 bg-white';
          if (checked) {
            if (i === correctIdx) cls = 'border-primary-500 bg-primary-50';
            else if (isSel) cls = 'border-error-500 bg-error-50';
          } else if (isSel) {
            cls = 'border-primary-400 bg-primary-50';
          }
          return (
            <button
              key={i}
              disabled={checked}
              onClick={() => setSelected(i)}
              className={`w-full p-4 rounded-2xl border-2 text-start font-medium text-neutral-800 transition-all active:scale-[0.98] ${cls}`}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {checked && i === correctIdx && <Check className="w-5 h-5 text-primary-600" />}
                {checked && isSel && i !== correctIdx && <X className="w-5 h-5 text-error-500" />}
              </div>
            </button>
          );
        })}
      </div>
      <CheckButton disabled={selected === null} checked={checked} isCorrect={isCorrect} onCheck={handleCheck} />
    </div>
  );
}

// ---------- True / False ----------

function TrueFalseRenderer({ question, onAnswer }: { question: Question; onAnswer: (r: AnswerResult) => void }) {
  const { lt } = useI18n();
  const [selected, setSelected] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);

  if (question.kind !== 'true-false') return null;
  const isCorrect = selected === question.isTrue;

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    onAnswer({ correct: isCorrect });
  };

  return (
    <div className="space-y-4">
      <Prompt text={lt(question.prompt)} />
      <div className="text-center py-8 px-4 card">
        <p className="font-display text-lg font-bold text-neutral-900">{question.statement}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((val) => {
          let cls = 'border-neutral-200 bg-white';
          if (checked) {
            if (val === question.isTrue) cls = 'border-primary-500 bg-primary-50';
            else if (selected === val) cls = 'border-error-500 bg-error-50';
          } else if (selected === val) cls = 'border-primary-400 bg-primary-50';
          return (
            <button
              key={String(val)}
              disabled={checked}
              onClick={() => setSelected(val)}
              className={`p-4 rounded-2xl border-2 font-bold text-neutral-800 transition-all active:scale-[0.98] ${cls}`}
            >
              {val ? '✓ True' : '✗ False'}
            </button>
          );
        })}
      </div>
      <CheckButton disabled={selected === null} checked={checked} isCorrect={isCorrect} onCheck={handleCheck} />
    </div>
  );
}

// ---------- Text input (translate-prompt / type-what-you-hear / fill-blank) ----------

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ');
}

function TextRenderer({ question, onAnswer }: { question: Question; onAnswer: (r: AnswerResult) => void }) {
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);
  const { lt } = useI18n();

  if (question.kind !== 'translate-prompt' && question.kind !== 'type-what-you-hear' && question.kind !== 'fill-blank' && question.kind !== 'spelling') return null;

  let display: ReactNode = null;
  if (question.kind === 'translate-prompt') display = <p className="font-display text-xl text-center py-6 text-neutral-800">{lt(question.source)}</p>;
  else if (question.kind === 'type-what-you-hear') display = <AudioButton audio={question.audio} />;
  else if (question.kind === 'spelling') display = <AudioButton audio={question.audio} />;
  else if (question.kind === 'fill-blank') display = <p className="font-display text-xl text-center py-6 text-neutral-800">{question.sentence}</p>;

  const answers = question.answers;
  const isCorrect = answers.some((a) => normalize(a) === normalize(value));

  const handleCheck = () => {
    if (!value.trim()) return;
    setChecked(true);
    onAnswer({ correct: isCorrect });
  };

  return (
    <div className="space-y-4">
      <Prompt text={lt(question.prompt)} />
      {display}
      <input
        type="text"
        value={value}
        disabled={checked}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !checked) handleCheck(); }}
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        className="w-full p-4 rounded-2xl border-2 border-neutral-200 focus:border-primary-400 outline-none text-lg font-medium text-neutral-900 bg-white"
        placeholder="..."
        dir="ltr"
      />
      <CheckButton disabled={!value.trim()} checked={checked} isCorrect={isCorrect} onCheck={handleCheck} />
      {checked && !isCorrect && (
        <p className="text-sm text-neutral-500 text-center">
          <span className="text-primary-600 font-semibold">{answers[0]}</span>
        </p>
      )}
    </div>
  );
}

// ---------- Word order ----------

function WordOrderRenderer({ question, onAnswer }: { question: Question; onAnswer: (r: AnswerResult) => void }) {
  const [placed, setPlaced] = useState<string[]>([]);
  const { lt } = useI18n();

  if (question.kind !== 'word-order') return null;
  const available = question.shuffled.filter((tok, i) => {
    // tokens still available = shuffled minus placed, by count
    const usedCount = placed.filter((p) => p === tok).length;
    const sameBefore = question.shuffled.slice(0, i).filter((t) => t === tok).length;
    return sameBefore >= usedCount;
  });

  const isCorrect = placed.join(' ') === question.tokens.join(' ');

  const handleCheck = () => {
    if (placed.length === 0) return;
    onAnswer({ correct: isCorrect });
  };

  // Render shuffled tokens; click moves to placed. Simpler: render each shuffled token once, track used indices.
  const usedIndices = new Set<number>();
  for (const p of placed) {
    for (let i = 0; i < question.shuffled.length; i++) {
      if (!usedIndices.has(i) && question.shuffled[i] === p) {
        usedIndices.add(i);
        break;
      }
    }
  }

  return (
    <div className="space-y-4">
      <Prompt text={lt(question.prompt)} />
      {/* Placed area */}
      <div className="min-h-[64px] card p-3 flex flex-wrap gap-2 items-center" dir="ltr">
        {placed.length === 0 && <span className="text-neutral-300 text-sm p-2">...</span>}
        {placed.map((tok, i) => (
          <button
            key={`${tok}-${i}`}
            onClick={() => setPlaced((p) => p.filter((_, idx) => idx !== i))}
            className="px-3 py-2 rounded-xl bg-primary-100 text-primary-800 font-semibold active:scale-95"
          >
            {tok}
          </button>
        ))}
      </div>
      {/* Available tokens */}
      <div className="flex flex-wrap gap-2 justify-center" dir="ltr">
        {question.shuffled.map((tok, i) => {
          if (usedIndices.has(i)) return <span key={i} className="px-3 py-2 rounded-xl bg-neutral-100 text-transparent select-none">{tok}</span>;
          return (
            <button
              key={i}
              onClick={() => setPlaced((p) => [...p, tok])}
              className="px-3 py-2 rounded-xl bg-white border-2 border-neutral-200 font-semibold text-neutral-800 active:scale-95 hover:border-primary-300"
            >
              {tok}
            </button>
          );
        })}
      </div>
      <CheckButton disabled={placed.length === 0} checked={false} isCorrect={isCorrect} onCheck={handleCheck} />
    </div>
  );
}

// ---------- Tap to build ----------

function TapToBuildRenderer({ question, onAnswer }: { question: Question; onAnswer: (r: AnswerResult) => void }) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const { lt } = useI18n();

  if (question.kind !== 'tap-to-build') return null;
  const targetTokens = question.target.split(' ');
  const placedTokens = placed.map((i) => question.bank[i]);
  const isCorrect = placedTokens.join(' ') === targetTokens.join(' ');

  const handleCheck = () => {
    setChecked(true);
    onAnswer({ correct: isCorrect });
  };

  return (
    <div className="space-y-4">
      <Prompt text={lt(question.prompt)} />
      <div className="min-h-[64px] card p-3 flex flex-wrap gap-2 items-center" dir="ltr">
        {placed.length === 0 && <span className="text-neutral-300 text-sm p-2">...</span>}
        {placed.map((bankIdx, pos) => (
          <button
            key={pos}
            disabled={checked}
            onClick={() => setPlaced((p) => p.filter((_, idx) => idx !== pos))}
            className="px-3 py-2 rounded-xl bg-primary-100 text-primary-800 font-semibold active:scale-95"
          >
            {question.bank[bankIdx]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center" dir="ltr">
        {question.bank.map((tok, i) => {
          const used = placed.includes(i);
          return (
            <button
              key={i}
              disabled={used || checked}
              onClick={() => setPlaced((p) => [...p, i])}
              className={`px-3 py-2 rounded-xl border-2 font-semibold transition-all active:scale-95 ${
                used ? 'bg-neutral-100 text-transparent border-neutral-100 select-none' : 'bg-white border-neutral-200 text-neutral-800 hover:border-primary-300'
              }`}
            >
              {tok}
            </button>
          );
        })}
      </div>
      <CheckButton disabled={placed.length === 0} checked={checked} isCorrect={isCorrect} onCheck={handleCheck} />
    </div>
  );
}

// ---------- Match pairs ----------

function MatchPairsRenderer({ question, onAnswer }: { question: Question; onAnswer: (r: AnswerResult) => void }) {
  const [leftSel, setLeftSel] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({}); // leftIdx -> rightIdx
  const [checked, setChecked] = useState(false);
  const { lt } = useI18n();

  if (question.kind !== 'match-pairs') return null;

  const rightIndices = question.pairs.map((_, i) => i);
  // Shuffle right side deterministically by reversing for simplicity (content author shuffles in JSON ideally).
  const shuffledRight = [...rightIndices].reverse();

  const allMatched = Object.keys(matches).length === question.pairs.length;
  const isCorrect = allMatched && question.pairs.every((p, li) => matches[li] !== undefined && question.pairs[matches[li]].right === p.right);

  const handleCheck = () => {
    setChecked(true);
    onAnswer({ correct: isCorrect });
  };

  const onLeftClick = (li: number) => {
    if (matches[li] !== undefined) return;
    setLeftSel(li);
  };

  const onRightClick = (ri: number) => {
    if (leftSel === null) return;
    // remove any existing match pointing to this right
    setMatches((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(next)) {
        if (v === shuffledRight[ri]) delete next[Number(k)];
      }
      next[leftSel] = shuffledRight[ri];
      return next;
    });
    setLeftSel(null);
  };

  return (
    <div className="space-y-4">
      <Prompt text={lt(question.prompt)} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {question.pairs.map((p, li) => {
            const matched = matches[li] !== undefined;
            const isSel = leftSel === li;
            return (
              <button
                key={li}
                disabled={matched}
                onClick={() => onLeftClick(li)}
                className={`w-full p-3 rounded-xl border-2 font-semibold text-sm transition-all active:scale-[0.98] ${
                  matched ? 'border-primary-300 bg-primary-50 text-primary-400 line-through' : isSel ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white'
                }`}
              >
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {shuffledRight.map((origIdx, ri) => {
            const usedLeft = Object.entries(matches).find(([, v]) => v === origIdx);
            const matched = usedLeft !== undefined;
            return (
              <button
                key={ri}
                disabled={matched}
                onClick={() => onRightClick(ri)}
                className={`w-full p-3 rounded-xl border-2 font-semibold text-sm transition-all active:scale-[0.98] ${
                  matched ? 'border-primary-300 bg-primary-50 text-primary-400 line-through' : leftSel !== null ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-200 bg-white'
                }`}
              >
                {question.pairs[origIdx].right}
              </button>
            );
          })}
        </div>
      </div>
      <CheckButton disabled={!allMatched} checked={checked} isCorrect={isCorrect} onCheck={handleCheck} />
    </div>
  );
}

// ---------- Shared bits ----------

function Prompt({ text }: { text: string }) {
  return <p className="font-semibold text-neutral-800 text-base mb-1">{text}</p>;
}

function AudioButton({ audio, text, compact = false }: { audio?: { src: string }; text?: string; compact?: boolean }) {
  const { speak } = useSpeech();
  const [failed, setFailed] = useState(false);
  const play = () => {
    if (audio?.src) {
      const player = new Audio(audio.src);
      player.onerror = () => { setFailed(true); if (text) speak(text); };
      void player.play().catch(() => { setFailed(true); if (text) speak(text); });
    } else if (text) speak(text);
  };
  return <div className={compact ? '' : 'text-center py-3'}><button onClick={play} className={`${compact ? 'w-10 h-10' : 'w-16 h-16'} rounded-full bg-primary-100 text-primary-700 grid place-items-center mx-auto active:scale-95`} aria-label="play audio"><Volume2 className={compact ? 'w-5 h-5' : 'w-7 h-7'} /></button>{failed && <p className="text-xs text-neutral-500 mt-2">Audio unavailable; pronunciation fallback used.</p>}</div>;
}

function CheckButton({
  disabled,
  checked,
  isCorrect,
  onCheck,
}: {
  disabled: boolean;
  checked: boolean;
  isCorrect: boolean;
  onCheck: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="pt-2">
      {checked ? (
        <div
          className={`w-full py-4 rounded-2xl font-bold text-white text-center ${
            isCorrect ? 'bg-primary-600' : 'bg-error-500'
          }`}
        >
          {isCorrect ? (
            <span className="flex items-center justify-center gap-2"><Check className="w-5 h-5" /> {t('practice.correct')}</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><X className="w-5 h-5" /> {t('practice.incorrect')}</span>
          )}
        </div>
      ) : (
        <button onClick={onCheck} disabled={disabled} className="btn-primary w-full text-lg">
          {t('practice.check')}
        </button>
      )}
    </div>
  );
}
