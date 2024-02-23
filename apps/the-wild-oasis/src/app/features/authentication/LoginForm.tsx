import { FC, FormEventHandler, useState } from 'react';
import { Form } from 'react-router-dom';

import { Button, buttonDefaultProps } from '../../ui/Button';
import { FormRowVertical } from '../../ui/FormRowVertical';
import { Input } from '../../ui/Input';
import { SpinnerMini } from '../../ui/SpinnerMini';
import { useLogin } from './authQueryHooks';

export const LoginForm: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLogingIn } = useLogin();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e): void => {
    e.preventDefault();
    login(
      {
        email,
        password,
      },
      {
        onSettled: () => {
          setEmail('');
          setPassword('');
        },
      }
    );
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormRowVertical label="Email address" labelFor="email">
        <Input
          type="email"
          id="email"
          // This makes this form better for password managers
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLogingIn}
        />
      </FormRowVertical>
      <FormRowVertical label="Password" labelFor="password">
        <Input
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLogingIn}
        />
      </FormRowVertical>
      <FormRowVertical>
        <Button {...buttonDefaultProps} size="large" disabled={isLogingIn}>
          {isLogingIn ? <SpinnerMini /> : 'Login'}
        </Button>
      </FormRowVertical>
    </Form>
  );
};
