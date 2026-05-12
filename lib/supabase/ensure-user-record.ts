import { createSupabaseBrowserClient } from './client';

export type ChallengeUserRecord = {
  id: string;
  email: string;
  username: string;
  name: string;
  dob?: string | null;
  onboarding_complete: boolean;
  onboarding_draft?: unknown;
};

function fallbackUsername(email: string, id: string) {
  return String(email.split('@')[0] || `user_${id.slice(0, 6)}`)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 20);
}

function cleanUsername(value: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);

  return cleaned.length >= 3 ? cleaned : `user_${Math.random().toString(36).slice(2, 8)}`;
}

function usernameWithSuffix(base: string, id: string, attempt: number) {
  if (attempt === 0) return base;
  const suffix = `_${id.slice(0, 4)}${attempt}`;
  return `${base.slice(0, Math.max(3, 20 - suffix.length))}${suffix}`;
}

export function defaultOnboardingDraft(name = '') {
  return {
    name,
    age: '',
    height: '',
    currentWeight: '',
    goalWeight: '',
    startDate: '',
    endDate: '',
    wakeTime: '',
    sleepGoal: '8',
    currentHifdh: '',
    goalHifdh: '',
    quranDailyTarget: '5 lines',
    quranReviewTarget: '1 page',
    calorieTarget: '2200',
    stepTarget: '10000',
    waterTarget: '5',
    exerciseLevel: 'Beginner',
    preferredExercise: 'Walking + bodyweight',
    limitations: '',
    spendingLimit: '300',
    restaurantLimit: '4',
    screenLimit: '3',
    tvLimit: '3',
    personalGoals: [
      { name: '', endGoal: '', dailyTask: '', frequency: '', tracking: 'Checklist' },
      { name: '', endGoal: '', dailyTask: '', frequency: '', tracking: 'Checklist' },
    ],
  };
}

export async function ensureUserRecord(authUser: {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
}): Promise<ChallengeUserRecord> {
  const supabase = createSupabaseBrowserClient();
  const { data: existing, error: existingError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing as ChallengeUserRecord;

  const metadata = authUser.user_metadata || {};
  const email = authUser.email || '';
  const name = String(metadata.name || 'New Challenger');
  const baseUsername = cleanUsername(String(metadata.username || fallbackUsername(email, authUser.id)));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const username = usernameWithSuffix(baseUsername, authUser.id, attempt);
    const row = {
      id: authUser.id,
      email,
      username,
      name,
      dob: metadata.dob || null,
      role: 'user',
      email_verified: Boolean(authUser.email_confirmed_at),
      onboarding_complete: false,
      onboarding_draft: defaultOnboardingDraft(name),
    };

    const { data, error } = await supabase.from('users').insert(row).select('*').single();
    if (!error) return data as ChallengeUserRecord;

    const isDuplicateUsername = error.code === '23505' && String(error.message || '').includes('users_username_key');
    if (!isDuplicateUsername) throw error;
  }

  throw new Error('Username is already taken. Please log in or pick a different username.');
}
