import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  InputSignal,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';

import { UIElementInstance, UIElementRequiredInputs } from '../../interfaces';
import {
  RemoteResourceService,
  UIElementFactoryService,
  UIElementTemplatesService,
} from '../../services';

type UIElementState = {
  isLoaded: boolean;
  isError: boolean;
  uiElement: Type<unknown> | null;
  inputs: Record<string, unknown> & UIElementRequiredInputs;
};

@Component({
  selector: 'namnguyen191-ui-element-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-element-wrapper.component.html',
  styleUrl: './ui-element-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiElementWrapperComponent {
  uiElementInstance: InputSignal<UIElementInstance> = input.required();

  uiElementState: WritableSignal<UIElementState> = signal({
    isLoaded: false,
    isError: false,
    uiElement: null,
    inputs: {
      isLoadingConfigOption: false,
    },
  });

  private uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  private uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  private remoteResourceService: RemoteResourceService = inject(RemoteResourceService);
  private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    effect(
      () => {
        try {
          const uiElementInstance = this.uiElementInstance();

          const uiElementTemplate = this.uiElementTemplatesService.getUIElement(
            uiElementInstance.uiElementTemplateId
          );
          const uiElement = this.uiElementFactoryService.getUIElement(uiElementTemplate.type);
          let inputs: UIElementRequiredInputs = {
            ...uiElementTemplate.options,
            isLoadingConfigOption: false,
          };

          if (uiElementTemplate.remoteResourceId) {
            this.remoteResourceService
              .getRemoteResourceState(uiElementTemplate.remoteResourceId)
              .subscribe((val) => {
                this.uiElementState.update((prev) => ({
                  ...prev,
                  inputs: { ...prev.inputs, isLoadingConfigOption: val.isLoading },
                }));
              });

            inputs = {
              ...inputs,
              isLoadingConfigOption: true,
            };
          }

          this.uiElementState.set({
            isLoaded: true,
            isError: false,
            uiElement,
            inputs,
          });
        } catch (error) {
          console.warn(error);
          this.uiElementState.set({
            isLoaded: true,
            isError: true,
            uiElement: null,
            inputs: {
              isLoadingConfigOption: false,
            },
          });
        }
      },
      { allowSignalWrites: true }
    );
  }
}
