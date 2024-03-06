import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  Signal,
  Type,
} from '@angular/core';

import { UIElementInstance } from '../../interfaces';
import {
  RemoteResourceService,
  UIElementFactoryService,
  UIElementTemplatesService,
} from '../../services';

type ElemetToRender = {
  component: Type<unknown>;
  inputs: Record<string, unknown>;
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

  private uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  private uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  private remoteResourceService: RemoteResourceService = inject(RemoteResourceService);

  uiElementTemplate = computed(() => {
    return this.uiElementTemplatesService.getUIElementTemplate(
      this.uiElementInstance().uiElementTemplateId
    );
  });

  uiElement: Signal<ElemetToRender | null> = computed(() => {
    const template = this.uiElementTemplate()();
    if (!template) {
      return null;
    }

    return {
      component: this.uiElementFactoryService.getUIElement(template.type),
      inputs: template.options,
    };
  });
}
