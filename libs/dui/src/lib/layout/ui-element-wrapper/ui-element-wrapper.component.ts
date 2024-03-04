import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  InputSignal,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';

import { UIElementInstance } from '../../interfaces';
import { UIElementFactoryService, UIElementTemplatesService } from '../../services';

type UIElementState = {
  isLoaded: boolean;
  isError: boolean;
  uiElement: Type<unknown> | null;
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
  });

  private uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  private uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);

  constructor() {
    effect(
      () => {
        try {
          const uiElementInstance = this.uiElementInstance();

          const uiElementTemplate = this.uiElementTemplatesService.getUIElement(
            uiElementInstance.uiElementTemplateId
          );
          const uiElement = this.uiElementFactoryService.getUIElement(uiElementTemplate.type);

          this.uiElementState.set({
            isLoaded: true,
            isError: false,
            uiElement,
          });
        } catch (error) {
          console.warn(error);
          this.uiElementState.set({
            isLoaded: true,
            isError: true,
            uiElement: null,
          });
        }
      },
      { allowSignalWrites: true }
    );
  }
}
