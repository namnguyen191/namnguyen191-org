import { Session, User, WeakPassword } from '@supabase/supabase-js';

import { supabase } from './supabase';

export const login = async (params: {
  email: string;
  password: string;
}): Promise<{ user: User; session: Session; weakPassword?: WeakPassword | undefined }> => {
  const { email, password } = params;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data) {
    throw new Error('Fail to login');
  }

  return data;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (!sessionData.session || sessionError) {
    return null;
  }

  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user.user) {
    throw new Error('Something went wrong fetching user: ' + error);
  }

  return user.user;
};
