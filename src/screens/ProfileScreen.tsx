import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { SceneBackground } from '@/components/SceneBackground';
import { ProgressRing } from '@/components/ProgressRing';
import { Flame, Gem, BookOpen, User, Settings as SettingsIcon, LogIn, Shield, Trophy, Globe, Target } from 'lucide-react';
import { getSupabaseStatus } from '@/lib/supabase';
import type { UiKey } from '@/i18n/keys';

export function ProfileScreen() {
  const { t, lang } = useI18n();
  const { progress, statusOf, reset } = useProgress();
  const supabase = getSupabaseStatus();
  const registry = loadRegistry();

  const completed = Object.values(progress.lessons).filter((l) => l.status === 'completed');
  const completedCount = completed.length;
  const level = Math.floor(progress.totalXp / 100) + 1;
  const levelProgress = progress.totalXp % 100;
  const allVocab = completed
    .map((l) => registry?.lessons[l.lessonId]?.vocabulary ?? [])
    .flat();
  const wordsLearned = allVocab.length;
  const avgAccuracy = completedCount > 0
    ? Math.round((completed.reduce((s, l) => s + l.bestAccuracy, 0) / completedCount) * 100)
    : 0;
  const learningTime = completedCount * 5;

  const LANG_LABELS: Record<string, string> = { ar: 'العربية', fr: 'Français', hi: 'हिन्दी', en: 'English' };

  const achievements: { key: UiKey; unlocked: boolean; icon: string }[] = [
    { key: 'progress.achievementFirst', unlocked: completedCount >= 1, icon: '🎯' },
    { key: 'progress.achievementStreak3', unlocked: progress.streak >= 3, icon: '🔥' },
    { key: 'progress.achievementStreak7', unlocked: progress.streak >= 7, icon: '⚡' },
    { key: 'progress.achievementPerfect', unlocked: completed.some((l) => l.bestAccuracy === 1), icon: '⭐' },
    { key: 'progress.achievementWords50', unlocked: wordsLearned >= 50, icon: '📚' },
    { key: 'progress.achievementWords100', unlocked: wordsLearned >= 100, icon: '🏆' },
  ];

  return (
    <SceneBackground>
      <div>
        <PageHeader title={t('nav.profile')} backTo={{ name: 'home' }} />

        {/* Profile hero card */}
        <div className="card p-6 mb-6 text-center bg-gradient-to-br from-primary-500 to-primary-800 border-0 text-white relative overflow-hidden">
          <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -start-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative">
            {/* Avatar */}
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full bg-white/20 grid place-items-center backdrop-blur-sm">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-accent-400 grid place-items-center text-xs font-extrabold text-white shadow-card">
                {level}
              </div>
            </div>
            <p className="font-display text-lg font-extrabold">
              {progress.isGuest ? t('profile.guest') : t('profile.member')}
            </p>
            {/* Level progress */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <ProgressRing progress={levelProgress} size={48} strokeWidth={4} className="text-white">
                <span className="text-xs font-bold text-white">{levelProgress}%</span>
              </ProgressRing>
              <div className="text-start">
                <p className="text-xs text-primary-100">{t('profile.level')} {level}</p>
                <p className="text-xs text-primary-100">{progress.totalXp} {t('home.xp')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <h2 className="font-display text-base font-bold mb-3 text-neutral-900">{t('profile.stats')}</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Stat icon={<Flame className="w-5 h-5 text-accent-500" />} value={progress.streak} label={t('profile.streak')} />
          <Stat icon={<Gem className="w-5 h-5 text-info-500" />} value={progress.totalXp} label={t('profile.xp')} />
          <Stat icon={<BookOpen className="w-5 h-5 text-primary-600" />} value={completedCount} label={t('profile.lessons')} />
        </div>

        {/* Detailed stats */}
        <div className="card p-4 mb-6 space-y-3">
          <DetailRow icon={<BookOpen className="w-4 h-4 text-primary-600" />} label={t('profile.wordsLearned')} value={wordsLearned} />
          <DetailRow icon={<Target className="w-4 h-4 text-info-500" />} label={t('profile.accuracy')} value={`${avgAccuracy}%`} />
          <DetailRow icon={<Globe className="w-4 h-4 text-accent-500" />} label={t('profile.interfaceLanguage')} value={LANG_LABELS[lang] ?? lang} />
          <DetailRow icon={<Trophy className="w-4 h-4 text-primary-600" />} label={t('profile.targetLanguage')} value="English" />
        </div>

        {/* Achievements */}
        <h2 className="font-display text-base font-bold mb-3 text-neutral-900">{t('profile.achievements')}</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {achievements.map((a) => (
            <div
              key={a.key}
              className={`card p-3 flex flex-col items-center text-center transition-all ${
                a.unlocked ? 'border-primary-200 bg-primary-50' : 'opacity-50'
              }`}
            >
              <span className="text-2xl mb-1">{a.unlocked ? a.icon : '🔒'}</span>
              <span className="text-[10px] font-semibold text-neutral-600 leading-tight">{t(a.key)}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <ActionRow icon={<SettingsIcon className="w-5 h-5" />} label={t('nav.settings')} onClick={() => navigate({ name: 'settings' })} />
          <ActionRow icon={<Trophy className="w-5 h-5" />} label={t('progress.title')} onClick={() => navigate({ name: 'progress' })} />
          {progress.isGuest && supabase.available && (
            <ActionRow icon={<LogIn className="w-5 h-5" />} label={t('auth.signUp')} onClick={() => navigate({ name: 'auth' })} highlight />
          )}
          <ActionRow
            icon={<Shield className="w-5 h-5 text-error-400" />}
            label={t('settings.resetProgress')}
            onClick={() => {
              if (confirm(t('settings.resetConfirm'))) reset();
            }}
          />
        </div>

        {/* Account status */}
        <div className="mt-6">
          <h2 className="font-display text-base font-bold mb-3 text-neutral-900">{t('profile.accountStatus')}</h2>
          <div className={`card p-4 flex items-center gap-3 ${progress.isGuest ? 'bg-neutral-50' : 'bg-primary-50 border-primary-200'}`}>
            <div className={`w-10 h-10 rounded-full grid place-items-center ${progress.isGuest ? 'bg-neutral-200' : 'bg-primary-100'}`}>
              <User className={`w-5 h-5 ${progress.isGuest ? 'text-neutral-500' : 'text-primary-700'}`} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-neutral-900">{progress.isGuest ? t('profile.guest') : t('profile.member')}</p>
              <p className="text-xs text-neutral-500">{progress.isGuest ? t('auth.migrateBody') : progress.userId ?? ''}</p>
            </div>
          </div>
        </div>
      </div>
    </SceneBackground>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="card p-3 flex flex-col items-center text-center">
      {icon}
      <span className="text-lg font-extrabold tabular-nums mt-1">{value}</span>
      <span className="text-[11px] text-neutral-500 leading-tight">{label}</span>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-neutral-600">{label}</span>
      </div>
      <span className="font-bold text-neutral-900 text-sm">{value}</span>
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
