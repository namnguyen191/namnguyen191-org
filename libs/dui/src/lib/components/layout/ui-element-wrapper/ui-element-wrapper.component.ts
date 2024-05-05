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
import { isEqual } from 'lodash-es';
import {
  combineLatest,
  distinctUntilChanged,
  from,
  map,
  Observable,
  shareReplay,
  switchMap,
} from 'rxjs';

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
    return this.#uiElementTemplatesService
      .getUIElementTemplate(this.uiElementInstance().uiElementTemplateId)
      .pipe(shareReplay(1));
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
          this.#generateComponentInputs({
            templateOptions: template.options,
            remoteResourceId: template.remoteResourceId,
            stateSubscription: template.stateSubscription,
            component: this.#uiElementFactoryService.getUIElement(template.type),
          })
        )
      )
    );
  });

  #generateComponentInputs(params: {
    templateOptions: UIElementTemplateOptions<Record<string, unknown>>;
    remoteResourceId?: string;
    stateSubscription?: StateSubscriptionConfig;
    component: Type<unknown>;
  }): Observable<ObjectType> {
    const { templateOptions, remoteResourceId, stateSubscription, component } = params;

    const interpolationContext = getElementInputsInterpolationContext({
      remoteResourceId,
      stateSubscription,
    });

    const inputsObservableMap: Record<string, Observable<unknown>> = {};
    for (const [key, val] of Object.entries(templateOptions)) {
      inputsObservableMap[key] = interpolationContext.pipe(
        switchMap((context) =>
          from(
            this.#interpolationService.interpolate({
              context,
              value: val,
            })
          )
        ),
        distinctUntilChanged(isEqual)
      );
    }

    if (this.#isContextBased(component)) {
      (inputsObservableMap[ComponentContextPropertyKey] as unknown) = interpolationContext;
    }

    if (remoteResourceId) {
      // Only automatically set isLoading and isError if the user does not provide any override for them
      if (templateOptions.isLoading === undefined) {
        inputsObservableMap['isLoading'] = interpolationContext.pipe(
          map((context) => context.remoteResourceState?.isLoading)
        );
      }

      if (templateOptions.isError === undefined) {
        inputsObservableMap['isError'] = interpolationContext.pipe(
          map((context) => context.remoteResourceState?.isError)
        );
      }
    }

    return combineLatest(inputsObservableMap);
  }

  #isContextBased(component: Type<unknown>): boolean {
    return !!(component as unknown as { NEED_CONTEXT?: true })['NEED_CONTEXT'];
  }
}
