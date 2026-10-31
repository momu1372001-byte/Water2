import type { ProgressState } from './progression';
import { getSupabase } from '@/lib/supabase';

/**
 * Guest-to-account migration.
 *
 * When a guest signs in, we transfer their locally-stored progress to the
 * server. Strategy:
 *   1. Upsert the user profile row with XP + streak.
 *   2. Upsert per-lesson progress rows.
 *   3. On success, clear the local guest store (done by caller via reset).
 *
 * This is intentionally optimistic: if the server write fails, the guest
 * progress remains on the device and the caller can retry. We never delete
 * local data before a confirmed server write.
 *
 * NOTE: This requires the `profiles` and `lesson_progress` tables to exist.
 * The migration is a no-op when Supabase is not configured (guest-only mode);
 * local progress is preserved and the account flag is flipped in-memory only.
 */
export async function migrateGuestToAccount(
  guest: ProgressState,
  userId: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    // Guest-only mode: nothing to write. Local progress stays.
    return;
  }

  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    total_xp: guest.totalXp,
    streak: guest.streak,
    interface_language: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (profileErr) {
    // Don't throw — keep local progress intact.
    console.warn('Profile upsert failed during migration:', profileErr.message);
    return;
  }

  const rows = Object.values(guest.lessons).map((l) => ({
    user_id: userId,
    lesson_id: l.lessonId,
    status: l.status,
    best_accuracy: l.bestAccuracy,
    xp: l.xp,
    last_attempted_at: l.lastAttemptedAt,
    attempts: l.attempts,
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from('lesson_progress')
      .upsert(rows, { onConflict: 'user_id,lesson_id' });
    if (error) {
      console.warn('Lesson progress upsert failed during migration:', error.message);
    }
  }
}
