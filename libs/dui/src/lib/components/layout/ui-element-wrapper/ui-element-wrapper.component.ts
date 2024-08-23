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
  takeUntil,
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

const UI_ELEMENTS_CHAIN_TOKEN = new InjectionToken<Set<string>>('UI_ELEMENTS_CHAIN_TOKEN');

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

  uiElementTemplateId: InputSignal<string> = input.required();
  requiredComponentType: InputSignal<string | undefined> = input<string>();

  #unsubscribeElementConfig = new Subject<void>();

  #uiElementComponentRef: ComponentRef<unknown> | null = null;
  private readonly uiElementVCR: Signal<ViewContainerRef | undefined> = viewChild('uiElementVCR', {
    read: ViewContainerRef,
  });
  #unsubscribeInputSubject = new Subject<void>();
  #unsubscribeUiElementTemplate = new Subject<void>();

  readonly #uiElementTemplate: Signal<Observable<UIElementTemplateWithStatus>> = computed(() => {
    return this.#uiElementTemplatesService.getUIElementTemplate(this.uiElementTemplateId());
  });

  readonly uiElementComponent = signal<Type<unknown> | null>(null);

  readonly uiElementInputsSig$: Signal<Observable<ObjectType>> = computed(() => {
    const template = this.#uiElementTemplate();

    return template.pipe(
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

  readonly isInfinite = signal<boolean>(false);
  readonly #uiElementChain = inject(UI_ELEMENTS_CHAIN_TOKEN);
  readonly isWrongTypeError = signal<string | null>(null);

  constructor() {
    this.#getUIElementComponentEffect();
    this.#checkForInfiniteRenderEffect();
    this.#checkForRequiredComponentTypeEffect();
    this.#onNewComponentEffect();
    this.#onNewInputStreamEffect();
  }

  #generateComponentInputs(params: {
    templateOptions: UIElementTemplateOptions<Record<string, unknown>>;
    remoteResourceIds?: string[];
    stateSubscription?: StateSubscriptionConfig;
    component: Type<unknown>;
  }): Observable<ObjectType> {
    const { templateOptions, remoteResourceIds, stateSubscription, component } = params;
    const interpolationContext: Observable<ElementInputsInterpolationContext> =
      runInInjectionContext(this.#environmentInjector, () =>
        this.#getElementInputsInterpolationContext({
          remoteResourceIds,
          stateSubscription,
        })
      );

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
      debounceTime(100),
      takeUntil(this.#unsubscribeInputSubject)
    );
  }

  #isContextBased(component: Type<unknown>): boolean {
    return !!(component as unknown as { NEED_CONTEXT?: true })['NEED_CONTEXT'];
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

  #checkForRequiredComponentTypeEffect(): void {
    effect((onCleanup) => {
      onCleanup(() => {
        this.#unsubscribeUiElementTemplate.next();
        this.#unsubscribeUiElementTemplate.complete();
      });
      const uiElementTemplate$ = this.#uiElementTemplate();
      const requiredComponentType = this.requiredComponentType();

      this.#unsubscribeUiElementTemplate.next();
      uiElementTemplate$
        .pipe(takeUntil(this.#unsubscribeUiElementTemplate))
        .subscribe((uiElementTemplate) => {
          if (uiElementTemplate.status !== 'loaded' || !requiredComponentType) {
            return;
          }

          const elementComponentType = uiElementTemplate.config.type;
          if (elementComponentType !== requiredComponentType) {
            this.isWrongTypeError.set(
              `Wrong element type detected, expected: "${requiredComponentType}" but received "${elementComponentType}"`
            );
          } else {
            this.isWrongTypeError.set(null);
          }
        });
    });
  }

  #onNewComponentEffect(): void {
    effect(() => {
      const newComponent = this.uiElementComponent();
      const uiElementVCR = this.uiElementVCR();

      if (!newComponent || !uiElementVCR) {
        return;
      }

      uiElementVCR.clear();

      this.#uiElementComponentRef = uiElementVCR.createComponent(newComponent);
    });
  }

  #onNewInputStreamEffect(): void {
    effect((onCleanup) => {
      onCleanup(() => {
        this.#unsubscribeInputSubject.next();
        this.#unsubscribeInputSubject.complete();
      });
      const inputsStream = this.uiElementInputsSig$();
      this.#setupComponentInputs(inputsStream);
    });
  }

  #setupComponentInputs(inputsStream: Observable<ObjectType>): void {
    // clear any previous subscription
    this.#unsubscribeInputSubject.next();
    inputsStream.subscribe((inputs) => {
      if (!this.#uiElementComponentRef) {
        return;
      }

      for (const [inputName, inputVal] of Object.entries(inputs)) {
        this.#uiElementComponentRef.setInput(inputName, inputVal);
      }
    });
  }

  #getElementInputsInterpolationContext = (params: {
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

  #getUIElementComponentEffect(): void {
    effect((onCleanup) => {
      onCleanup(() => {
        this.#unsubscribeElementConfig.next();
        this.#unsubscribeElementConfig.complete();
      });
      const templateConfig$ = this.#uiElementTemplate();
      templateConfig$
        .pipe(takeUntil(this.#unsubscribeElementConfig))
        .subscribe((templateConfig) => {
          if (templateConfig.status !== 'loaded') {
            return;
          }
          const uiElementComponent = this.#uiElementFactoryService.getUIElement(
            templateConfig.config.type
          );
          this.uiElementComponent.set(uiElementComponent);
        });
    });
  }
}
