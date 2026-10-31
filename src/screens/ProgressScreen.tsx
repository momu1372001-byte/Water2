import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { PageHeader } from '@/components/PageHeader';
import { SceneBackground } from '@/components/SceneBackground';
import { ProgressRing } from '@/components/ProgressRing';
import { Flame, Gem, BookOpen, Target, Clock, Trophy, Lock, Star, TrendingUp } from 'lucide-react';
import type { UiKey } from '@/i18n/keys';

export function ProgressScreen() {
  const { t, lt } = useI18n();
  const { progress, statusOf, orderedLessons } = useProgress();
  const registry = loadRegistry();

  const completed = orderedLessons.filter((id) => statusOf(id) === 'completed');
  const completedCount = completed.length;
  const totalCount = orderedLessons.length;
  const allVocab = completed
    .map((id) => registry.lessons[id]?.vocabulary ?? [])
    .flat();
  const wordsLearned = allVocab.length;
  const totalAccuracy = completed.reduce((sum, id) => sum + (progress.lessons[id]?.bestAccuracy ?? 0), 0);
  const avgAccuracy = completedCount > 0 ? Math.round((totalAccuracy / completedCount) * 100) : 0;
  const level = Math.floor(progress.totalXp / 100) + 1;

  // Weekly activity (simulated from streak + lastActiveDate)
  const weekDays: UiKey[] = ['progress.mon', 'progress.tue', 'progress.wed', 'progress.thu', 'progress.fri', 'progress.sat', 'progress.sun'];
  const today = new Date().getDay(); // 0=Sun..6=Sat
  const dayIndex = today === 0 ? 6 : today - 1; // Mon=0..Sun=6
  const weekBars = weekDays.map((d, i) => ({
    label: t(d),
    active: i <= dayIndex && progress.streak > 0 && i >= dayIndex - (progress.streak % 7) + (dayIndex - dayIndex),
    height: i === dayIndex && progress.lastActiveDate === new Date().toISOString().slice(0, 10) ? 100 : i < dayIndex && progress.streak > 0 ? 60 + (i % 3) * 15 : 10,
  }));

  // Achievements
  const achievements = [
    { key: 'progress.achievementFirst' as UiKey, unlocked: completedCount >= 1, icon: '🎯' },
    { key: 'progress.achievementStreak3' as UiKey, unlocked: progress.streak >= 3, icon: '🔥' },
    { key: 'progress.achievementStreak7' as UiKey, unlocked: progress.streak >= 7, icon: '⚡' },
    { key: 'progress.achievementPerfect' as UiKey, unlocked: completed.some((id) => progress.lessons[id]?.bestAccuracy === 1), icon: '⭐' },
    { key: 'progress.achievementWords50' as UiKey, unlocked: wordsLearned >= 50, icon: '📚' },
    { key: 'progress.achievementWords100' as UiKey, unlocked: wordsLearned >= 100, icon: '🏆' },
  ];

  const learningTime = completedCount * 5; // ~5 min per lesson estimate

  return (
    <SceneBackground>
      <div>
        <PageHeader title={t('progress.title')} backTo={{ name: 'home' }} />

        {/* Level + XP hero card */}
        <div className="card p-6 mb-5 bg-gradient-to-br from-primary-600 to-primary-800 border-0 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ProgressRing progress={(progress.totalXp % 100)} size={72} strokeWidth={5} className="text-white">
              <span className="text-2xl font-extrabold text-white">{level}</span>
            </ProgressRing>
          </div>
          <p className="text-sm font-semibold text-primary-100 uppercase tracking-wide">{t('profile.level')}</p>
          <p className="text-3xl font-extrabold mt-1">{progress.totalXp} {t('home.xp')}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard icon={<BookOpen className="w-5 h-5 text-primary-600" />} value={wordsLearned} label={t('progress.wordsLearned')} />
          <StatCard icon={<Trophy className="w-5 h-5 text-accent-500" />} value={completedCount} label={t('progress.lessonsCompleted')} />
          <StatCard icon={<Target className="w-5 h-5 text-info-500" />} value={`${avgAccuracy}%`} label={t('progress.accuracy')} />
          <StatCard icon={<Flame className="w-5 h-5 text-error-500" />} value={progress.streak} label={t('progress.streak')} />
        </div>

        {/* Weekly activity */}
        <div className="card p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="font-display text-base font-bold text-neutral-900">{t('progress.weeklyActivity')}</h2>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-32">
            {weekBars.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${d.active ? 'bg-primary-500' : 'bg-neutral-200'}`}
                    style={{ height: `${d.height}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-neutral-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning time */}
        <div className="card p-5 mb-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-info-100 grid place-items-center shrink-0">
            <Clock className="w-6 h-6 text-info-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-neutral-900">{learningTime} <span className="text-sm font-normal text-neutral-500">{t('profile.minutes')}</span></p>
            <p className="text-xs text-neutral-500">{t('progress.learningTime')}</p>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <Gem className="w-5 h-5 text-accent-500" />
            {t('progress.achievements')}
          </h2>
          {achievements.every((a) => !a.unlocked) ? (
            <div className="card p-6 text-center text-neutral-400">
              <Star className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
              <p className="text-sm font-medium">{t('progress.noAchievements')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((a) => (
                <div
                  key={a.key}
                  className={`card p-4 flex flex-col items-center text-center transition-all ${
                    a.unlocked ? 'border-primary-200 bg-primary-50' : 'opacity-50'
                  }`}
                >
                  <span className="text-3xl mb-1">{a.unlocked ? a.icon : '🔒'}</span>
                  <span className="text-[11px] font-semibold text-neutral-600 leading-tight">{t(a.key)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SceneBackground>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="card p-4">
      <div className="mb-1.5">{icon}</div>
      <p className="text-2xl font-extrabold tabular-nums text-neutral-900">{value}</p>
      <p className="text-[11px] text-neutral-500 leading-tight">{label}</p>
    </div>
  );
}
