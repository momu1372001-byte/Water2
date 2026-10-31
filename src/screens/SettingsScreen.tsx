import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { PageHeader } from '@/components/PageHeader';
import { SceneBackground } from '@/components/SceneBackground';
import { INTERFACE_LANGUAGES, type InterfaceLanguage } from '@/i18n/keys';
import { Volume2, Palette, Globe, Bell, Target, Accessibility, User, Database, Gauge, Download, RotateCw, Check } from 'lucide-react';
import { getSoundEnabled, setSoundEnabled } from '@/hooks/useSound';

const LANG_LABELS: Record<InterfaceLanguage, { native: string; en: string }> = {
  ar: { native: 'العربية', en: 'Arabic' },
  fr: { native: 'Français', en: 'French' },
  hi: { native: 'हिन्दी', en: 'Hindi' },
};

export function SettingsScreen() {
  const { t, lang, setLang } = useI18n();
  const { reset } = useProgress();
  const [soundOn, setSoundOn] = useState(getSoundEnabled());
  const [reducedMotion, setReducedMotion] = useState(false);
  const [speechRate, setSpeechRate] = useState<'slow' | 'normal' | 'fast'>('normal');

  const toggleSound = () => {
    const newVal = !soundOn;
    setSoundOn(newVal);
    setSoundEnabled(newVal);
  };

  return (
    <SceneBackground>
      <div>
        <PageHeader title={t('nav.settings')} backTo={{ name: 'home' }} />
        <div className="space-y-6">
          {/* Interface language */}
          <Section icon={<Globe className="w-4 h-4 text-primary-600" />} title={t('settings.language')}>
            <div className="space-y-2">
              {INTERFACE_LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`card w-full p-4 flex items-center justify-between text-start transition-all ${
                    lang === l ? 'border-primary-400 bg-primary-50' : 'hover:shadow-pop'
                  }`}
                >
                  <div>
                    <p className="font-bold text-neutral-900">{LANG_LABELS[l].native}</p>
                    <p className="text-xs text-neutral-400">{LANG_LABELS[l].en}</p>
                  </div>
                  {lang === l && (
                    <span className="w-6 h-6 rounded-full bg-primary-600 grid place-items-center">
                      <Check className="w-4 h-4 text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Section>

          {/* Sound */}
          <Section icon={<Volume2 className="w-4 h-4 text-info-600" />} title={t('settings.sound')}>
            <ToggleRow
              label={t('settings.soundEffects')}
              value={soundOn}
              onToggle={toggleSound}
            />
          </Section>

          {/* Speech */}
          <Section icon={<Gauge className="w-4 h-4 text-accent-600" />} title={t('settings.speech')}>
            <div className="card p-4">
              <p className="text-sm font-semibold text-neutral-800 mb-3">{t('settings.speechRate')}</p>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'normal', 'fast'] as const).map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      speechRate === rate
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {t(`settings.${rate}` as never)}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Daily goal */}
          <Section icon={<Target className="w-4 h-4 text-primary-600" />} title={t('settings.dailyGoal')}>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-neutral-800">1 {t('lesson.practice')}</span>
                <span className="text-xs text-neutral-400">/ day</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full rounded-full bg-primary-500" style={{ width: '100%' }} />
              </div>
            </div>
          </Section>

          {/* Accessibility */}
          <Section icon={<Accessibility className="w-4 h-4 text-info-600" />} title={t('settings.accessibility')}>
            <ToggleRow
              label={t('settings.reducedMotion')}
              value={reducedMotion}
              onToggle={() => setReducedMotion((r) => !r)}
            />
          </Section>

          {/* Theme (planned) */}
          <Section icon={<Palette className="w-4 h-4 text-neutral-600" />} title={t('settings.theme')}>
            <div className="card p-4 text-sm text-neutral-400 text-center">{t('common.loading')}</div>
          </Section>

          {/* Data management */}
          <Section icon={<Database className="w-4 h-4 text-warning-600" />} title={t('settings.dataManagement')}>
            <button
              className="card w-full p-4 flex items-center gap-3 text-start hover:shadow-pop transition-all"
            >
              <Download className="w-5 h-5 text-info-500" />
              <span className="flex-1 font-semibold text-neutral-800 text-sm">{t('settings.exportData')}</span>
            </button>
            <button
              onClick={() => {
                if (confirm(t('settings.resetConfirm'))) reset();
              }}
              className="card w-full p-4 flex items-center gap-3 text-start hover:shadow-pop transition-all mt-2"
            >
              <RotateCw className="w-5 h-5 text-error-500" />
              <span className="flex-1 font-semibold text-error-600 text-sm">{t('settings.resetProgress')}</span>
            </button>
          </Section>

          {/* Account */}
          <Section icon={<User className="w-4 h-4 text-neutral-600" />} title={t('settings.account')}>
            <div className="card p-4 flex items-center justify-between">
              <span className="text-sm text-neutral-600">{t('profile.accountStatus')}</span>
              <span className="chip bg-neutral-100 text-neutral-600 text-xs font-semibold">Guest</span>
            </div>
          </Section>
        </div>
      </div>
    </SceneBackground>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-base font-bold mb-3 flex items-center gap-2 text-neutral-900">
        <span className="w-7 h-7 rounded-lg bg-neutral-100 grid place-items-center">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  return (
    <div className="card p-4 flex items-center justify-between">
      <span className="font-semibold text-neutral-800 text-sm">{label}</span>
      <button
        onClick={onToggle}
        className={`w-12 h-7 rounded-full relative transition-colors ${value ? 'bg-primary-500' : 'bg-neutral-300'}`}
        aria-label={value ? t('settings.on') : t('settings.off')}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${
            value ? 'end-0.5' : 'start-0.5'
          }`}
        />
      </button>
    </div>
  );
}
