import { useI18n } from '@/i18n/I18nContext';
import { useProgress } from '@/state/ProgressContext';
import { loadRegistry } from '@/content/registry';
import { navigate } from '@/router/routes';
import { PageHeader } from '@/components/PageHeader';
import { RotateCw, BookOpen, Lock } from 'lucide-react';

/**
 * Revision hub: collects vocabulary from all completed lessons and offers
 * a quick review. Spaced-repetition scheduling is planned for a later prompt;
 * for now, this surface shows completed vocabulary and routes to study.
 */
export function RevisionScreen() {
  const { t, lt } = useI18n();
  const { statusOf } = useProgress();
  const registry = loadRegistry();

  const completedLessons = Object.values(registry.lessons).filter(
    (l) => statusOf(l.id) === 'completed',
  );
  const allVocab = completedLessons.flatMap((l) => l.vocabulary);

  return (
    <div>
      <PageHeader title={t('topic.review')} />
      {allVocab.length === 0 ? (
        <div className="card p-8 text-center">
          <Lock className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-semibold">{t('path.locked')}</p>
          <p className="text-sm text-neutral-400 mt-1">{t('topic.lessons')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card p-4 flex items-center gap-3 bg-primary-50 border-primary-200">
            <RotateCw className="w-6 h-6 text-primary-700" />
            <div>
              <p className="font-bold text-neutral-900">{allVocab.length} words</p>
              <p className="text-xs text-neutral-500">{t('topic.review')}</p>
            </div>
          </div>

          {completedLessons.map((lesson) => (
            <div key={lesson.id}>
              <h2 className="font-semibold text-neutral-700 mb-2 px-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-600" />
                {lt(lesson.title)}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {lesson.vocabulary.map((v) => (
                  <div key={v.id} className="card p-3 flex items-center gap-2">
                    <span className="text-xl">{v.emoji ?? '🔤'}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-neutral-900 truncate">{v.word}</p>
                      <p className="text-xs text-neutral-500 truncate">{lt(v.translations)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate({ name: 'study', lessonId: lesson.id })}
                className="btn-secondary w-full mt-2 text-sm"
              >
                {t('lesson.study')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
