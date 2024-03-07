import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  OnDestroy,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

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
export class UiElementWrapperComponent implements OnDestroy {
  uiElementInstance: InputSignal<UIElementInstance> = input.required();

  private uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  private uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  private remoteResourceService: RemoteResourceService = inject(RemoteResourceService);

  #cancelTemplateSubscriptionSubject = new Subject<void>();

  uiElementTemplate = computed(() => {
    return this.uiElementTemplatesService.getUIElementTemplate(
      this.uiElementInstance().uiElementTemplateId
    );
  });

  uiElement: WritableSignal<ElemetToRender | null> = signal(null);

  constructor() {
    effect(
      () => {
        // cancel previous subscription if any
        this.#cancelTemplateSubscriptionSubject.next();
        this.uiElementTemplate()
          .pipe(takeUntil(this.#cancelTemplateSubscriptionSubject))
          .subscribe((template) => {
            if (!template) {
              return;
            }
            this.uiElement.set({
              component: this.uiElementFactoryService.getUIElement(template.type),
              inputs: template.options,
            });
          });
      },
      {
        allowSignalWrites: true,
      }
    );
  }

  ngOnDestroy(): void {
    this.#cancelTemplateSubscriptionSubject.next();
    this.#cancelTemplateSubscriptionSubject.complete();
  }
}
