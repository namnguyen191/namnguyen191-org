import { ReactElement } from 'react';
import styled from 'styled-components';

import { useCabins } from '../cabins/cabinQueryHooks';
import { TodayActivity } from '../check-in-out/TodayActivity';
import { DurationChart } from './DurationChart';
import { useRecentBookings, useRecentStays } from './recentBookingHooks';
import { SalesChart } from './SalesChart';
import { Stats } from './Stats';

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto 34rem auto;
  gap: 2.4rem;
`;

export const DashboardLayout = (): ReactElement => {
  const { recentBookings, isGettingRecentBookings } = useRecentBookings();
  const { recentStays, isGettingRecentStays, numDays } = useRecentStays();
  const { cabins, isLoadingCabins } = useCabins();

  if (isGettingRecentBookings || isGettingRecentStays || isLoadingCabins) {
    return <span>Loading...</span>;
  }

  return (
    <StyledDashboardLayout>
      <Stats
        bookings={recentBookings ?? []}
        confirmedStays={recentStays ?? []}
        numOfDays={numDays}
        numOfCabins={cabins?.length ?? 0}
      />
      <TodayActivity />
      <DurationChart confirmedStays={recentStays ?? []} />
      <SalesChart bookings={recentBookings ?? []} numDays={numDays} />
    </StyledDashboardLayout>
  );
};
