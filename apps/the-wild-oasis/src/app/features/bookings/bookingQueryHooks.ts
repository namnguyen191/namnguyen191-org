import { useQuery } from '@tanstack/react-query';

import {
  FilterOperation,
  getBookings,
  PaginationOperation,
  SortOperation,
} from '../../services/apiBookings';
import { BookingRow } from '../../services/supabase';

const ALL_BOOKINGS_QUERY_KEY = 'bookings';

export const useBookings = (args: {
  filters?: FilterOperation[];
  sort?: SortOperation;
  pagination?: PaginationOperation;
}): {
  readonly bookings: BookingRow[] | undefined;
  readonly count: number | undefined;
  readonly error: Error | null;
  readonly isLoadingBookings: boolean;
} => {
  const { filters, sort, pagination } = args;
  const filterKey =
    'none' +
    (filters ?? []).map((filter) => `${filter.key}-${filter.value}`) +
    (sort ? `${sort.field} - ${sort?.asc ? 'asc' : 'des'}` : '') +
    (pagination?.page ?? '');

  const {
    isLoading: isLoadingBookings,
    data: bookingsData,
    error,
  } = useQuery({
    queryKey: [ALL_BOOKINGS_QUERY_KEY, filterKey],
    queryFn: () => getBookings({ filters, sort, pagination }),
  });

  return {
    bookings: bookingsData?.bookings,
    count: bookingsData?.count,
    error,
    isLoadingBookings,
  } as const;
};

// export const useDeleteCabin = (): {
//   readonly deleteCabin: UseMutateFunction<void, Error, number, unknown>;
//   readonly isDeletingCabin: boolean;
// } => {
//   const queryClient = useQueryClient();

//   const { mutate: deleteCabin, isPending: isDeletingCabin } = useMutation({
//     mutationFn: deleteCabinAPI,
//     onSuccess: () => {
//       toast.success('Cabin successfully deleted!');
//       queryClient.invalidateQueries({
//         queryKey: [ALL_CABINS_QUERY_KEY],
//       });
//     },
//     onError: (err) => toast.error(err.message),
//   });

//   return { deleteCabin, isDeletingCabin } as const;
// };

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
