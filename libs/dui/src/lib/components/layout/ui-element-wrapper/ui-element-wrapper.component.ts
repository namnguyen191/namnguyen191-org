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
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  from,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';

import { InterpolationService } from '../../../services/interpolation.service';
import {
  getRemoteResourcesStatesAsContext,
  RemoteResourcesStates,
} from '../../../services/remote-resource.service';
import {
  getStatesSubscriptionAsContext,
  StateMap,
  StateSubscriptionConfig,
} from '../../../services/state-store.service';
import { UIElementInstance } from '../../../services/templates/layout-template-interfaces';
import {
  UIElementTemplateOptions,
  UIElementTemplateService,
  UIElementTemplateWithStatus,
} from '../../../services/templates/ui-element-template.service';
import { UIElementFactoryService } from '../../../services/ui-element-factory.service';
import { ComponentContextPropertyKey } from '../../base-ui-element-with-context.component';

type ElementInputsInterpolationContext = {
  remoteResourcesStates: null | RemoteResourcesStates;
  state: StateMap;
};

export const getElementInputsInterpolationContext = (params: {
  remoteResourceIds?: string[];
  stateSubscription?: StateSubscriptionConfig;
}): Observable<ElementInputsInterpolationContext> => {
  const { remoteResourceIds, stateSubscription = {} } = params;

  const state = getStatesSubscriptionAsContext(stateSubscription);
  const remoteResourcesStates = remoteResourceIds?.length
    ? getRemoteResourcesStatesAsContext(remoteResourceIds)
    : of(null);

  return combineLatest({
    remoteResourcesStates,
    state,
  }).pipe(
    shareReplay({
      refCount: true,
      bufferSize: 1,
    })
  );
};

@Component({
  selector: 'namnguyen191-ui-element-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-element-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiElementWrapperComponent {
  readonly #uiElementFactoryService = inject(UIElementFactoryService);
  readonly #uiElementTemplatesService = inject(UIElementTemplateService);
  readonly #interpolationService = inject(InterpolationService);
  readonly #environmentInjector = inject(EnvironmentInjector);

  uiElementInstance: InputSignal<UIElementInstance> = input.required();

  uiElementTemplate: Signal<UIElementTemplateWithStatus> = computed(() => {
    return this.#uiElementTemplatesService.getUIElementTemplate(
      this.uiElementInstance().uiElementTemplateId
    )();
  });

  uiElementComponent: Signal<Type<unknown> | null> = computed(() => {
    const templateConfig = this.uiElementTemplate();
    if (templateConfig.status !== 'loaded') {
      return null;
    }
    return this.#uiElementFactoryService.getUIElement(templateConfig.config.type);
  });

  uiElementInputsSig$: Signal<Observable<ObjectType>> = computed(() => {
    const template = this.uiElementTemplate();

    return of(template).pipe(
      filter((template) => template.status === 'loaded'),
      switchMap((template) =>
        runInInjectionContext(this.#environmentInjector, () =>
          this.#generateComponentInputs({
            templateOptions: template.config.options,
            remoteResourceIds: template.config.remoteResourceIds,
            stateSubscription: template.config.stateSubscription,
            component: this.#uiElementFactoryService.getUIElement(template.config.type),
          })
        )
      )
    );
  });

  #generateComponentInputs(params: {
    templateOptions: UIElementTemplateOptions<Record<string, unknown>>;
    remoteResourceIds?: string[];
    stateSubscription?: StateSubscriptionConfig;
    component: Type<unknown>;
  }): Observable<ObjectType> {
    const { templateOptions, remoteResourceIds, stateSubscription, component } = params;
    const interpolationContext: Observable<ElementInputsInterpolationContext> =
      getElementInputsInterpolationContext({
        remoteResourceIds,
        stateSubscription,
      });

    const inputsObservableMap: Record<string, Observable<unknown>> = {};
    for (const [key, val] of Object.entries(templateOptions)) {
      const requiredInterpolation = this.#interpolationService.checkForInterpolation(val);

      inputsObservableMap[key] = !requiredInterpolation
        ? of(val)
        : interpolationContext.pipe(
            switchMap((context) => {
              {
                return from(
                  this.#interpolationService.interpolate({
                    context,
                    value: val,
                  })
                ).pipe(
                  catchError(() => {
                    console.warn(`Fail to interpolate ${key}`);
                    return EMPTY;
                  })
                );
              }
            }),
            distinctUntilChanged(isEqual)
          );
    }

    if (this.#isContextBased(component)) {
      (inputsObservableMap[ComponentContextPropertyKey] as unknown) = interpolationContext;
    }

    if (remoteResourceIds) {
      // Only automatically set isLoading and isError if the user does not provide any override for them
      if (templateOptions.isLoading === undefined) {
        inputsObservableMap['isLoading'] = interpolationContext.pipe(
          map((context) => !!context.remoteResourcesStates?.isPartialLoading.length)
        );
      }

      if (templateOptions.isError === undefined) {
        inputsObservableMap['isError'] = interpolationContext.pipe(
          map((context) => !!context.remoteResourcesStates?.isPartialError.length)
        );
      }
    }

    return combineLatest(inputsObservableMap).pipe(
      distinctUntilChanged(isEqual),
      debounceTime(100)
    );
  }

  #isContextBased(component: Type<unknown>): boolean {
    return !!(component as unknown as { NEED_CONTEXT?: true })['NEED_CONTEXT'];
  }
}
