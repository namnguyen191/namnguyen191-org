import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { Header } from './Header';
import { SideBar } from './SideBar';

const Main = styled.main`
  background-color: var(--color-grey-50);
  padding: 4rem 4.8rem 6.4rem;
`;

const StyledAppLayout = styled.div`
  display: grid;
  grid-template-columns: 26rem 1fr;
  grid-template-rows: auto 1fr;
  height: 100vh;
`;

export const AppLayout: FC = () => {
  return (
    <StyledAppLayout>
      <Header />
      <SideBar />

      <Main>
        <Outlet />
      </Main>
    </StyledAppLayout>
  );
};
