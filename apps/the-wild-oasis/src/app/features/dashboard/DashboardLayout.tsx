import { ReactElement } from 'react';
import styled from 'styled-components';

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto 34rem auto;
  gap: 2.4rem;
`;

export const DashboardLayout = (): ReactElement => {
  return <StyledDashboardLayout>DashboardLayout work!</StyledDashboardLayout>;
};
