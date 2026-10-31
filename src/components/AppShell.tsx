import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { Flame, Gem, Home, Map, Route as RouteIcon, User, Dumbbell, RotateCw, BarChart3 } from 'lucide-react';
import { navigate, type Route } from '@/router/routes';
import type { ReactNode } from 'react';

const TAB_ROUTES: { route: Route; icon: typeof Home; key: 'nav.home' | 'nav.drills' | 'nav.review' | 'nav.profile' }[] = [
  { route: { name: 'home' }, icon: Home, key: 'nav.home' },
  { route: { name: 'drills' }, icon: Dumbbell, key: 'nav.drills' },
  { route: { name: 'revision' }, icon: RotateCw, key: 'nav.review' },
  { route: { name: 'progress' }, icon: BarChart3, key: 'nav.profile' },
  { route: { name: 'profile' }, icon: User, key: 'nav.profile' },
];

interface AppShellProps {
  route: Route;
  children: ReactNode;
}

export function AppShell({ route, children }: AppShellProps) {
  const isWelcome = route.name === 'welcome';
  if (isWelcome) return <div className="app-shell">{children}</div>;

  return (
    <div className="app-shell">
      <TopBar routeName={route.name} />
      <main className="page">{children}</main>
      <BottomNav active={route.name} />
    </div>
  );
}

function TopBar({ routeName }: { routeName: string }) {
  const { progress } = useProgress();
  const level = Math.floor(progress.totalXp / 100) + 1;

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-neutral-100">
      <div className="max-w-30rem mx-auto flex items-center justify-between px-4 h-14" style={{ maxWidth: '30rem' }}>
        <button
          onClick={() => navigate({ name: 'home' })}
          className="flex items-center gap-2 font-display font-extrabold text-primary-700"
        >
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm shadow-card">
            LQ
          </span>
          <span className="hidden sm:inline">Lingua Quest</span>
        </button>
        <div className="flex items-center gap-2">
          <Stat icon={<Flame className="w-4 h-4 text-accent-500" />} value={progress.streak} />
          <Stat icon={<Gem className="w-4 h-4 text-info-500" />} value={progress.totalXp} />
          <div className="flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1">
            <span className="text-sm font-bold text-primary-700">{level}</span>
          </div>
          <span className="sr-only">{routeName}</span>
        </div>
      </div>
    </header>
  );
}

function Stat({ icon, value }: { icon: ReactNode; value: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1">
      {icon}
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  const { t } = useI18n();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-neutral-100"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="max-w-30rem mx-auto flex" style={{ maxWidth: '30rem' }}>
        {TAB_ROUTES.map(({ route, icon: Icon, key }) => {
          const isActive = active === route.name;
          return (
            <button
              key={key + route.name}
              onClick={() => navigate(route)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive ? 'text-primary-700' : 'text-neutral-400 hover:text-neutral-600'
              }`}
              aria-label={t(key)}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{t(key)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
