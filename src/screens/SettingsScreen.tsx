import { useI18n } from '@/i18n/I18nContext';
import { PageHeader } from '@/components/PageHeader';
import { INTERFACE_LANGUAGES, type InterfaceLanguage } from '@/i18n/keys';
import { Volume2, Palette } from 'lucide-react';

const LANG_LABELS: Record<InterfaceLanguage, { native: string; en: string }> = {
  ar: { native: 'العربية', en: 'Arabic' },
  fr: { native: 'Français', en: 'French' },
  hi: { native: 'हिन्दी', en: 'Hindi' },
};

export function SettingsScreen() {
  const { t, lang, setLang } = useI18n();

  return (
    <div>
      <PageHeader title={t('nav.settings')} backTo={{ name: 'home' }} />
      <div className="space-y-6">
        {/* Interface language */}
        <section>
          <h2 className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary-100 grid place-items-center">
              <span className="text-sm">🌐</span>
            </span>
            {t('settings.language')}
          </h2>
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
                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Sound */}
        <section>
          <h2 className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-info-100 grid place-items-center">
              <Volume2 className="w-4 h-4 text-info-600" />
            </span>
            {t('settings.sound')}
          </h2>
          <ToggleRow label={t('settings.sound')} />
        </section>

        {/* Theme (planned) */}
        <section>
          <h2 className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-neutral-100 grid place-items-center">
              <Palette className="w-4 h-4 text-neutral-600" />
            </span>
            {t('settings.theme')}
          </h2>
          <div className="card p-4 text-sm text-neutral-400 text-center">{t('common.loading')}</div>
        </section>
      </div>
    </div>
  );
}

function ToggleRow({ label }: { label: string }) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <span className="font-semibold text-neutral-800">{label}</span>
      <button className="w-12 h-7 rounded-full bg-primary-500 relative transition-colors">
        <span className="absolute top-0.5 end-0.5 w-6 h-6 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}
