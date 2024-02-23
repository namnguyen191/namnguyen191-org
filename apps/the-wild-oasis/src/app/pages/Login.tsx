import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useCurrentUser } from '../features/authentication/authQueryHooks';
import { LoginForm } from '../features/authentication/LoginForm';
import { Heading } from '../ui/Heading';
import { Logo } from '../ui/Logo';

const LoginLayout = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 48rem;
  align-content: center;
  justify-content: center;
  gap: 3.2rem;
  background-color: var(--color-grey-50);
`;

export const Login: FC = () => {
  const { isGettingUser, isAuthenticated } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isGettingUser && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isGettingUser, navigate]);

  return (
    <LoginLayout>
      <Logo />
      <Heading as="h4">Log into your account</Heading>
      <LoginForm />
    </LoginLayout>
  );
};
