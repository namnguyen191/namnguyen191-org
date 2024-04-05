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
  OnDestroy,
  runInInjectionContext,
  Signal,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';
import { from, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';

import {
  StateSubscriptionConfig,
  UIElementInstance,
  UIElementTemplate,
  UIElementTemplateOptions,
} from '../../interfaces';
import {
  RemoteResourceService,
  UIElementFactoryService,
  UIElementTemplatesService,
} from '../../services';
import { getElementInputsInterpolationContext } from '../../services/hooks/InterpolationContext';
import { InterpolationService } from '../../services/interpolation.service';
import { logSubscription } from '../../utils/logging';

type ElemetToRender = {
  component: Type<unknown>;
  inputs: Record<string, unknown>;
};

@Component({
  selector: 'namnguyen191-ui-element-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-element-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiElementWrapperComponent implements OnDestroy {
  uiElementInstance: InputSignal<UIElementInstance> = input.required();

  #uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  #uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  #remoteResourceService: RemoteResourceService = inject(RemoteResourceService);
  #interpolationService: InterpolationService = inject(InterpolationService);
  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);

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

            runInInjectionContext(this.#environmentInjector, () => {
              this.uiElement.set({
                component: this.#uiElementFactoryService.getUIElement(template.type),

                inputs: this.#generateComponentInputs({
                  templateOptions: template.options,
                  remoteResourceId: template.remoteResourceId,
                  stateSubscription: template.stateSubscription,
                }),
              });
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
    templateOptions: UIElementTemplateOptions;
    remoteResourceId?: string;
    stateSubscription?: StateSubscriptionConfig;
  }): Record<string, unknown> {
    const { templateOptions, remoteResourceId, stateSubscription } = params;

    const interpolationContext = getElementInputsInterpolationContext({
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

    // automatically assign isLoading if it is not provided the user
    if (remoteResourceId && templateOptions.isLoading === undefined) {
      inputs['isLoading'] = this.#remoteResourceService
        .getRemoteResourceState(remoteResourceId)
        .pipe(map((resourceState) => resourceState.isLoading));
    }

    // automatically assign isError if it is not provided the user
    if (remoteResourceId && templateOptions.isError === undefined) {
      inputs['isError'] = this.#remoteResourceService
        .getRemoteResourceState(remoteResourceId)
        .pipe(map((resourceState) => resourceState.isError));
    }

    return inputs;
  }
}
