import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EnvironmentInjector,
  inject,
  input,
  InputSignal,
  runInInjectionContext,
  Signal,
  Type,
} from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { map, Observable, switchMap } from 'rxjs';

import {
  ComponentContextPropertyKey,
  StateSubscriptionConfig,
  UIElementInstance,
  UIElementTemplate,
  UIElementTemplateOptions,
} from '../../../interfaces';
import { UIElementFactoryService, UIElementTemplatesService } from '../../../services';
import { getElementInputsInterpolationContext } from '../../../services/hooks/InterpolationContext';
import { InterpolationService } from '../../../services/interpolation.service';

@Component({
  selector: 'namnguyen191-ui-element-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-element-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiElementWrapperComponent {
  uiElementInstance: InputSignal<UIElementInstance> = input.required();

  #uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  #uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  #interpolationService: InterpolationService = inject(InterpolationService);
  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  uiElementTemplate: Signal<Observable<UIElementTemplate>> = computed(() => {
    return this.#uiElementTemplatesService.getUIElementTemplate(
      this.uiElementInstance().uiElementTemplateId
    );
  });

  uiElementComponent: Signal<Observable<Type<unknown>>> = computed(() => {
    return this.uiElementTemplate().pipe(
      map((template) => this.#uiElementFactoryService.getUIElement(template.type))
    );
  });

  uiElementInputs: Signal<Observable<ObjectType>> = computed(() => {
    return this.uiElementTemplate().pipe(
      switchMap((template) =>
        runInInjectionContext(this.#environmentInjector, () =>
          this.#generateComponentInputsV2({
            templateOptions: template.options,
            remoteResourceId: template.remoteResourceId,
            stateSubscription: template.stateSubscription,
            component: this.#uiElementFactoryService.getUIElement(template.type),
          })
        )
      )
    );
  });

  #generateComponentInputsV2(params: {
    templateOptions: UIElementTemplateOptions;
    remoteResourceId?: string;
    stateSubscription?: StateSubscriptionConfig;
    component: Type<unknown>;
  }): Observable<ObjectType> {
    const { templateOptions, remoteResourceId, stateSubscription, component } = params;

    const interpolationContext = getElementInputsInterpolationContext({
      remoteResourceId,
      stateSubscription,
    });

    return interpolationContext.pipe(
      switchMap((context) => {
        const template = { ...templateOptions };
        if (this.#isContextBased(component)) {
          (template[ComponentContextPropertyKey] as unknown) = context;
        }

        if (remoteResourceId) {
          // Only automatically set isLoading and isError if the user does not provide any override for them
          if (templateOptions.isLoading === undefined) {
            template.isLoading = context.remoteResourceState?.isLoading;
          }

          if (templateOptions.isError === undefined) {
            template.isError = context.remoteResourceState?.isError;
          }
        }

        return this.#interpolationService.interpolate({
          context,
          value: template,
        }) as Promise<ObjectType>;
      })
    );
  }

  #isContextBased(component: Type<unknown>): boolean {
    return !!(component as unknown as { NEED_CONTEXT?: true })['NEED_CONTEXT'];
  }
}
