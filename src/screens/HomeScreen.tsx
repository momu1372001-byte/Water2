import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { Flame, Gem, ChevronRight, BookOpen, Map as MapIcon, Trophy, Calendar } from 'lucide-react';

export function HomeScreen() {
  const { t, lt } = useI18n();
  const { progress, orderedLessons, statusOf } = useProgress();
  const registry = loadRegistry();

  // Find the next unlocked, not-completed lesson.
  const nextLesson = orderedLessons.find(
    (id) => statusOf(id) === 'unlocked',
  );

  const completedCount = orderedLessons.filter(
    (id) => statusOf(id) === 'completed',
  ).length;
  const totalCount = orderedLessons.length;
  const dailyGoal = 1;
  const goalProgress = Math.min(100, (completedCount / dailyGoal) * 100);

  const unit = registry.units[0];
  const course = registry.course;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-neutral-900">{lt(course.title)}</h1>
        <p className="text-neutral-500">{lt(course.description)}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Flame className="w-5 h-5 text-accent-500" />} value={progress.streak} label={t('home.streak')} />
        <StatCard icon={<Gem className="w-5 h-5 text-info-500" />} value={progress.totalXp} label={t('home.xp')} />
        <StatCard icon={<Trophy className="w-5 h-5 text-primary-600" />} value={completedCount} label={t('profile.lessons')} />
      </div>

      {/* Continue card */}
      {nextLesson ? (
        <ContinueCard lessonId={nextLesson} />
      ) : (
        <div className="card p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-semibold text-neutral-800">{t('lesson.complete')}</p>
        </div>
      )}

      {/* Daily goal */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-neutral-800">{t('home.dailyGoal')}</span>
          </div>
          <span className="text-sm text-neutral-500 tabular-nums">{completedCount}/{totalCount}</span>
        </div>
        <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
          <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${goalProgress}%` }} />
        </div>
      </div>

      {/* Units overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold text-neutral-900">{t('home.units')}</h2>
          <button onClick={() => navigate({ name: 'path' })} className="text-sm text-primary-600 font-semibold flex items-center gap-0.5">
            {t('nav.path')} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {registry.units.map((u) => {
            const topicCount = u.topicIds.length;
            return (
              <button
                key={u.id}
                onClick={() => navigate({ name: 'path' })}
                className="card w-full p-4 flex items-center gap-4 text-start hover:shadow-pop transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-100 grid place-items-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 truncate">{lt(u.title)}</p>
                  <p className="text-xs text-neutral-500">{topicCount} {t('path.topic')}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="card p-3 flex flex-col items-center text-center">
      {icon}
      <span className="text-lg font-extrabold tabular-nums mt-1">{value}</span>
      <span className="text-[11px] text-neutral-500 leading-tight">{label}</span>
    </div>
  );
}

function ContinueCard({ lessonId }: { lessonId: string }) {
  const { t, lt } = useI18n();
  const registry = loadRegistry();
  const lesson = registry.lessons[lessonId];
  if (!lesson) return null;
  return (
    <button
      onClick={() => navigate({ name: 'lesson', lessonId })}
      className="card w-full p-5 flex items-center gap-4 bg-primary-50 border-primary-200 hover:shadow-pop transition-all"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary-600 grid place-items-center shrink-0">
        <MapIcon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1 text-start">
        <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">{t('home.continue')}</p>
        <p className="font-bold text-neutral-900">{lt(lesson.title)}</p>
      </div>
      <ChevronRight className="w-6 h-6 text-primary-600 shrink-0" />
    </button>
  );
}
