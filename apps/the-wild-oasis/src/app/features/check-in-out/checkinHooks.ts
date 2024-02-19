import { UseMutateFunction, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateBooking } from '../../services/apiBookings';
import { BookingRow } from '../../services/supabase';

export type BreakfastMutation = Pick<BookingRow, 'has_breakfast' | 'extra_price' | 'total_price'>;
type CheckinBookingArgs = {
  bookingId: string;
  breakfast?: BreakfastMutation;
};
export const useCheckIn = (): {
  readonly checkIn: UseMutateFunction<BookingRow, Error, CheckinBookingArgs, unknown>;
  readonly isCheckingIn: boolean;
} => {
  const queryClient = useQueryClient();

  const { mutate: checkIn, isPending: isCheckingIn } = useMutation({
    mutationFn: (args: CheckinBookingArgs) => {
      const { bookingId, breakfast = {} } = args;

      return updateBooking(bookingId, { status: 'checked-in', has_paid: true, ...breakfast });
    },
    onSuccess: (data: BookingRow) => {
      toast.success(`Booking ${data.id} check-in successfully!`);
      queryClient.invalidateQueries({
        queryKey: [],
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { checkIn, isCheckingIn } as const;
};
