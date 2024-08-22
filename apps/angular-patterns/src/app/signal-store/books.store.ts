import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  signalStoreFeature,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import { Book, BooksService } from './books.service';

type RequestStatus = 'idle' | 'pending' | 'fulfilled' | { error: string };
type RequestStatusState = { requestStatus: RequestStatus };

const setPending = (): RequestStatusState => {
  return { requestStatus: 'pending' };
};

const setFulfilled = (): RequestStatusState => {
  return { requestStatus: 'fulfilled' };
};

const setError = (error: string): RequestStatusState => {
  return { requestStatus: { error } };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const withRequestStatus = () => {
  return signalStoreFeature(
    withState<RequestStatusState>({ requestStatus: 'idle' }),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending'),
      isFulfilled: computed(() => requestStatus() === 'fulfilled'),
      error: computed(() => {
        const status = requestStatus();
        return typeof status === 'object' ? status.error : null;
      }),
    }))
  );
};

export const BooksStore = signalStore(
  { providedIn: 'root' },
  withState({ query: '', nestedSignal: { nestedField: true } }),
  withEntities<Book>(),
  withRequestStatus(),
  withComputed(({ entities, query, nestedSignal }) => ({
    filteredBooks: computed(() => {
      // Nested signals are signals where subfields are also signals themself.
      const test1 = nestedSignal();
      const test2 = nestedSignal.nestedField();
      console.log('Nam data is: ', test1, test2);
      return entities().filter(({ title }) => title.toLowerCase().includes(query().toLowerCase()));
    }),
  })),
  withMethods((store, booksService = inject(BooksService)) => ({
    updateQuery: (query: string): void => {
      patchState(store, { query });
    },
    loadAll: async (): Promise<void> => {
      patchState(store, setPending());
      try {
        const allBooks = await booksService.loadAllBooks();
        patchState(store, setAllEntities(allBooks), setFulfilled());
      } catch (error) {
        setError('Something went wrong fetching books');
      }
    },
  })),
  withHooks({
    onInit: ({ loadAll }) => {
      loadAll();
    },
  })
);
