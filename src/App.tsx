import { I18nProvider } from '@/i18n/I18nContext';
import { ProgressProvider } from '@/state/ProgressContext';
import { AppShell } from '@/components/AppShell';
import { useRoute } from '@/router/useRoute';
import type { Route } from '@/router/routes';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { LearningPathScreen } from '@/screens/LearningPathScreen';
import { TopicDetailScreen } from '@/screens/TopicDetailScreen';
import { LessonScreen } from '@/screens/LessonScreen';
import { PracticeScreen } from '@/screens/PracticeScreen';
import { StudyScreen } from '@/screens/StudyScreen';
import { DrillsScreen } from '@/screens/DrillsScreen';
import { RevisionScreen } from '@/screens/RevisionScreen';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { ExamScreen } from '@/screens/ExamScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { AuthScreen } from '@/screens/AuthScreen';

function renderRoute(route: Route) {
  switch (route.name) {
    case 'welcome': return <WelcomeScreen />;
    case 'home': return <HomeScreen />;
    case 'path': return <LearningPathScreen />;
    case 'topic': return <TopicDetailScreen topicId={route.topicId} />;
    case 'lesson': return <LessonScreen lessonId={route.lessonId} />;
    case 'practice': return <PracticeScreen lessonId={route.lessonId} />;
    case 'study': return <StudyScreen lessonId={route.lessonId} />;
    case 'drills': return <DrillsScreen />;
    case 'revision': return <RevisionScreen />;
    case 'progress': return <ProgressScreen />;
    case 'exam': return <ExamScreen unitId={route.unitId} />;
    case 'profile': return <ProfileScreen />;
    case 'settings': return <SettingsScreen />;
    case 'auth': return <AuthScreen />;
    default: return <HomeScreen />;
  }
}

function App() {
  const route = useRoute();
  const isPractice = route.name === 'practice';

  // Practice uses a full-bleed layout (no AppShell chrome).
  if (isPractice) {
    return (
      <I18nProvider>
        <ProgressProvider>
          <PracticeScreen lessonId={route.name === 'practice' ? route.lessonId : ''} />
        </ProgressProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <ProgressProvider>
        <AppShell route={route}>{renderRoute(route)}</AppShell>
      </ProgressProvider>
    </I18nProvider>
  );
}

export default App;
