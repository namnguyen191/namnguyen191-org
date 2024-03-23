import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

import {
  BookingWithGuestLastName,
  getBookingsAfterDate,
  getStaysAfterDate,
} from '../../services/apiBookings';
import { BookingRow } from '../../services/supabase';
import { ALL_BOOKINGS_QUERY_KEY } from '../bookings/bookingQueryHooks';

export const ALL_STAYS_QUERY_KEY = 'stays';

export const useRecentBookings = (): {
  isGettingRecentBookings: boolean;
  recentBookings: Pick<BookingRow, 'created_at' | 'total_price' | 'extra_price'>[] | undefined;
} => {
  const [searchParams] = useSearchParams();

  const numDays = !searchParams.get('last') ? 7 : Number(searchParams.get('last'));
  const queryDate = subDays(new Date(), numDays).toISOString();
  const { isLoading: isGettingRecentBookings, data: recentBookings } = useQuery({
    queryFn: () => getBookingsAfterDate(queryDate),
    queryKey: [ALL_BOOKINGS_QUERY_KEY, `last-${numDays}`],
  });

  return { isGettingRecentBookings, recentBookings };
};

export const useRecentStays = (): {
  isGettingRecentStays: boolean;
  recentStays: BookingWithGuestLastName[] | undefined;
  numDays: number;
} => {
  const [searchParams] = useSearchParams();

  const numDays = !searchParams.get('last') ? 7 : Number(searchParams.get('last'));
  const queryDate = subDays(new Date(), numDays).toISOString();
  const { isLoading: isGettingRecentStays, data: recentStays } = useQuery({
    queryFn: () => getStaysAfterDate(queryDate),
    queryKey: [ALL_STAYS_QUERY_KEY, `last-${numDays}`],
  });

  const confirmedStays = recentStays?.filter(
    (stay) => stay.status === 'checked-in' || stay.status === 'checked-out'
  );

  return { isGettingRecentStays, recentStays: confirmedStays, numDays };
};
