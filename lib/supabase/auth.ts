import { createSupabaseBrowserClient } from './client';

export type SignUpInput = {
  email: string;
  password: string;
  name: string;
  username: string;
  dob?: string;
};

export async function signUpWithEmail(input: SignUpInput) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
        username: input.username,
        dob: input.dob,
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email: input.email,
      username: input.username,
      name: input.name,
      dob: input.dob || null,
      role: 'user',
      onboarding_complete: false,
      email_verified: false,
    });

    if (profileError) throw profileError;
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUserProfile() {
  const supabase = createSupabaseBrowserClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) throw profileError;
  return profile;
}
