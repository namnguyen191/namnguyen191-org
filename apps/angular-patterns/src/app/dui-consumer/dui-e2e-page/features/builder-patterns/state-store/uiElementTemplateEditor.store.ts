import { computed, inject } from '@angular/core';
import { LayoutTemplate, LayoutTemplateService, UIElementTemplateService } from '@dj-ui/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { immerPatchState } from 'ngrx-immer/signals';

import {
  AppUIElementTemplate,
  AppUIElementTemplateEditableFields,
  AppUIElementTemplateUnEditableFields,
} from '../../../../services/ui-element-templates.service';

const PREVIEW_UI_ELEMENT_TEMPLATE_ID = 'TEMPLATE_FOR_PREVIEW_ONLY';

export const PREVIEW_LAYOUT_BASE_CONFIG: LayoutTemplate = {
  id: 'preview-layout',
  gridConfigs: {
    compactType: 'none',
  },
  uiElementInstances: [],
};

type UIElementTemplateEditorState = {
  currentEditingTemplate: AppUIElementTemplate | null;
};
const uiElementTemplateStoreInitialState: UIElementTemplateEditorState = {
  currentEditingTemplate: null,
};

export const UIElementTemplateEditorStore = signalStore(
  { providedIn: 'root' },
  withState(uiElementTemplateStoreInitialState),
  withComputed(({ currentEditingTemplate }) => ({
    currentEditableFields: computed<AppUIElementTemplateEditableFields | null>(() => {
      const template = currentEditingTemplate();
      if (!template) {
        return null;
      }
      const { id, createdAt, updatedAt, ...editableFields } = template;
      return editableFields;
    }),
    currentUnEditableFields: computed<AppUIElementTemplateUnEditableFields | null>(() => {
      const template = currentEditingTemplate();
      if (!template) {
        return null;
      }
      const { id, createdAt, updatedAt } = template;
      return {
        id,
        createdAt,
        updatedAt,
      };
    }),
  })),
  withMethods(
    (
      store,
      uiElementTemplateService = inject(UIElementTemplateService),
      layoutTemplateService = inject(LayoutTemplateService)
    ) => ({
      setCurrentEditingTemplate: (currentEditingTemplate: AppUIElementTemplate): void => {
        uiElementTemplateService.updateOrRegisterUIElementTemplate({
          ...currentEditingTemplate,
          id: PREVIEW_UI_ELEMENT_TEMPLATE_ID,
        });
        layoutTemplateService.updateLayoutTemplate({
          ...PREVIEW_LAYOUT_BASE_CONFIG,
          uiElementInstances: [
            {
              id: 'instance-1',
              uiElementTemplateId: PREVIEW_UI_ELEMENT_TEMPLATE_ID,
            },
          ],
        });
        patchState(store, { currentEditingTemplate });
      },
      updateCurrentEditingTemplate: (updates: AppUIElementTemplateEditableFields): void => {
        uiElementTemplateService.updateUIElementTemplate({
          ...updates,
          id: PREVIEW_UI_ELEMENT_TEMPLATE_ID,
        });
        immerPatchState(store, (state) => {
          if (!state.currentEditingTemplate) {
            return;
          }
          state.currentEditingTemplate = {
            ...state.currentEditingTemplate,
            ...updates,
          };
        });
      },
      initPreviewLayout: (): void => {
        layoutTemplateService.registerLayoutTemplate(PREVIEW_LAYOUT_BASE_CONFIG);
      },
    })
  ),
  withHooks({
    onInit: ({ initPreviewLayout }) => {
      initPreviewLayout();
    },
  })
);
