/**
 * XP + Streak system. Pure localStorage (zero backend).
 * Brilliant-inspired retention loop.
 */

const KEY_XP = 'yachaytree:xp';
const KEY_STREAK = 'yachaytree:streak';
const KEY_LESSONS = 'yachaytree:lessons-completed';
const KEY_AWARDED = 'yachaytree:xp-awarded'; // map of award-key → true (idempotency)

interface StreakState {
  count: number;
  lastDate: string; // YYYY-MM-DD
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getXP(): number {
  if (typeof localStorage === 'undefined') return 0;
  return Number(localStorage.getItem(KEY_XP) ?? '0') || 0;
}

export function getStreak(): StreakState {
  if (typeof localStorage === 'undefined') return { count: 0, lastDate: '' };
  return safeParse<StreakState>(localStorage.getItem(KEY_STREAK), { count: 0, lastDate: '' });
}

/**
 * Award XP idempotently. `awardKey` ensures same action doesn't double-award.
 * Returns the new total.
 */
export function awardXP(amount: number, awardKey: string): number {
  if (typeof localStorage === 'undefined') return 0;
  const awarded = safeParse<Record<string, boolean>>(localStorage.getItem(KEY_AWARDED), {});
  if (awarded[awardKey]) return getXP(); // already awarded
  awarded[awardKey] = true;
  localStorage.setItem(KEY_AWARDED, JSON.stringify(awarded));

  const current = getXP();
  const next = current + amount;
  localStorage.setItem(KEY_XP, String(next));
  bumpStreak();
  notifyXP(amount, next);
  return next;
}

function bumpStreak(): void {
  const today = todayISO();
  const streak = getStreak();
  if (streak.lastDate === today) return; // already counted today

  // Did user have activity yesterday? Then continue streak. Otherwise reset.
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;

  const next: StreakState = { count: newCount, lastDate: today };
  localStorage.setItem(KEY_STREAK, JSON.stringify(next));
  notifyStreak(newCount);
}

export function markLessonComplete(slug: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  const lessons = safeParse<string[]>(localStorage.getItem(KEY_LESSONS), []);
  if (lessons.includes(slug)) return false;
  lessons.push(slug);
  localStorage.setItem(KEY_LESSONS, JSON.stringify(lessons));
  awardXP(10, `lesson-complete:${slug}`);
  return true;
}

export function getLessonsCompleted(): string[] {
  if (typeof localStorage === 'undefined') return [];
  return safeParse<string[]>(localStorage.getItem(KEY_LESSONS), []);
}

/** Subscribe to XP/streak updates via custom events. */
function notifyXP(delta: number, total: number) {
  globalThis.dispatchEvent?.(new CustomEvent('yachaytree:xp', { detail: { delta, total } }));
}
function notifyStreak(count: number) {
  globalThis.dispatchEvent?.(new CustomEvent('yachaytree:streak', { detail: { count } }));
}

/** Reset (for debug or user-requested). */
export function resetProgress(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(KEY_XP);
  localStorage.removeItem(KEY_STREAK);
  localStorage.removeItem(KEY_LESSONS);
  localStorage.removeItem(KEY_AWARDED);
}
