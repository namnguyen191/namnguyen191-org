import { signal, WritableSignal } from '@angular/core';

export type FetchWithStatus<T> = {
  isLoading: boolean;
  isError: boolean;
  data: T | null;
};

export const fetchWithStatus = <TReturn, TArgs extends unknown[]>(params: {
  fetcher: (...args: TArgs) => Promise<TReturn>;
}): {
  fetchState: WritableSignal<FetchWithStatus<TReturn>>;
  startFetching: (...args: TArgs) => Promise<void>;
} => {
  const { fetcher } = params;
  const fetchWithStatusSignal: WritableSignal<FetchWithStatus<TReturn>> = signal<
    FetchWithStatus<TReturn>
  >({
    isLoading: false,
    isError: false,
    data: null,
  });

  const fetch = async (...args: TArgs): Promise<void> => {
    fetchWithStatusSignal.update((prev) => ({ ...prev, isLoading: true }));
    try {
      const responseData = await fetcher(...args);
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
