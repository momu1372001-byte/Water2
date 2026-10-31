import { useI18n } from '@/i18n/I18nContext';
import { navigate } from '@/router/routes';
import { getSupabaseStatus } from '@/lib/supabase';
import { Sparkles, UserPlus, LogIn } from 'lucide-react';

export function WelcomeScreen() {
  const { t, lt } = useI18n();
  const status = getSupabaseStatus();

  const start = () => navigate({ name: 'home' });

  return (
    <div className="app-shell bg-gradient-to-b from-primary-50 via-white to-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-md mx-auto text-center">
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-3xl bg-primary-600 grid place-items-center shadow-pop animate-pop-in">
            <span className="text-white font-display font-extrabold text-4xl">LQ</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-400 animate-coin-bounce" />
        </div>

        <h1 className="font-display text-3xl font-extrabold text-neutral-900 mb-3 leading-tight">
          {t('welcome.title')}
        </h1>
        <p className="text-neutral-600 text-lg mb-10 leading-relaxed">{t('welcome.subtitle')}</p>

        <div className="w-full space-y-3">
          <button onClick={start} className="btn-primary w-full text-lg py-4">
            <Sparkles className="w-5 h-5" />
            {t('welcome.cta')}
          </button>
          {status.available && (
            <>
              <button onClick={() => navigate({ name: 'auth' })} className="btn-secondary w-full">
                <UserPlus className="w-5 h-5" />
                {t('auth.signUp')}
              </button>
              <button onClick={() => navigate({ name: 'auth' })} className="btn-ghost w-full text-neutral-600">
                <LogIn className="w-5 h-5" />
                {t('auth.signIn')}
              </button>
            </>
          )}
          {!status.available && (
            <button onClick={() => navigate({ name: 'auth' })} className="btn-ghost w-full text-neutral-600">
              {t('welcome.guest')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
