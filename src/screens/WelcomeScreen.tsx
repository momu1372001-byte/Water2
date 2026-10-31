import { useI18n } from '@/i18n/I18nContext';
import { navigate } from '@/router/routes';
import { getSupabaseStatus } from '@/lib/supabase';
import { Sparkles, UserPlus, LogIn, BookOpen, Layers, ShieldCheck } from 'lucide-react';

export function WelcomeScreen() {
  const { t } = useI18n();
  const status = getSupabaseStatus();

  const start = () => navigate({ name: 'home' });

  return (
    <div className="app-shell scene-bg">
      <div className="flex-1 flex flex-col px-6 py-12 max-w-md mx-auto">
        {/* Hero section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* Mascot / Logo */}
          <div className="relative mb-8">
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-32 h-32 rounded-full bg-primary-200/40 animate-pulse-ring" />
            </div>
            <div className="relative w-28 h-28 rounded-4xl bg-gradient-to-br from-primary-500 to-primary-700 grid place-items-center shadow-pop animate-pop-in">
              <span className="text-white font-display font-extrabold text-4xl">LQ</span>
            </div>
            {/* Floating decorations */}
            <div className="absolute -top-3 -end-3 w-8 h-8 rounded-full bg-accent-400 animate-coin-bounce shadow-pop" />
            <div className="absolute -bottom-2 -start-4 w-6 h-6 rounded-full bg-info-400 animate-float-gentle shadow-pop" />
          </div>

          <h1 className="font-display text-3xl font-extrabold text-neutral-900 mb-3 leading-tight max-w-xs">
            {t('welcome.title')}
          </h1>
          <p className="text-neutral-500 text-lg mb-10 leading-relaxed max-w-sm">
            {t('welcome.subtitle')}
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            <FeaturePill icon={<Sparkles className="w-5 h-5 text-primary-600" />} label={t('welcome.feature1')} />
            <FeaturePill icon={<Layers className="w-5 h-5 text-info-600" />} label={t('welcome.feature2')} />
            <FeaturePill icon={<ShieldCheck className="w-5 h-5 text-accent-600" />} label={t('welcome.feature3')} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pb-4">
          <button onClick={start} className="btn-primary w-full text-lg py-4 animate-float-up">
            <Sparkles className="w-5 h-5" />
            {t('welcome.cta')}
          </button>
          {status.available && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate({ name: 'auth' })} className="btn-secondary">
                <UserPlus className="w-5 h-5" />
                {t('auth.signUp')}
              </button>
              <button onClick={() => navigate({ name: 'auth' })} className="btn-ghost">
                <LogIn className="w-5 h-5" />
                {t('auth.signIn')}
              </button>
            </div>
          )}
          {!status.available && (
            <button onClick={() => navigate({ name: 'auth' })} className="btn-ghost w-full text-neutral-500">
              <BookOpen className="w-5 h-5" />
              {t('welcome.guest')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white shadow-card border border-neutral-100 grid place-items-center">
        {icon}
      </div>
      <span className="text-[11px] font-semibold text-neutral-500 leading-tight">{label}</span>
    </div>
  );
}
