import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from 'react-router-dom';

import { Button, buttonDefaultProps } from '../../ui/Button';
import { FormRow } from '../../ui/FormRow';
import { Input } from '../../ui/Input';
import { useUpdateCurrentUser } from './authQueryHooks';

type UpdatePasswordFormValues = {
  password: string;
  passwordConfirm: string;
};
export const UpdatePasswordForm: FC = () => {
  const { register, handleSubmit, formState, getValues, reset } =
    useForm<UpdatePasswordFormValues>();
  const { errors } = formState;

  const { updateCurrentUser, isUpdatingUser } = useUpdateCurrentUser();

  const onSubmit = ({ password }: { password: string }): void => {
    updateCurrentUser({ password }, { onSuccess: () => reset() });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Password (min 8 characters)" error={errors?.password?.message as string}>
        <Input
          type="password"
          id="password"
          autoComplete="current-password"
          disabled={isUpdatingUser}
          {...register('password', {
            required: 'This field is required',
            minLength: {
              value: 8,
              message: 'Password needs a minimum of 8 characters',
            },
          })}
        />
      </FormRow>

      <FormRow label="Confirm password" error={errors?.passwordConfirm?.message as string}>
        <Input
          type="password"
          autoComplete="new-password"
          id="passwordConfirm"
          disabled={isUpdatingUser}
          {...register('passwordConfirm', {
            required: 'This field is required',
            validate: (value) => getValues().password === value || 'Passwords need to match',
          })}
        />
      </FormRow>
      <FormRow>
        <Button {...buttonDefaultProps} onClick={() => reset()} type="reset" variation="secondary">
          Cancel
        </Button>
        <Button {...buttonDefaultProps} disabled={isUpdatingUser}>
          Update password
        </Button>
      </FormRow>
    </Form>
  );
};
