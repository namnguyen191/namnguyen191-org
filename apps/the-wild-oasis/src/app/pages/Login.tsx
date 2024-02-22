import { FC } from 'react';
import styled from 'styled-components';

import { LoginForm } from '../features/authentication/LoginForm';
import { Heading } from '../ui/Heading';
import { Logo } from '../ui/Logo';

const LoginLayout = styled.main`
  display: grid;
  grid-template-columns: 48rem;
  align-content: center;
  justify-content: center;
  gap: 3.2rem;
  background-color: var(--color-grey-50);
`;

export const Login: FC = () => {
  return (
    <LoginLayout>
      <Logo />
      <Heading as="h4">Log into your account</Heading>
      <LoginForm />
    </LoginLayout>
  );
};
