import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { Flame, Gem, BookOpen, User, Settings as SettingsIcon, LogIn, Shield } from 'lucide-react';
import { getSupabaseStatus } from '@/lib/supabase';

export function ProfileScreen() {
  const { t } = useI18n();
  const { progress, statusOf, reset } = useProgress();
  const supabase = getSupabaseStatus();

  const completed = Object.values(progress.lessons).filter((l) => l.status === 'completed').length;

  return (
    <div>
      <PageHeader title={t('nav.profile')} />
      {/* Profile card */}
      <div className="card p-6 mb-6 text-center bg-gradient-to-br from-primary-50 to-white">
        <div className="w-20 h-20 rounded-full bg-primary-100 grid place-items-center mx-auto mb-3">
          <User className="w-10 h-10 text-primary-700" />
        </div>
        <p className="font-display text-lg font-extrabold text-neutral-900">
          {progress.isGuest ? t('profile.guest') : t('profile.member')}
        </p>
        {progress.userId && <p className="text-xs text-neutral-400 font-mono">{progress.userId}</p>}
      </div>

      {/* Stats */}
      <h2 className="font-display text-base font-bold mb-3">{t('profile.stats')}</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat icon={<Flame className="w-5 h-5 text-accent-500" />} value={progress.streak} label={t('profile.streak')} />
        <Stat icon={<Gem className="w-5 h-5 text-info-500" />} value={progress.totalXp} label={t('profile.xp')} />
        <Stat icon={<BookOpen className="w-5 h-5 text-primary-600" />} value={completed} label={t('profile.lessons')} />
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <ActionRow icon={<SettingsIcon className="w-5 h-5" />} label={t('nav.settings')} onClick={() => navigate({ name: 'settings' })} />
        {progress.isGuest && supabase.available && (
          <ActionRow icon={<LogIn className="w-5 h-5" />} label={t('auth.signUp')} onClick={() => navigate({ name: 'auth' })} highlight />
        )}
        <ActionRow
          icon={<Shield className="w-5 h-5 text-error-400" />}
          label={t('common.retry')}
          onClick={() => {
            if (confirm('Reset all progress?')) reset();
          }}
        />
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="card p-3 flex flex-col items-center text-center">
      {icon}
      <span className="text-lg font-extrabold tabular-nums mt-1">{value}</span>
      <span className="text-[11px] text-neutral-500">{label}</span>
    </div>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`card w-full p-4 flex items-center gap-3 text-start transition-all hover:shadow-pop ${
        highlight ? 'border-primary-300 bg-primary-50' : ''
      }`}
    >
      <span className={`w-9 h-9 rounded-full grid place-items-center ${highlight ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'}`}>
        {icon}
      </span>
      <span className="flex-1 font-semibold text-neutral-800">{label}</span>
      <span className="text-neutral-300">›</span>
    </button>
  );
}
