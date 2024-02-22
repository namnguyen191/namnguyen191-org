import { UseMutateFunction, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { login as loginApi } from '../../services/apiAuth';

export const useLogin = (): {
  readonly login: UseMutateFunction<unknown, Error, { email: string; password: string }, unknown>;
  readonly isLogingIn: boolean;
} => {
  const { mutate: login, isPending: isLogingIn } = useMutation({
    mutationFn: (params: Parameters<typeof loginApi>[0]) => loginApi(params),
    onSuccess: () => {
      toast.success('Log in successfully!');
    },
    onError: () => toast.error('Invalid user name or password'),
  });

  return { login, isLogingIn } as const;
};
