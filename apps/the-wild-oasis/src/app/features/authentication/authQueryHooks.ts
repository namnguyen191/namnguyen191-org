import { Session, User } from '@supabase/supabase-js';
import { UseMutateFunction, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  signUp as signUpApi,
  SignUpPayload,
} from '../../services/apiAuth';

const USER_KEY = 'user';

export const useLogin = (): {
  readonly login: UseMutateFunction<unknown, Error, { email: string; password: string }, unknown>;
  readonly isLogingIn: boolean;
} => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: login, isPending: isLogingIn } = useMutation({
    mutationFn: (params: Parameters<typeof loginApi>[0]) => loginApi(params),
    onSuccess: (data) => {
      toast.success('Log in successfully!');
      queryClient.setQueryData([USER_KEY], data.user);
      navigate('/');
    },
    onError: () => toast.error('Invalid user name or password'),
  });

  return { login, isLogingIn } as const;
};

export const useCurrentUser = (): {
  readonly user: User | null | undefined;
  readonly isGettingUser: boolean;
  readonly isAuthenticated: boolean;
} => {
  const { data: user, isPending: isGettingUser } = useQuery({
    queryKey: [USER_KEY],
    queryFn: getCurrentUser,
    refetchInterval: 30000,
  });

  return { user, isGettingUser, isAuthenticated: user?.role === 'authenticated' } as const;
};

export const useLogout = (): {
  readonly logout: UseMutateFunction<void, Error, void, unknown>;
  readonly isLogingOut: boolean;
} => {
  const queryClient = useQueryClient();

  const { mutate: logout, isPending: isLogingOut } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast.error('Could not log out, please try again later or manual clear your browser');
    },
  });

  return { logout, isLogingOut } as const;
};

export const useSignUp = (): {
  readonly signUp: UseMutateFunction<
    {
      user: User;
      session: Session;
    },
    Error,
    SignUpPayload,
    unknown
  >;
  readonly isSigningUp: boolean;
} => {
  const { mutate: signUp, isPending: isSigningUp } = useMutation({
    mutationFn: signUpApi,
    onSuccess: () => {
      toast.success('User signup successfully');
    },
    onError: () => {
      toast.error('Could not sign up user, please try again later');
    },
  });

  return { signUp, isSigningUp } as const;
};
