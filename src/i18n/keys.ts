/**
 * UI string keys for the learner interface. Add a key here when a screen
 * needs a new translatable label; provide values in all interface languages.
 */
export const UI_KEYS = [
  'app.name',
  'app.tagline',
  'nav.home',
  'nav.path',
  'nav.profile',
  'nav.settings',
  'welcome.title',
  'welcome.subtitle',
  'welcome.cta',
  'welcome.guest',
  'home.streak',
  'home.xp',
  'home.continue',
  'home.units',
  'home.dailyGoal',
  'path.title',
  'path.unit',
  'path.topic',
  'path.lesson',
  'path.locked',
  'path.done',
  'topic.lessons',
  'topic.start',
  'topic.review',
  'lesson.practice',
  'lesson.study',
  'lesson.questions',
  'lesson.start',
  'lesson.resume',
  'lesson.complete',
  'practice.check',
  'practice.skip',
  'practice.correct',
  'practice.incorrect',
  'practice.next',
  'practice.finish',
  'practice.progress',
  'study.flip',
  'study.next',
  'study.prev',
  'study.done',
  'study.know',
  'study.dontKnow',
  'auth.signIn',
  'auth.signUp',
  'auth.email',
  'auth.password',
  'auth.continueGuest',
  'auth.migrateTitle',
  'auth.migrateBody',
  'settings.language',
  'settings.sound',
  'settings.theme',
  'profile.guest',
  'profile.member',
  'profile.stats',
  'profile.lessons',
  'profile.streak',
  'profile.xp',
  'common.back',
  'common.loading',
  'common.error',
  'common.retry',
] as const;

export type UiKey = (typeof UI_KEYS)[number];

export type InterfaceLanguage = 'ar' | 'fr' | 'hi';

export const INTERFACE_LANGUAGES: InterfaceLanguage[] = ['ar', 'fr', 'hi'];

export const RTL_LANGUAGES: InterfaceLanguage[] = ['ar'];

export function isRTL(lang: InterfaceLanguage): boolean {
  return RTL_LANGUAGES.includes(lang);
}
