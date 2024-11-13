import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  CarbonButtonElementType,
  CarbonCarouselCardElementType,
  CarbonCarouselElementType,
  CarbonSimpleTextElementType,
  CarbonTableElementType,
  CarbonTextCardElementType,
} from '@dj-ui/carbon-components/shared';
import {
  ButtonModule,
  DropdownModule,
  InlineLoadingModule,
  InlineLoadingState,
  InputModule,
  ListItem,
  LoadingModule,
} from 'carbon-components-angular';
import { catchError, map, Observable, of, switchMap, timer } from 'rxjs';

import {
  CreateAppUIElementTemplatePayload,
  UIElementTemplateService,
} from '../../../../services/ui-element-templates.service';
import { UIElementTemplatesStore } from '../state-store/uiElementTemplate.store';

const UIElementTypeMap = {
  [CarbonButtonElementType]: 'Button',
  [CarbonTableElementType]: 'Table',
  [CarbonTextCardElementType]: 'Text card',
  [CarbonCarouselElementType]: 'Carousel',
  [CarbonCarouselCardElementType]: 'Carousel card',
  [CarbonSimpleTextElementType]: 'Simple text',
};

type UIElementType = keyof typeof UIElementTypeMap;

export type NewUIElementForm = {
  id: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  type: FormControl<UIElementType>;
};

const isUIElementIdUnique = (): AsyncValidatorFn => {
  const uiElementTemplateService = inject(UIElementTemplateService);
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return timer(500).pipe(
      switchMap(() => uiElementTemplateService.getUIElementTemplateById(control.value)),
      map(() => ({ idNotUnique: true })),
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 404) {
            return of(null);
          }
        }
        return of({ idNotUnique: true });
      })
    );
  };
};

@Component({
  selector: 'namnguyen191-new-uielement-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputModule,
    ButtonModule,
    LoadingModule,
    DropdownModule,
    InlineLoadingModule,
  ],
  templateUrl: './newUIElementPage.component.html',
  styleUrl: './newUIElementPage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewUIElementPageComponent {
  #uiElementTemplatesStore = inject(UIElementTemplatesStore);
  loadingSig = this.#uiElementTemplatesStore.isPending;

  newUIElementForm = new FormGroup<NewUIElementForm>({
    id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
      asyncValidators: [isUIElementIdUnique()],
    }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl(CarbonButtonElementType, { nonNullable: true }),
  });

  uiElementTypeItems: ListItem[] = Object.entries(UIElementTypeMap)
    .map(([typeKey, typeLabel]) => ({
      content: typeLabel,
      value: typeKey,
      selected: false,
    }))
    .sort((item1, item2) => item1.content.localeCompare(item2.content));

  getFieldErrorMessage(field: keyof NewUIElementForm): string {
    const formControl = this.newUIElementForm.controls[field];

    // If the field hasn't been interacted with then we will ignore all errors
    if (!formControl.touched) {
      return '';
    }

    const errors = formControl.errors;
    if (errors === null) {
      return '';
    }

    const errorMsg: string[] = [];
    for (const errorName in errors) {
      switch (errorName) {
        case 'required':
          errorMsg.push('This field is required');
          break;
        default:
          errorMsg.push(`Unknown error: ${errorName}`);
          break;
      }
    }

    return errorMsg.join('. ');
  }

  getIdFieldState(): InlineLoadingState {
    const idField = this.newUIElementForm.controls.id;
    if (idField.pristine) {
      return InlineLoadingState.Hidden;
    }

    if (idField.pending) {
      return InlineLoadingState.Active;
    }

    if (idField.invalid) {
      return InlineLoadingState.Error;
    }

    return InlineLoadingState.Finished;
  }

  onSubmit(): void {
    const newUIElementPayload: CreateAppUIElementTemplatePayload = {
      ...this.newUIElementForm.getRawValue(),
      type: 'CARBON_TABLE',
      options: {},
    };
    this.#uiElementTemplatesStore.addOne(newUIElementPayload);
  }
}
