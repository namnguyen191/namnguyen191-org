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
import { setAllEntities, setEntity, withEntities } from '@ngrx/signals/entities';
import { firstValueFrom } from 'rxjs';

import {
  AppUIElementTemplate,
  CreateAppUIElementTemplatePayload,
  UIElementTemplateService,
} from '../../../../services/ui-element-templates.service';

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

export type TemplateMetaData = Pick<AppUIElementTemplate, 'id' | 'createdAt' | 'updatedAt'>;

export const UIElementTemplatesStore = signalStore(
  { providedIn: 'root' },
  withEntities<AppUIElementTemplate>(),
  withRequestStatus(),
  withComputed(({ entities }) => ({
    allUIElementTemplateMetaData: computed<TemplateMetaData[]>(() => {
      return entities().map(({ id, createdAt, updatedAt }) => ({ id, createdAt, updatedAt }));
    }),
  })),
  withMethods((store, uiElementTemplateService = inject(UIElementTemplateService)) => ({
    loadAll: async (): Promise<void> => {
      patchState(store, setPending());
      try {
        const allUIElementTempalates = await firstValueFrom(
          uiElementTemplateService.loadAllUIElementTemplates()
        );
        patchState(store, setAllEntities(allUIElementTempalates), setFulfilled());
      } catch (_error) {
        setError('Something went wrong fetching books');
      }
    },
    addOne: async (
      newUIElementTemplatePayload: CreateAppUIElementTemplatePayload
    ): Promise<void> => {
      patchState(store, setPending());
      try {
        const createdUIElementTemplate = await firstValueFrom(
          uiElementTemplateService.createUIElementTemplate(newUIElementTemplatePayload)
        );
        patchState(store, setEntity(createdUIElementTemplate));
      } catch (_error) {
        setError('Something went wrong fetching books');
      } finally {
        patchState(store, setFulfilled());
      }
    },
  })),
  withHooks({
    onInit: ({ loadAll }) => {
      loadAll();
    },
  })
);
