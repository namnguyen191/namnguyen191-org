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
  reflectComponentType,
  runInInjectionContext,
  Signal,
  signal,
  Type,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { computedFromObservable } from '@namnguyen191/common-angular-helper';
import { ObjectType } from '@namnguyen191/types-helper';
import { isEqual } from 'lodash-es';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  from,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  take,
  takeUntil,
  throttleTime,
} from 'rxjs';

import { CORE_CONFIG } from '../../../global';
import {
  ActionHook,
  ActionHookService,
} from '../../../services/events-and-actions/action-hook.service';
import { InterpolationService } from '../../../services/interpolation.service';
import {
  getRemoteResourcesStatesAsContext,
  RemoteResourcesStates,
} from '../../../services/remote-resource.service';
import { getStatesSubscriptionAsContext, StateMap } from '../../../services/state-store.service';
import {
  UIElementTemplateService,
  UIElementTemplateWithStatus,
} from '../../../services/templates/ui-element-template.service';
import { UIElementFactoryService } from '../../../services/ui-element-factory.service';
import { logSubscription, logWarning } from '../../../utils/logging';
import { BaseUIElementComponent } from '../../base-ui-element.component';

type ElementInputsInterpolationContext = {
  remoteResourcesStates: null | RemoteResourcesStates;
  state: StateMap;
};

const UI_ELEMENTS_CHAIN_TOKEN = new InjectionToken<Set<string>>('UI_ELEMENTS_CHAIN_TOKEN');

type InputsStreams = {
  [inputName: string]: Observable<unknown>;
};

@Component({
  selector: 'dj-ui-element-wrapper',
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
  requiredComponentSymbols = input<symbol[]>([]);

  private readonly uiElementVCR: Signal<ViewContainerRef | undefined> = viewChild('uiElementVCR', {
    read: ViewContainerRef,
  });

  readonly uiElementTemplate: Signal<UIElementTemplateWithStatus | undefined> =
    computedFromObservable(() => {
      return this.#uiElementTemplatesService.getUIElementTemplate(this.uiElementTemplateId());
    });

  readonly uiElementComponent: Signal<Type<BaseUIElementComponent> | undefined> =
    computedFromObservable(() => {
      const uiElementTemp = this.uiElementTemplate();
      if (!uiElementTemp || !uiElementTemp.config) {
        return of(undefined);
      }

      return from(this.#uiElementFactoryService.getUIElement(uiElementTemp.config.type));
    });

  readonly #uiElementComponentRef: Signal<ComponentRef<BaseUIElementComponent> | null> = computed(
    () => {
      const vcr = this.uiElementVCR();
      const uiElementComp = this.uiElementComponent();
      const uiElementTemplateId = this.uiElementTemplateId();
      if (!vcr || !uiElementComp) {
        return null;
      }
      vcr.clear();

      const componentSymbol: symbol = (uiElementComp as unknown as typeof BaseUIElementComponent)
        .ELEMENT_SYMBOL;
      const requiredComponentSymbols = this.requiredComponentSymbols();
      if (requiredComponentSymbols.length && !requiredComponentSymbols.includes(componentSymbol)) {
        logWarning(
          `${uiElementTemplateId}: Wrong element received: expect ${requiredComponentSymbols.map((sym) => String(sym)).join('or ')} but got ${String(componentSymbol)}`
        );
        return null;
      }

      return vcr.createComponent(uiElementComp);
    }
  );

  readonly #elementInterpolationContext: Signal<Observable<ElementInputsInterpolationContext> | null> =
    computed(() => {
      const uiElementTemplate = this.uiElementTemplate();

      if (!uiElementTemplate || !(uiElementTemplate.status === 'loaded')) {
        return null;
      }

      const { remoteResourceIds, stateSubscription = {} } = uiElementTemplate.config;

      const state = runInInjectionContext(this.#environmentInjector, () =>
        getStatesSubscriptionAsContext(stateSubscription)
      );
      const remoteResourcesStates = remoteResourceIds?.length
        ? runInInjectionContext(this.#environmentInjector, () =>
            getRemoteResourcesStatesAsContext(remoteResourceIds)
          )
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
    });

  readonly #componentInputsStream: Signal<InputsStreams | null> = computed(() => {
    const uiElementTemplate = this.uiElementTemplate();
    const elementInterpolationContext = this.#elementInterpolationContext();

    if (uiElementTemplate?.status !== 'loaded' || !elementInterpolationContext) {
      return null;
    }

    const {
      config: { options: templateOptions, remoteResourceIds },
    } = uiElementTemplate;

    const inputsObservableMap: Record<string, Observable<unknown>> = {};
    for (const [key, val] of Object.entries(templateOptions)) {
      const requiredInterpolation = this.#interpolationService.checkForInterpolation(val);

      inputsObservableMap[key] = !requiredInterpolation
        ? of(val)
        : elementInterpolationContext.pipe(
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
            })
          );
    }

    if (remoteResourceIds?.length) {
      // Only automatically set isLoading and isError if the user does not provide any override for them
      if (templateOptions.isLoading === undefined) {
        inputsObservableMap['isLoading'] = elementInterpolationContext.pipe(
          map((context) => !!context.remoteResourcesStates?.isPartialLoading.length)
        );
      }

      if (templateOptions.isError === undefined) {
        inputsObservableMap['isError'] = elementInterpolationContext.pipe(
          map((context) => !!context.remoteResourcesStates?.isPartialError.length)
        );
      }
    }

    const debouncedAndDistinctInputs = Object.fromEntries(
      Object.entries(inputsObservableMap).map(([inputName, valObs]) => [
        inputName,
        valObs.pipe(
          distinctUntilChanged(isEqual),
          throttleTime(500, undefined, { leading: true, trailing: true })
        ),
      ])
    );

    return debouncedAndDistinctInputs;
  });

  readonly isInfinite = signal<boolean>(false);
  readonly #uiElementChain = inject(UI_ELEMENTS_CHAIN_TOKEN);

  readonly uiElementLoadingComponent = inject(CORE_CONFIG, { optional: true })
    ?.uiElementLoadingComponent;

  constructor() {
    this.#checkForInfiniteRenderEffect();
    this.#setupComponentEffect();
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

  #setupComponentEffect(): void {
    effect((onCleanup) => {
      const componentInputsStream = this.#componentInputsStream();
      const componentRef = this.#uiElementComponentRef();
      const uiElementTemplate = this.uiElementTemplate();
      const elementInterpolationContext = this.#elementInterpolationContext();

      if (
        !componentInputsStream ||
        !componentRef ||
        uiElementTemplate?.status !== 'loaded' ||
        !elementInterpolationContext
      ) {
        return;
      }

      const unsubscribeInputsSubject = new Subject<void>();
      onCleanup(() => {
        unsubscribeInputsSubject.next();
        unsubscribeInputsSubject.complete();
      });

      for (const [inputName, valStream] of Object.entries(componentInputsStream)) {
        if (this.#checkInputExistsForComponent(componentRef.componentType, inputName)) {
          valStream.pipe(takeUntil(unsubscribeInputsSubject)).subscribe((val) => {
            logSubscription(`[${this.uiElementTemplateId()}] Input stream for ${inputName}`);
            componentRef.setInput(inputName, val);
          });
        } else {
          logWarning(
            `Input ${inputName} does not exist for component ${componentRef.instance.getElementType()}`
          );
        }
      }

      const { eventsHooks } = uiElementTemplate.config;
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
            const latestContext = elementInterpolationContext.pipe(take(1));

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
                .subscribe((interpolatedHooks) => {
                  logSubscription(`Output stream for ${this.uiElementTemplateId()}`);
                  this.#actionHookService.triggerActionHooks(interpolatedHooks as ActionHook[]);
                });
            });
          }
        }
      }
    });
  }

  #checkInputExistsForComponent(componentClass: Type<unknown>, inputName: string): boolean {
    const componentInputs = reflectComponentType(componentClass)?.inputs;

    if (!componentInputs) {
      throw new Error('Invalid component');
    }

    return !!componentInputs.find(
      (input) => input.propName === inputName || input.templateName === inputName
    );
  }
}
