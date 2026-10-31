import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { SceneBackground } from '@/components/SceneBackground';
import { Flame, Gem, ChevronRight, BookOpen, Map as MapIcon, Trophy, Calendar, Target, Sparkles } from 'lucide-react';

export function HomeScreen() {
  const { t, lt } = useI18n();
  const { progress, orderedLessons, statusOf } = useProgress();
  const registry = loadRegistry();

  const nextLesson = orderedLessons.find((id) => statusOf(id) === 'unlocked');
  const completedCount = orderedLessons.filter((id) => statusOf(id) === 'completed').length;
  const totalCount = orderedLessons.length;
  const dailyGoal = 1;
  const goalProgress = Math.min(100, (completedCount / dailyGoal) * 100);
  const goalReached = goalProgress >= 100;
  const level = Math.floor(progress.totalXp / 100) + 1;

  const course = registry.course;

  return (
    <SceneBackground>
      <div className="space-y-6">
        {/* Greeting header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-neutral-900">
              {t('home.welcomeBack')}
            </h1>
            <p className="text-neutral-500 text-sm">{t('home.readyToLearn')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 grid place-items-center text-white shadow-card">
              <span className="font-extrabold text-lg">{level}</span>
            </div>
          </div>
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
          <div className="card p-6 text-center bg-gradient-to-br from-primary-50 to-white border-primary-200">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-semibold text-neutral-800">{t('lesson.complete')}</p>
          </div>
        )}

        {/* Daily goal */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-100 grid place-items-center">
                <Target className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800 text-sm">{t('home.dailyGoal')}</p>
                <p className="text-[11px] text-neutral-400">{completedCount} / {totalCount}</p>
              </div>
            </div>
            <span className={`chip ${goalReached ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'}`}>
              {goalReached ? t('home.goalReached') : t('home.keepGoing')}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate({ name: 'revision' })}
            className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-pop transition-all active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-2xl bg-accent-100 grid place-items-center">
              <Calendar className="w-5 h-5 text-accent-600" />
            </div>
            <span className="text-sm font-bold text-neutral-800">{t('nav.review')}</span>
          </button>
          <button
            onClick={() => navigate({ name: 'progress' })}
            className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-pop transition-all active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-2xl bg-info-100 grid place-items-center">
              <Trophy className="w-5 h-5 text-info-600" />
            </div>
            <span className="text-sm font-bold text-neutral-800">{t('progress.title')}</span>
          </button>
        </div>

        {/* Units overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-neutral-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              {lt(course.title)}
            </h2>
            <button onClick={() => navigate({ name: 'path' })} className="text-sm text-primary-600 font-semibold flex items-center gap-0.5">
              {t('home.viewPath')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {registry.units.map((u) => {
              const topicCount = u.topicIds.length;
              const unitLessons = u.topicIds.flatMap((tid) => {
                const topic = registry.topics.find((tp) => tp.id === tid);
                return topic?.lessonIds ?? [];
              });
              const unitCompleted = unitLessons.filter((id) => statusOf(id) === 'completed').length;
              const unitPct = unitLessons.length > 0 ? Math.round((unitCompleted / unitLessons.length) * 100) : 0;

              return (
                <button
                  key={u.id}
                  onClick={() => navigate({ name: 'path' })}
                  className="card w-full p-4 flex items-center gap-4 text-start hover:shadow-pop transition-all active:scale-[0.98]"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 grid place-items-center shrink-0">
                    <BookOpen className="w-7 h-7 text-primary-700" />
                    <div className="absolute -bottom-1 -end-1 w-5 h-5 rounded-full bg-accent-400 text-white text-[10px] font-bold grid place-items-center shadow-card">
                      {unitPct}%
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-neutral-900 truncate">{lt(u.title)}</p>
                    <p className="text-xs text-neutral-500">{topicCount} {t('path.topic')} · {unitCompleted}/{unitLessons.length} {t('path.done')}</p>
                    {/* Mini progress bar */}
                    <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden mt-2">
                      <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${unitPct}%` }} />
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommended path shortcut */}
        <button
          onClick={() => navigate({ name: 'path' })}
          className="card w-full p-5 flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-800 border-0 text-white hover:shadow-pop transition-all active:scale-[0.98]"
        >
          <MapIcon className="w-6 h-6 text-white shrink-0" />
          <div className="flex-1 text-start">
            <p className="font-bold">{t('path.title')}</p>
            <p className="text-sm text-primary-100">{t('home.recommended')}</p>
          </div>
          <Sparkles className="w-5 h-5 text-accent-300" />
        </button>
      </div>
    </SceneBackground>
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
      className="card w-full p-5 flex items-center gap-4 bg-gradient-to-r from-primary-50 to-white border-primary-200 hover:shadow-pop transition-all active:scale-[0.98]"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 grid place-items-center shrink-0 shadow-card">
        <MapIcon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1 text-start">
        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {t('home.continue')}
        </p>
        <p className="font-bold text-neutral-900">{lt(lesson.title)}</p>
        <p className="text-xs text-neutral-500">{lesson.practice.questions.length} {t('lesson.questions')}</p>
      </div>
      <ChevronRight className="w-6 h-6 text-primary-600 shrink-0" />
    </button>
  );
}
