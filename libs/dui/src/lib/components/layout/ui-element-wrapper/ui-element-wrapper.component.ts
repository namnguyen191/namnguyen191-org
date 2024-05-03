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
import { ObjectType } from '@namnguyen191/types-helper';
import { from, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';

import {
  ComponentContextPropertyKey,
  StateSubscriptionConfig,
  UIElementInstance,
  UIElementTemplate,
  UIElementTemplateOptions,
} from '../../../interfaces';
import {
  RemoteResourceService,
  UIElementFactoryService,
  UIElementTemplatesService,
} from '../../../services';
import { getElementInputsInterpolationContext } from '../../../services/hooks/InterpolationContext';
import { InterpolationService } from '../../../services/interpolation.service';
import { logSubscription } from '../../../utils/logging';

type ElemetToRender = {
  component: Type<unknown>;
  inputs: ObjectType;
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

            const component = this.#uiElementFactoryService.getUIElement(template.type);

            return runInInjectionContext(this.#environmentInjector, () => {
              this.uiElement.set({
                component,
                inputs: this.#generateComponentInputs({
                  templateOptions: template.options,
                  remoteResourceId: template.remoteResourceId,
                  stateSubscription: template.stateSubscription,
                  component,
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
    component: Type<unknown>;
  }): ObjectType {
    const { templateOptions, remoteResourceId, stateSubscription, component } = params;

    const interpolationContext = getElementInputsInterpolationContext({
      remoteResourceId,
      stateSubscription,
    });

    const inputs: ObjectType = {};
    for (const [optionName, optionValue] of Object.entries(templateOptions)) {
      inputs[optionName] = interpolationContext.pipe(
        switchMap((context) => {
          return from(
            this.#interpolationService.interpolate({
              context,
              value: optionValue,
            })
          );
        })
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

    // Pass down interpolation context
    if (this.#isContextBased(component)) {
      inputs[ComponentContextPropertyKey] = interpolationContext;
    }

    return inputs;
  }

  #isContextBased(component: Type<unknown>): boolean {
    const allProperties = Object.getOwnPropertyNames(new component());
    return allProperties.includes(ComponentContextPropertyKey);
  }
}
