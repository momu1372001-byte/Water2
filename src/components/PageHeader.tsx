import { navigate } from '@/router/routes';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: Parameters<typeof navigate>[0];
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, backTo, right }: PageHeaderProps) {
  const { dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowLeft : ArrowLeft;
  return (
    <div className="flex items-start gap-3 mb-5">
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          className="mt-1 grid place-items-center w-9 h-9 rounded-full bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors shrink-0"
          aria-label="back"
        >
          <BackIcon className={`w-5 h-5 ${dir === 'rtl' ? '' : 'rotate-180'}`} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-xl font-extrabold text-neutral-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
