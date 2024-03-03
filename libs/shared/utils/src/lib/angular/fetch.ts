import { signal, WritableSignal } from '@angular/core';

export type FetchWithStatus<T> = {
  isLoading: boolean;
  isError: boolean;
  data: T | null;
};

export const fetchWithStatus = <T>(params: {
  fetcher: () => Promise<T>;
}): {
  fetchState: WritableSignal<FetchWithStatus<T>>;
  startFetching: () => Promise<void>;
} => {
  const { fetcher } = params;
  const fetchWithStatusSignal: WritableSignal<FetchWithStatus<T>> = signal<FetchWithStatus<T>>({
    isLoading: false,
    isError: false,
    data: null,
  });

  const fetch = async (): Promise<void> => {
    fetchWithStatusSignal.update((prev) => ({ ...prev, isLoading: true }));
    try {
      const responseData = await fetcher();
      fetchWithStatusSignal.set({ data: responseData, isError: false, isLoading: false });
    } catch (error) {
      console.warn(error);
      fetchWithStatusSignal.set({ data: null, isError: true, isLoading: false });
    }
  };

  return {
    fetchState: fetchWithStatusSignal,
    startFetching: fetch,
  };
};
