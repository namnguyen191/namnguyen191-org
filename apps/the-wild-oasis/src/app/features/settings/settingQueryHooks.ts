import { UseMutateFunction, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  getSettings,
  updateSettings as updateSettingsAPI,
  UpdateSettingsPayload,
} from '../../services/apiSettings';
import { SettingRow } from '../../services/supabase';

const ALL_SETTINGS_QUERY_KEY = 'settings';

export const useSettings = (): {
  readonly settings: SettingRow | undefined;
  readonly error: Error | null;
  readonly isLoadingSettings: boolean;
} => {
  const {
    isLoading: isLoadingSettings,
    data: settings,
    error,
  } = useQuery({
    queryKey: [ALL_SETTINGS_QUERY_KEY],
    queryFn: getSettings,
  });

  return { settings, error, isLoadingSettings } as const;
};

export const useUpdateSettings = (): {
  readonly updateSettings: UseMutateFunction<void, Error, UpdateSettingsPayload, unknown>;
  readonly isUpdatingSettings: boolean;
} => {
  const queryClient = useQueryClient();

  const { isPending: isUpdatingSettings, mutate: updateSettings } = useMutation({
    mutationFn: updateSettingsAPI,
    onSuccess: () => {
      toast.success('Settings updated successfully!');
      queryClient.invalidateQueries({
        queryKey: [ALL_SETTINGS_QUERY_KEY],
      });
    },
    onError: () => {
      toast.error('Fail to update settings. Please try again later');
    },
  });

  return { updateSettings, isUpdatingSettings } as const;
};
