import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { getSupabase } from '@/lib/supabase';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { Mail, Lock, UserPlus, LogIn, ShieldCheck } from 'lucide-react';

export function AuthScreen() {
  const { t } = useI18n();
  const { migrate } = useProgress();
  const supabase = getSupabase();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      setError('Supabase not configured.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } =
        mode === 'signUp'
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const userId = data.user?.id;
      if (userId) {
        await migrate(userId);
        navigate({ name: 'home' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title={mode === 'signUp' ? t('auth.signUp') : t('auth.signIn')} backTo={{ name: 'home' }} />

      {!supabase && (
        <div className="card p-5 mb-4 bg-warning-50 border-warning-200">
          <p className="text-sm text-warning-700 font-semibold">{t('common.error')}</p>
          <p className="text-xs text-warning-600 mt-1">{t('auth.continueGuest')}</p>
        </div>
      )}

      {/* Guest migration banner */}
      <div className="card p-4 mb-5 bg-primary-50 border-primary-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-neutral-900 text-sm">{t('auth.migrateTitle')}</p>
            <p className="text-xs text-neutral-600 mt-0.5">{t('auth.migrateBody')}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute top-4 start-4 w-5 h-5 text-neutral-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email')}
            required
            className="w-full ps-12 pe-4 py-3.5 rounded-2xl border-2 border-neutral-200 focus:border-primary-400 outline-none font-medium text-neutral-900"
          />
        </div>
        <div className="relative">
          <Lock className="absolute top-4 start-4 w-5 h-5 text-neutral-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.password')}
            required
            minLength={6}
            className="w-full ps-12 pe-4 py-3.5 rounded-2xl border-2 border-neutral-200 focus:border-primary-400 outline-none font-medium text-neutral-900"
          />
        </div>

        {error && <p className="text-sm text-error-600 px-1">{error}</p>}

        <button type="submit" disabled={loading || !supabase} className="btn-primary w-full text-lg">
          {mode === 'signUp' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          {loading ? t('common.loading') : mode === 'signUp' ? t('auth.signUp') : t('auth.signIn')}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => setMode((m) => (m === 'signUp' ? 'signIn' : 'signUp'))}
          className="text-sm text-primary-600 font-semibold"
        >
          {mode === 'signUp' ? t('auth.signIn') : t('auth.signUp')}
        </button>
      </div>

      <div className="mt-6 text-center">
        <button onClick={() => navigate({ name: 'home' })} className="btn-ghost text-neutral-500">
          {t('auth.continueGuest')}
        </button>
      </div>
    </div>
  );
}
