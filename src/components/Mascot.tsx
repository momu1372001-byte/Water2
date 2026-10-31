import { useI18n } from '@/i18n/I18nContext';
import type { UiKey } from '@/i18n/keys';

type Mood = 'happy' | 'encourage' | 'celebrate' | 'think' | 'sad';

interface MascotProps {
  mood?: Mood;
  message?: string;
  messageKey?: UiKey;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MOOD_EMOJI: Record<Mood, string> = {
  happy: '😊',
  encourage: '💪',
  celebrate: '🎉',
  think: '🤔',
  sad: '😅',
};

const MOOD_BG: Record<Mood, string> = {
  happy: 'from-primary-100 to-primary-200',
  encourage: 'from-accent-100 to-accent-200',
  celebrate: 'from-primary-100 to-accent-200',
  think: 'from-info-100 to-info-200',
  sad: 'from-warning-100 to-warning-200',
};

const SIZE_MAP = {
  sm: { circle: 'w-10 h-10', emoji: 'text-xl', message: 'text-xs' },
  md: { circle: 'w-14 h-14', emoji: 'text-2xl', message: 'text-sm' },
  lg: { circle: 'w-20 h-20', emoji: 'text-4xl', message: 'text-base' },
};

export function Mascot({ mood = 'happy', message, messageKey, size = 'md', className = '' }: MascotProps) {
  const { t } = useI18n();
  const text = message ?? (messageKey ? t(messageKey) : '');
  const s = SIZE_MAP[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${s.circle} rounded-full bg-gradient-to-br ${MOOD_BG[mood]} grid place-items-center shrink-0 shadow-pop animate-float-gentle`}
      >
        <span className={s.emoji}>{MOOD_EMOJI[mood]}</span>
      </div>
      {text && (
        <div className="relative bg-white rounded-2xl shadow-card border border-neutral-100 px-4 py-2.5 max-w-[220px]">
          <p className={`${s.message} font-medium text-neutral-700 leading-snug`}>{text}</p>
          <div className="absolute top-1/2 -translate-y-1/2 -start-1 w-2 h-2 bg-white border-l border-b border-neutral-100 rotate-45" />
        </div>
      )}
    </div>
  );
}
