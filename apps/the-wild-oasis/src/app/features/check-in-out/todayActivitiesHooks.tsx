import { useQuery } from '@tanstack/react-query';

import {
  BookingWithGuestInfoAndCabinName,
  getStaysTodayActivity,
} from '../../services/apiBookings';

export const useTodayActivities = (): {
  isLoading: boolean;
  activities: BookingWithGuestInfoAndCabinName[] | undefined;
} => {
  const { isLoading, data: activities } = useQuery({
    queryFn: getStaysTodayActivity,
    queryKey: ['today-activity'],
  });

  return { isLoading, activities };
};
