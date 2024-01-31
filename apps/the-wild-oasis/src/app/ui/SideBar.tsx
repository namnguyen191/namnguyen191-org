import { FC } from 'react';
import styled from 'styled-components';

import { Uploader } from '../data/Uploader';
import { Logo } from './Logo';
import { MainNav } from './MainNav';

const StyledSideBar = styled.aside`
  background-color: var(--color-grey-0);
  padding: 3.2rem 2.4rem;
  border-right: 1px solid var(--color-grey-100);

  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
`;

export const SideBar: FC = () => {
  return (
    <StyledSideBar>
      <Logo />
      <MainNav />
      <Uploader />
    </StyledSideBar>
  );
};
