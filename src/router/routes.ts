/**
 * Tiny dependency-free hash router. Suitable for the guest-first single-page
 * experience. Routes:
 *
 *   #/welcome
 *   #/home
 *   #/path
 *   #/topic/:topicId
 *   #/lesson/:lessonId        (lesson selection: practice vs study)
 *   #/practice/:lessonId
 *   #/study/:lessonId
 *   #/drills                  (practice hub: current lessons, available sessions)
 *   #/revision                (review hub: due/weak/incorrect words)
 *   #/progress                (progress dashboard)
 *   #/exam/:unitId
 *   #/profile
 *   #/settings
 *   #/auth
 */

export type Route =
  | { name: 'welcome' }
  | { name: 'home' }
  | { name: 'path' }
  | { name: 'topic'; topicId: string }
  | { name: 'lesson'; lessonId: string }
  | { name: 'practice'; lessonId: string }
  | { name: 'study'; lessonId: string }
  | { name: 'drills' }
  | { name: 'revision' }
  | { name: 'progress' }
  | { name: 'exam'; unitId: string }
  | { name: 'profile' }
  | { name: 'settings' }
  | { name: 'auth' };

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#/, '').replace(/^\//, '');
  const parts = clean.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'welcome' };
  switch (parts[0]) {
    case 'welcome': return { name: 'welcome' };
    case 'home': return { name: 'home' };
    case 'path': return { name: 'path' };
    case 'topic': return parts[1] ? { name: 'topic', topicId: parts[1] } : { name: 'path' };
    case 'lesson': return parts[1] ? { name: 'lesson', lessonId: parts[1] } : { name: 'path' };
    case 'practice': return parts[1] ? { name: 'practice', lessonId: parts[1] } : { name: 'path' };
    case 'study': return parts[1] ? { name: 'study', lessonId: parts[1] } : { name: 'path' };
    case 'drills': return { name: 'drills' };
    case 'revision': return { name: 'revision' };
    case 'progress': return { name: 'progress' };
    case 'exam': return parts[1] ? { name: 'exam', unitId: parts[1] } : { name: 'path' };
    case 'profile': return { name: 'profile' };
    case 'settings': return { name: 'settings' };
    case 'auth': return { name: 'auth' };
    default: return { name: 'welcome' };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'welcome': return '#/welcome';
    case 'home': return '#/home';
    case 'path': return '#/path';
    case 'topic': return `#/topic/${route.topicId}`;
    case 'lesson': return `#/lesson/${route.lessonId}`;
    case 'practice': return `#/practice/${route.lessonId}`;
    case 'study': return `#/study/${route.lessonId}`;
    case 'drills': return '#/drills';
    case 'revision': return '#/revision';
    case 'progress': return '#/progress';
    case 'exam': return `#/exam/${route.unitId}`;
    case 'profile': return '#/profile';
    case 'settings': return '#/settings';
    case 'auth': return '#/auth';
  }
}

export function navigate(route: Route): void {
  window.location.hash = routeToHash(route);
}
