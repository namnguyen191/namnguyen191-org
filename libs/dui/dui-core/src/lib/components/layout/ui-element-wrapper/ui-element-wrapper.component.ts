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
  shareReplay,
  Subject,
  switchMap,
  take,
  takeUntil,
  throttleTime,
} from 'rxjs';

import { DUI_CORE_CONFIG } from '../../../global';
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
  requiredComponentSymbol = input<symbol | undefined>();

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

  readonly uiElementLoadingComponent = inject(DUI_CORE_CONFIG, { optional: true })
    ?.uiElementLoadingComponent;

  constructor() {
    this.#checkForInfiniteRenderEffect();
    this.#constructComponentEffect();
  }

  #generateComponentInputs(params: {
    interpolationContext: Observable<ElementInputsInterpolationContext>;
    templateOptions: UIElementTemplateOptions<Record<string, unknown>>;
    withRemoteResource: boolean;
  }): InputsStreams {
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
            })
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
    inputsStreams: InputsStreams;
    componentRef: ComponentRef<BaseUIElementComponent>;
    eventsHooks?: EventsToHooksMap;
    interpolationContext: Observable<ElementInputsInterpolationContext>;
  }): void {
    const { inputsStreams, componentRef, eventsHooks, interpolationContext } = params;
    this.#unsubscribeInputsSubject.next();

    for (const [inputName, valStream] of Object.entries(inputsStreams)) {
      if (this.#checkInputExistsForComponent(componentRef.componentType, inputName)) {
        valStream.pipe(takeUntil(this.#unsubscribeInputsSubject)).subscribe((val) => {
          logSubscription(`[${this.uiElementTemplateId()}] Input stream for ${inputName}`);
          componentRef.setInput(inputName, val);
        });
      } else {
        logWarning(
          `Input ${inputName} does not exist for component ${componentRef.instance.getElementType()}`
        );
      }
    }

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
              .subscribe((interpolatedHooks) => {
                logSubscription(`Output stream for ${this.uiElementTemplateId()}`);
                this.#actionHookService.triggerActionHooks(interpolatedHooks as ActionHook[]);
              });
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
      const requiredComponentSymbol = this.requiredComponentSymbol();

      this.#unsubscribeUiElementTemplate.next();
      uiElementTemplate$
        .pipe(
          filter((uiElementTemplate) => uiElementTemplate.status === 'loaded'),
          switchMap((uiElementTemplate) =>
            from(this.#uiElementFactoryService.getUIElement(uiElementTemplate.config.type)).pipe(
              map((uiElementComponent) => ({ uiElementComponent, uiElementTemplate }))
            )
          ),
          takeUntil(this.#unsubscribeUiElementTemplate)
        )
        .subscribe(({ uiElementTemplate, uiElementComponent }) => {
          logSubscription(`UI element template stream for ${this.uiElementTemplateId()}`);
          const {
            config: { remoteResourceIds, eventsHooks, stateSubscription, options },
          } = uiElementTemplate;

          uiElementVCR.clear();
          const componentRef = uiElementVCR.createComponent(
            uiElementComponent
          ) as ComponentRef<BaseUIElementComponent>;

          if (
            requiredComponentSymbol &&
            requiredComponentSymbol !== componentRef.instance.getSymbol()
          ) {
            uiElementVCR.clear();
            logWarning(
              `Wrong element received: expect ${String(requiredComponentSymbol)} but got ${String(componentRef.instance.getSymbol())}`
            );
            return;
          }

          const interpolationContext: Observable<ElementInputsInterpolationContext> =
            runInInjectionContext(this.#environmentInjector, () =>
              this.#getElementInterpolationContext({
                remoteResourceIds,
                stateSubscription,
              })
            );

          const inputsStreams = this.#generateComponentInputs({
            templateOptions: options,
            interpolationContext,
            withRemoteResource: !!remoteResourceIds?.length,
          });

          this.#setupComponent({
            componentRef,
            inputsStreams,
            eventsHooks,
            interpolationContext,
          });
        });
    });
  }

  #getElementInterpolationContext(params: {
    remoteResourceIds?: string[];
    stateSubscription?: StateSubscriptionConfig;
  }): Observable<ElementInputsInterpolationContext> {
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
