import { Session, User, WeakPassword } from '@supabase/supabase-js';

import { supabase } from './supabase';

export type SignUpPayload = {
  email: string;
  password: string;
  fullName: string;
  avatar?: string;
};
export const signUp = async (
  payload: SignUpPayload
): Promise<{
  user: User;
  session: Session;
}> => {
  const { email, password, fullName, avatar } = payload;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar,
      },
    },
  });

  if (error) {
    throw new Error('Could not sign up: ' + error.message);
  }

  return data as {
    user: User;
    session: Session;
  };
};

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

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error('Could not sign out: ' + error);
  }
};
