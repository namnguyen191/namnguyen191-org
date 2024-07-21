import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
  distinctUntilChanged,
  EMPTY,
  filter,
  from,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';

import {
  ComponentContextPropertyKey,
  StateSubscriptionConfig,
  UIElementInstance,
  UIElementTemplateOptions,
} from '../../../interfaces';
import {
  EventsService,
  UIElementFactoryService,
  UIElementTemplateConfigWithStatus,
  UIElementTemplatesService,
} from '../../../services';
import {
  ElementInputsInterpolationContext,
  getElementInputsInterpolationContext,
} from '../../../services/hooks/InterpolationContext';
import { InterpolationService } from '../../../services/interpolation.service';

@Component({
  selector: 'namnguyen191-ui-element-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-element-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiElementWrapperComponent {
  #uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  #uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  #interpolationService: InterpolationService = inject(InterpolationService);
  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);
  #eventsService: EventsService = inject(EventsService);

  uiElementInstance: InputSignal<UIElementInstance> = input.required();

  uiElementTemplate: Signal<Signal<UIElementTemplateConfigWithStatus>> = computed(() => {
    return this.#uiElementTemplatesService.getUIElementTemplate(
      this.uiElementInstance().uiElementTemplateId
    );
  });

  uiElementComponent: Signal<Type<unknown> | null> = computed(() => {
    const templateConfig = this.uiElementTemplate()();
    if (templateConfig.status !== 'loaded') {
      return null;
    }
    return this.#uiElementFactoryService.getUIElement(templateConfig.config.type);
  });

  uiElementInputsSig$: Signal<Observable<ObjectType>> = computed(() => {
    const template = this.uiElementTemplate()();
    return of(template).pipe(
      filter((template) => template.status === 'loaded'),
      switchMap((template) =>
        runInInjectionContext(this.#environmentInjector, () =>
          this.#generateComponentInputs({
            templateOptions: template.config.options,
            remoteResourceId: template.config.remoteResourceId,
            stateSubscription: template.config.stateSubscription,
            component: this.#uiElementFactoryService.getUIElement(template.config.type),
          })
        )
      )
    );
  });

  constructor() {
    effect(() => {
      const template = this.uiElementTemplate()();
      if (template.status === 'missing') {
        this.#eventsService.emitEvent({
          type: 'MISSING_UI_ELEMENT_TEMPLATE',
          payload: {
            id: template.id,
          },
        });
      }
    });
  }

  #generateComponentInputs(params: {
    templateOptions: UIElementTemplateOptions<Record<string, unknown>>;
    remoteResourceId?: string;
    stateSubscription?: StateSubscriptionConfig;
    component: Type<unknown>;
  }): Observable<ObjectType> {
    const { templateOptions, remoteResourceId, stateSubscription, component } = params;

    const interpolationContext: Observable<ElementInputsInterpolationContext> =
      getElementInputsInterpolationContext({
        remoteResourceId,
        stateSubscription,
      });

    const inputsObservableMap: Record<string, Observable<unknown>> = {};
    for (const [key, val] of Object.entries(templateOptions)) {
      const requiredInterpolation$ = from(this.#interpolationService.checkForInterpolation(val));

      inputsObservableMap[key] = requiredInterpolation$.pipe(
        switchMap((requiredInterpolation) => {
          if (!requiredInterpolation) {
            return of(val);
          }

          return interpolationContext.pipe(
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
        })
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
