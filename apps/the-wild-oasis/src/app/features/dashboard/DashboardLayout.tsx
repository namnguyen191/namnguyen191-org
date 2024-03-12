import { ReactElement } from 'react';
import styled from 'styled-components';

import { useRecentBookings, useRecentStays } from './recentBookingHooks';

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto 34rem auto;
  gap: 2.4rem;
`;

export const DashboardLayout = (): ReactElement => {
  const { recentBookings, isGettingRecentBookings } = useRecentBookings();
  const { recentStays, isGettingRecentStays } = useRecentStays();

  if (isGettingRecentBookings || isGettingRecentStays) {
    return <span>Loading...</span>;
  }

  console.log('Nam data is: recentBookings', recentBookings);
  console.log('Nam data is: recentStays', recentStays);

  return <StyledDashboardLayout>DashboardLayout work!</StyledDashboardLayout>;
};
