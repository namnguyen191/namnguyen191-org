import { Session, User, UserAttributes, WeakPassword } from '@supabase/supabase-js';

import { supabase, supabaseUrl } from './supabase';

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

export type UpdateCurrentUserPayload = {
  fullName?: string;
  avatar?: File;
  password?: string;
};

export const updateCurrentUser = async (
  payload: UpdateCurrentUserPayload
): Promise<
  | {
      user: User;
    }
  | undefined
> => {
  const { fullName, avatar, password } = payload;

  let updatedUser: UserAttributes = {};

  if (fullName) {
    updatedUser = { data: { fullName } };
  }

  if (password) {
    updatedUser = { ...updatedUser, password };
  }

  const { data, error: updateUserError } = await supabase.auth.updateUser(updatedUser);

  if (updateUserError) {
    throw new Error(updateUserError.message);
  }

  if (!avatar) {
    return data;
  }

  const fileName = `avatar-${data.user.id}-${Math.random()}`;
  const { error: avatarUploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, avatar);

  if (avatarUploadError) {
    throw new Error(avatarUploadError.message);
  }

  const { data: userWithAvatar, error: updateUserAvatarError } = await supabase.auth.updateUser({
    data: {
      avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
    },
  });

  if (updateUserAvatarError) {
    throw new Error(updateUserAvatarError.message);
  }

  return userWithAvatar;
};
