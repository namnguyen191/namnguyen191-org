import { PropsWithChildren, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useCurrentUser } from '../features/authentication/authQueryHooks';
import { Spinner } from './Spinner';

const FullPage = styled.div`
  height: 100vh;
  background-color: var(--color-grey-50);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProtectedRoute = (props: PropsWithChildren): ReactNode => {
  const { children } = props;

  const { isGettingUser, isAuthenticated, user } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isGettingUser && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isGettingUser, navigate, user]);

  if (isGettingUser) {
    return (
      <FullPage>
        <Spinner />
      </FullPage>
    );
  }

  if (isAuthenticated) {
    return children;
  }
};
