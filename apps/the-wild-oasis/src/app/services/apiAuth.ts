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
