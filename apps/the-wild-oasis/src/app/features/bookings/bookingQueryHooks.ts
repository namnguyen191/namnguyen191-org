import { UseMutateFunction, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  BookingRowsWithGuestAndCabin,
  BookingWithGuestInfoAndCabinName,
  deleteBooking as deleteBookingApi,
  FilterOperation,
  getBookingById,
  getBookings,
  PaginationOperation,
  SortOperation,
} from '../../services/apiBookings';
import { PAGE_SIZE } from '../../utils/global-const';

export const ALL_BOOKINGS_QUERY_KEY = 'bookings';

export const useBookings = (args: {
  filters?: FilterOperation[];
  sort?: SortOperation;
  pagination?: PaginationOperation;
}): {
  readonly bookings: BookingRowsWithGuestAndCabin | undefined;
  readonly count: number | undefined;
  readonly error: Error | null;
  readonly isLoadingBookings: boolean;
} => {
  const { filters, sort, pagination } = args;
  const filterKey = 'none' + (filters ?? []).map((filter) => `${filter.key}-${filter.value}`);
  const sortKey = sort ? `${sort.field} - ${sort?.asc ? 'asc' : 'des'}` : '';
  const paginationKey = pagination?.page ?? '1';
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingBookings,
    data: bookingsData,
    error,
  } = useQuery({
    queryKey: [ALL_BOOKINGS_QUERY_KEY, filterKey, sortKey, paginationKey],
    queryFn: () => getBookings({ filters, sort, pagination }),
  });

  const pageCount = Math.ceil((bookingsData?.count ?? 0) / PAGE_SIZE);
  const currentPage = pagination?.page ?? 1;
  if (currentPage > 1) {
    queryClient.prefetchQuery({
      queryKey: [ALL_BOOKINGS_QUERY_KEY, filterKey, sortKey, currentPage - 1],
      queryFn: () => getBookings({ filters, sort, pagination: { page: currentPage - 1 } }),
    });
  }
  if (currentPage < pageCount) {
    queryClient.prefetchQuery({
      queryKey: [ALL_BOOKINGS_QUERY_KEY, filterKey, sortKey, currentPage + 1],
      queryFn: () => getBookings({ filters, sort, pagination: { page: currentPage + 1 } }),
    });
  }

  return {
    bookings: bookingsData?.bookings,
    count: bookingsData?.count,
    error,
    isLoadingBookings,
  } as const;
};

export const useBookingDetail = (args: {
  id: string;
}): {
  readonly booking: BookingWithGuestInfoAndCabinName | undefined;
  readonly error: Error | null;
  readonly isLoadingBooking: boolean;
} => {
  const { id } = args;

  const {
    isLoading: isLoadingBooking,
    data: bookingsData,
    error,
  } = useQuery({
    queryKey: [ALL_BOOKINGS_QUERY_KEY, `id=${id}`],
    queryFn: () => getBookingById(id),
  });

  return {
    booking: bookingsData,
    error,
    isLoadingBooking,
  } as const;
};

export const useDeleteBooking = (): {
  readonly deleteBooking: UseMutateFunction<void, Error, string, unknown>;
  readonly isDeletingBooking: boolean;
} => {
  const queryClient = useQueryClient();

  const { mutate: deleteBooking, isPending: isDeletingBooking } = useMutation({
    mutationFn: deleteBookingApi,
    onSuccess: () => {
      toast.success('Booking successfully deleted!');
      queryClient.invalidateQueries({
        queryKey: [ALL_BOOKINGS_QUERY_KEY],
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { deleteBooking, isDeletingBooking } as const;
};

// export const useCreateCabin = (): {
//   readonly createCabin: UseMutateFunction<void, Error, CreateCabinPayload, unknown>;
//   readonly isCreatingCabin: boolean;
// } => {
//   const queryClient = useQueryClient();
//   const { isPending: isCreatingCabin, mutate: createCabin } = useMutation({
//     mutationFn: createCabinAPI,
//     onSuccess: () => {
//       toast.success('Cabin created successfully!');
//       queryClient.invalidateQueries({
//         queryKey: [ALL_CABINS_QUERY_KEY],
//       });
//     },
//     onError: () => {
//       toast.error('Fail to create cabin. Please try again later');
//     },
//   });

//   return { createCabin, isCreatingCabin } as const;
// };

// export const useEditCabin = (): {
//   readonly updateCabin: UseMutateFunction<void, Error, UpdateCabinPayload, unknown>;
//   readonly isUpdatingCabin: boolean;
// } => {
//   const queryClient = useQueryClient();

//   const { isPending: isUpdatingCabin, mutate: updateCabin } = useMutation({
//     mutationFn: updateCabinAPI,
//     onSuccess: () => {
//       toast.success('Cabin updated successfully!');
//       queryClient.invalidateQueries({
//         queryKey: [ALL_CABINS_QUERY_KEY],
//       });
//     },
//     onError: () => {
//       toast.error('Fail to update cabin. Please try again later');
//     },
//   });

//   return { updateCabin, isUpdatingCabin } as const;
// };

// export const useDuplicateCabin = (): {
//   readonly duplicateCabin: UseMutateFunction<void, Error, DuplicateCabinPayload, unknown>;
//   readonly isDuplicatingCabin: boolean;
// } => {
//   const queryClient = useQueryClient();
//   const { isPending: isDuplicatingCabin, mutate: duplicateCabin } = useMutation({
//     mutationFn: duplicateCabinAPI,
//     onSuccess: () => {
//       toast.success('Cabin created successfully!');
//       queryClient.invalidateQueries({
//         queryKey: [ALL_CABINS_QUERY_KEY],
//       });
//     },
//     onError: () => {
//       toast.error('Fail to create cabin. Please try again later');
//     },
//   });

//   return { duplicateCabin, isDuplicatingCabin } as const;
// };
