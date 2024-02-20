import { UseMutateFunction, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateBooking } from '../../services/apiBookings';
import { BookingRow } from '../../services/supabase';

export const useCheckOut = (): {
  readonly checkOut: UseMutateFunction<BookingRow, Error, string, unknown>;
  readonly isCheckingOut: boolean;
} => {
  const queryClient = useQueryClient();

  const { mutate: checkOut, isPending: isCheckingOut } = useMutation({
    mutationFn: (bookingId: string) => {
      return updateBooking(bookingId, { status: 'checked-out' });
    },
    onSuccess: (data: BookingRow) => {
      toast.success(`Booking ${data.id} check-out successfully!`);
      queryClient.invalidateQueries({
        queryKey: [],
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { checkOut, isCheckingOut } as const;
};
