import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  effect,
  EnvironmentInjector,
  inject,
  InjectionToken,
  input,
  InputSignal,
  OutputEmitterRef,
  runInInjectionContext,
  Signal,
  signal,
  Type,
  viewChild,
  ViewContainerRef,
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
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';

import {
  ActionHook,
  ActionHookService,
} from '../../../services/events-and-actions/action-hook.service';
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
import {
  EventsToHooksMap,
  UIElementTemplateOptions,
  UIElementTemplateService,
  UIElementTemplateWithStatus,
} from '../../../services/templates/ui-element-template.service';
import { UIElementFactoryService } from '../../../services/ui-element-factory.service';
import { logWarning } from '../../../utils/logging';
import { BaseUIElementComponent } from '../../base-ui-element.component';

type ElementInputsInterpolationContext = {
  remoteResourcesStates: null | RemoteResourcesStates;
  state: StateMap;
};

const UI_ELEMENTS_CHAIN_TOKEN = new InjectionToken<Set<string>>('UI_ELEMENTS_CHAIN_TOKEN');

export const getElementInterpolationContext = (params: {
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
  providers: [
    {
      provide: UI_ELEMENTS_CHAIN_TOKEN,
      useFactory: (): Set<string> => {
        const existingToken = inject(UI_ELEMENTS_CHAIN_TOKEN, { optional: true, skipSelf: true });
        return existingToken ? structuredClone(existingToken) : new Set();
      },
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiElementWrapperComponent {
  readonly #uiElementFactoryService = inject(UIElementFactoryService);
  readonly #uiElementTemplatesService = inject(UIElementTemplateService);
  readonly #interpolationService = inject(InterpolationService);
  readonly #environmentInjector = inject(EnvironmentInjector);
  readonly #actionHookService = inject(ActionHookService);

  uiElementTemplateId: InputSignal<string> = input.required();
  requiredComponentType: InputSignal<string | undefined> = input<string>();

  private readonly uiElementVCR: Signal<ViewContainerRef | undefined> = viewChild('uiElementVCR', {
    read: ViewContainerRef,
  });
  #unsubscribeInputsSubject = new Subject<void>();
  #unsubscribeUiElementTemplate = new Subject<void>();

  readonly uiElementTemplate: Signal<Observable<UIElementTemplateWithStatus>> = computed(() => {
    return this.#uiElementTemplatesService.getUIElementTemplate(this.uiElementTemplateId());
  });

  readonly uiElementComponent = signal<Type<unknown> | null>(null);

  readonly isInfinite = signal<boolean>(false);
  readonly #uiElementChain = inject(UI_ELEMENTS_CHAIN_TOKEN);

  constructor() {
    this.#checkForInfiniteRenderEffect();
    this.#constructComponentEffect();
  }

  #generateComponentInputs(params: {
    interpolationContext: Observable<ElementInputsInterpolationContext>;
    templateOptions: UIElementTemplateOptions<Record<string, unknown>>;
    withRemoteResource: boolean;
  }): Observable<ObjectType> {
    const { templateOptions, withRemoteResource, interpolationContext } = params;

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

    if (withRemoteResource) {
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

  #checkForInfiniteRenderEffect(): void {
    effect(
      (onCleanup) => {
        const uiElementTemplateId = this.uiElementTemplateId();

        onCleanup(() => {
          this.#uiElementChain.delete(uiElementTemplateId);
        });

        const isInfinite = this.#uiElementChain.has(uiElementTemplateId);

        if (isInfinite) {
          let chains = '';
          this.#uiElementChain.forEach((elementInChainId) => {
            chains += chains ? `->${elementInChainId}` : elementInChainId;
          });
          chains += `->${uiElementTemplateId}`;
          console.error(
            `UI element with id ${uiElementTemplateId} has already existed in parents: ${chains}`
          );
        } else {
          this.#uiElementChain.add(uiElementTemplateId);
        }

        this.isInfinite.set(isInfinite);
      },
      {
        allowSignalWrites: true,
      }
    );
  }

  #setupComponent(params: {
    inputsStream: Observable<ObjectType>;
    componentRef: ComponentRef<BaseUIElementComponent>;
    eventsHooks?: EventsToHooksMap;
    interpolationContext: Observable<ElementInputsInterpolationContext>;
  }): void {
    const { inputsStream, componentRef, eventsHooks, interpolationContext } = params;
    this.#unsubscribeInputsSubject.next();
    inputsStream.pipe(takeUntil(this.#unsubscribeInputsSubject)).subscribe((inputs) => {
      for (const [inputName, inputVal] of Object.entries(inputs)) {
        componentRef.setInput(inputName, inputVal);
      }
    });

    if (eventsHooks) {
      for (const [eventName, hooks] of Object.entries(eventsHooks)) {
        const componentOutput = (componentRef.instance as unknown as ObjectType)[eventName] as
          | undefined
          | OutputEmitterRef<unknown>;

        if (!componentOutput || !(componentOutput instanceof OutputEmitterRef)) {
          logWarning(
            `Element ${componentRef.instance.getElementType()} has no support for event "${eventName}"`
          );
        } else {
          const latestContext = interpolationContext.pipe(take(1));

          componentOutput.subscribe((outputVal) => {
            latestContext
              .pipe(
                switchMap((latestContextVal) =>
                  this.#interpolationService.interpolate({
                    value: hooks,
                    context: { ...latestContextVal, ...(outputVal ?? {}) },
                  })
                )
              )
              .subscribe((interpolatedHooks) =>
                this.#actionHookService.triggerActionHooks(interpolatedHooks as ActionHook[])
              );
          });
        }
      }
    }
  }

  #constructComponentEffect(): void {
    effect((onCleanup) => {
      onCleanup(() => {
        this.#unsubscribeUiElementTemplate.next();
        this.#unsubscribeUiElementTemplate.complete();
        this.#unsubscribeInputsSubject.next();
        this.#unsubscribeInputsSubject.complete();
      });

      const uiElementVCR = this.uiElementVCR();

      if (!uiElementVCR) {
        return;
      }

      const uiElementTemplate$ = this.uiElementTemplate();

      this.#unsubscribeUiElementTemplate.next();
      uiElementTemplate$
        .pipe(
          filter((uiElementTemplate) => uiElementTemplate.status === 'loaded'),
          takeUntil(this.#unsubscribeUiElementTemplate)
        )
        .subscribe((uiElementTemplate) => {
          const {
            config: { type, remoteResourceIds, eventsHooks, stateSubscription, options },
          } = uiElementTemplate;
          const uiElementComponent = this.#uiElementFactoryService.getUIElement(type);

          uiElementVCR.clear();
          const componentRef = uiElementVCR.createComponent(
            uiElementComponent
          ) as ComponentRef<BaseUIElementComponent>;

          const interpolationContext: Observable<ElementInputsInterpolationContext> =
            runInInjectionContext(this.#environmentInjector, () =>
              getElementInterpolationContext({
                remoteResourceIds,
                stateSubscription,
              })
            );

          const inputsStream = this.#generateComponentInputs({
            templateOptions: options,
            interpolationContext,
            withRemoteResource: !!remoteResourceIds?.length,
          });

          this.#setupComponent({
            componentRef,
            inputsStream,
            eventsHooks,
            interpolationContext,
          });
        });
    });
  }
}
