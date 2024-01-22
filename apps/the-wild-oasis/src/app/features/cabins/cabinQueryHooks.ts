import { UseMutateFunction, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  Cabin,
  createCabin as createCabinAPI,
  CreateCabinPayload,
  deleteCabin as deleteCabinAPI,
  duplicateCabin as duplicateCabinAPI,
  DuplicateCabinPayload,
  getCabins as getCabinsAPI,
  updateCabin as updateCabinAPI,
  UpdateCabinPayload,
} from '../../services/apiCabins';

const ALL_CABINS_QUERY_KEY = 'cabins';

export const useCabins = (): {
  readonly cabins: Cabin[] | undefined;
  readonly error: Error | null;
  readonly isLoadingCabins: boolean;
} => {
  const {
    isLoading: isLoadingCabins,
    data: cabins,
    error,
  } = useQuery({
    queryKey: [ALL_CABINS_QUERY_KEY],
    queryFn: getCabinsAPI,
  });

  return { cabins, error, isLoadingCabins } as const;
};

export const useDeleteCabin = (): {
  readonly deleteCabin: UseMutateFunction<void, Error, number, unknown>;
  readonly isDeletingCabin: boolean;
} => {
  const queryClient = useQueryClient();

  const { mutate: deleteCabin, isPending: isDeletingCabin } = useMutation({
    mutationFn: deleteCabinAPI,
    onSuccess: () => {
      toast.success('Cabin successfully deleted!');
      queryClient.invalidateQueries({
        queryKey: [ALL_CABINS_QUERY_KEY],
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { deleteCabin, isDeletingCabin } as const;
};

export const useCreateCabin = (): {
  readonly createCabin: UseMutateFunction<void, Error, CreateCabinPayload, unknown>;
  readonly isCreatingCabin: boolean;
} => {
  const queryClient = useQueryClient();
  const { isPending: isCreatingCabin, mutate: createCabin } = useMutation({
    mutationFn: createCabinAPI,
    onSuccess: () => {
      toast.success('Cabin created successfully!');
      queryClient.invalidateQueries({
        queryKey: [ALL_CABINS_QUERY_KEY],
      });
    },
    onError: () => {
      toast.error('Fail to create cabin. Please try again later');
    },
  });

  return { createCabin, isCreatingCabin } as const;
};

export const useEditCabin = (): {
  readonly updateCabin: UseMutateFunction<void, Error, UpdateCabinPayload, unknown>;
  readonly isUpdatingCabin: boolean;
} => {
  const queryClient = useQueryClient();

  const { isPending: isUpdatingCabin, mutate: updateCabin } = useMutation({
    mutationFn: updateCabinAPI,
    onSuccess: () => {
      toast.success('Cabin updated successfully!');
      queryClient.invalidateQueries({
        queryKey: [ALL_CABINS_QUERY_KEY],
      });
    },
    onError: () => {
      toast.error('Fail to update cabin. Please try again later');
    },
  });

  return { updateCabin, isUpdatingCabin } as const;
};

export const useDuplicateCabin = (): {
  readonly duplicateCabin: UseMutateFunction<void, Error, DuplicateCabinPayload, unknown>;
  readonly isDuplicatingCabin: boolean;
} => {
  const queryClient = useQueryClient();
  const { isPending: isDuplicatingCabin, mutate: duplicateCabin } = useMutation({
    mutationFn: duplicateCabinAPI,
    onSuccess: () => {
      toast.success('Cabin created successfully!');
      queryClient.invalidateQueries({
        queryKey: [ALL_CABINS_QUERY_KEY],
      });
    },
    onError: () => {
      toast.error('Fail to create cabin. Please try again later');
    },
  });

  return { duplicateCabin, isDuplicatingCabin } as const;
};
