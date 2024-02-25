import { FC, ReactElement } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Button, buttonDefaultProps } from '../../ui/Button';
import { Form } from '../../ui/Form';
import { FormRow } from '../../ui/FormRow';
import { Input } from '../../ui/Input';
import { SpinnerMini } from '../../ui/SpinnerMini';
import { useSignUp } from './authQueryHooks';

const emailRegex = /\S+@\S+\.\S+/;

type FormInput = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const SignupForm: FC = (): ReactElement => {
  const { register, getValues, formState, handleSubmit, reset } = useForm<FormInput>();
  const { signUp, isSigningUp } = useSignUp();

  const onSubmit: SubmitHandler<FormInput> = ({ email, password, fullName }) => {
    signUp(
      {
        email,
        password,
        fullName,
      },
      {
        onSettled: () => reset(),
      }
    );
  };

  return (
    <Form type="form" onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Full name" error={formState.errors.fullName?.message}>
        <Input
          {...register('fullName', { required: 'This field is required' })}
          type="text"
          id="fullName"
        />
      </FormRow>

      <FormRow label="Email address" error={formState.errors.email?.message}>
        <Input
          {...register('email', {
            required: 'This field is required',
            pattern: {
              value: emailRegex,
              message: 'Please enter a valid email',
            },
          })}
          type="email"
          id="email"
        />
      </FormRow>

      <FormRow label="Password (min 8 characters)" error={formState.errors.password?.message}>
        <Input
          {...register('password', {
            required: 'This field is required',
            minLength: {
              value: 8,
              message: 'Please enter at least 8 characters',
            },
          })}
          type="password"
          id="password"
        />
      </FormRow>

      <FormRow label="Repeat password" error={formState.errors.confirmPassword?.message}>
        <Input
          {...register('confirmPassword', {
            required: 'This field is required',
            validate: (value) =>
              getValues().password !== value ? 'Confirm password does not match' : undefined,
          })}
          type="password"
          id="passwordConfirm"
        />
      </FormRow>

      <FormRow>
        <Button disabled={isSigningUp} {...buttonDefaultProps} variation="secondary" type="reset">
          Cancel
        </Button>
        <Button disabled={isSigningUp} {...buttonDefaultProps} type="submit">
          {isSigningUp ? <SpinnerMini /> : 'Create new user'}
        </Button>
      </FormRow>
    </Form>
  );
};
