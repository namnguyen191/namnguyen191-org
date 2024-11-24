import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Edit16 from '@carbon/icons/es/edit/16';
import { DjuiComponent, LayoutTemplateService } from '@dj-ui/core';
import { ButtonModule, IconModule, IconService } from 'carbon-components-angular';
import { map } from 'rxjs';

import { defaultPreviewLayoutConfig } from '../../../../../services/layouts.service';
import { UIElementTemplatesStore } from '../../state-store/uiElementTemplate.store';
import { RawTemplateEditorModalComponent } from './components/raw-template-editor-modal.component';

@Component({
  selector: 'namnguyen191-edit-ui-element-template-page',
  standalone: true,
  imports: [DjuiComponent, FormsModule, ButtonModule, IconModule, RawTemplateEditorModalComponent],
  templateUrl: './edit-ui-element-template-page.component.html',
  styleUrl: './edit-ui-element-template-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUIElementTemplatePageComponent {
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #uiElementTemplatesStore = inject(UIElementTemplatesStore);
  readonly #layoutTemplateService = inject(LayoutTemplateService);
  readonly #iconService = inject(IconService);

  readonly #currentUIElementTemplateId: string = this.#activatedRoute.snapshot.params['id'];
  readonly #showEditModalQueryParam = 'editRawTemplate';
  readonly isRawTemplateEditorModalOpenSig = toSignal(
    this.#activatedRoute.queryParams.pipe(
      map((params) => params[this.#showEditModalQueryParam] === 'true')
    ),
    {
      initialValue: false,
    }
  );

  readonly PREVIEW_LAYOUT_ID = defaultPreviewLayoutConfig.id;
  readonly previewLayout = toSignal(
    this.#layoutTemplateService.getLayoutTemplate(defaultPreviewLayoutConfig.id)
  );

  constructor() {
    this.#iconService.registerAll([Edit16]);
    this.#uiElementTemplatesStore.updateQuery({ id: this.#currentUIElementTemplateId });

    this.#loadTemplateInPreview();
  }

  toggleModal(show: boolean): void {
    this.#router.navigate([], {
      relativeTo: this.#activatedRoute,
      queryParams: {
        [this.#showEditModalQueryParam]: show ? true : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  #loadTemplateInPreview(): void {
    let isLoaded = false;
    effect(
      () => {
        if (isLoaded) {
          return;
        }

        const currentPreviewLayout = this.previewLayout();

        if (!(currentPreviewLayout?.status === 'loaded')) {
          return;
        }
        // this.#uiElementTemplateService.registerUIElementTemplate(currentTemplate);
        this.#layoutTemplateService.updateLayoutTemplate({
          ...defaultPreviewLayoutConfig,
          uiElementInstances: [
            {
              id: 'instance-1',
              uiElementTemplateId: this.#currentUIElementTemplateId,
            },
          ],
        });
        isLoaded = true;
      },
      {
        allowSignalWrites: true,
      }
    );
  }
}
