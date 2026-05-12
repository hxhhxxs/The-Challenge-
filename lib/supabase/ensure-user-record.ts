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
  const username = String(metadata.username || fallbackUsername(email, authUser.id))
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 20);

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
  if (error) throw error;
  return data as ChallengeUserRecord;
}
