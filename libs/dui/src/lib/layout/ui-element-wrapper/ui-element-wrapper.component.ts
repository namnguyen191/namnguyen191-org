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
  Signal,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';
import {
  combineLatest,
  from,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

import {
  AvailableStateScopes,
  StateSubscriptionConfig,
  UIElementInstance,
  UIElementTemplate,
} from '../../interfaces';
import {
  RemoteResourceService,
  UIElementFactoryService,
  UIElementTemplatesService,
} from '../../services';
import { InterpolationService } from '../../services/interpolation.service';
import { StateStoreService } from '../../services/state-store.service';
import { logSubscription } from '../../utils/logging';

type ElemetToRender = {
  component: Type<unknown>;
  inputs: Record<string, unknown>;
};

type ElementInputsInterpolationContext = {
  data: unknown;
  state: {
    [K in AvailableStateScopes]: Record<string, unknown>;
  };
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

  #uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  #uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  #remoteResourceService: RemoteResourceService = inject(RemoteResourceService);
  #interpolationService: InterpolationService = inject(InterpolationService);
  #stateStoreService: StateStoreService = inject(StateStoreService);

  #cancelTemplateSubscriptionSubject = new Subject<void>();
  #destroyRef = new Subject<void>();

  uiElementTemplate: Signal<Observable<UIElementTemplate>> = computed(() => {
    return this.#uiElementTemplatesService.getUIElementTemplate(
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
          .pipe(takeUntil(this.#cancelTemplateSubscriptionSubject), takeUntil(this.#destroyRef))
          .subscribe((template) => {
            logSubscription(`Template for UI element instance ${this.uiElementInstance().id}`);
            if (!template) {
              return;
            }

            this.uiElement.set({
              component: this.#uiElementFactoryService.getUIElement(template.type),

              inputs: this.#generateComponentInputs({
                templateOptions: template.options,
                remoteResourceId: template.remoteResourceId,
                stateSubscription: template.stateSubscription,
              }),
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
    this.#destroyRef.next();
    this.#destroyRef.complete();
  }

  #generateComponentInputs(params: {
    templateOptions: Record<string, unknown>;
    remoteResourceId?: string;
    stateSubscription?: StateSubscriptionConfig;
  }): Record<string, unknown> {
    const { templateOptions, remoteResourceId, stateSubscription } = params;

    const interpolationContext = this.#getElementInputsInterpolationContext({
      remoteResourceId,
      stateSubscription,
    });
    const inputs: Record<string, unknown> = {};
    for (const [optionName, optionValue] of Object.entries(templateOptions)) {
      inputs[optionName] = interpolationContext.pipe(
        switchMap((context) =>
          from(
            this.#interpolationService.interpolate({
              context,
              value: optionValue,
            })
          )
        )
      );
    }

    if (remoteResourceId) {
      inputs['isLoading'] = this.#remoteResourceService
        .getRemoteResourceState(remoteResourceId)
        .pipe(map((resourceState) => resourceState.isLoading));
    }

    return inputs;
  }

  #getElementInputsInterpolationContext(params: {
    remoteResourceId?: string;
    stateSubscription?: StateSubscriptionConfig;
  }): Observable<ElementInputsInterpolationContext> {
    const { remoteResourceId, stateSubscription = {} } = params;

    const remoteData: Observable<unknown | null> = remoteResourceId
      ? this.#remoteResourceService
          .getRemoteResourceState(remoteResourceId)
          .pipe(map((state) => state.result))
      : of(null);

    const { local, layout, global } = stateSubscription;

    const localState: Observable<Record<string, unknown>> = local
      ? this.#stateStoreService.getLocalState()
      : of({});

    const globalState: Observable<Record<string, unknown>> = global
      ? this.#stateStoreService.getGlobalState()
      : of({});

    const layoutState: Observable<Record<string, unknown>> = layout
      ? this.#stateStoreService.getLayoutState()
      : of({});

    return combineLatest({
      data: remoteData,
      globalState,
      localState,
      layoutState,
    }).pipe(
      map(({ data, globalState, localState, layoutState }) => ({
        data,
        state: {
          global: globalState,
          local: localState,
          layout: layoutState,
        },
      })),
      shareReplay(1)
    );
  }
}
