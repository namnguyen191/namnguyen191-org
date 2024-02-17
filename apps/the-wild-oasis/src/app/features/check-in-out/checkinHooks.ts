import { UseMutateFunction, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateBooking } from '../../services/apiBookings';
import { BookingRow } from '../../services/supabase';

export const useCheckIn = (
  bookingId: string
): {
  readonly checkIn: UseMutateFunction<BookingRow, Error, void, unknown>;
  readonly isCheckingIn: boolean;
} => {
  const queryClient = useQueryClient();

  const { mutate: checkIn, isPending: isCheckingIn } = useMutation({
    mutationFn: () => updateBooking(bookingId, { status: 'checked-in', has_paid: true }),
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
