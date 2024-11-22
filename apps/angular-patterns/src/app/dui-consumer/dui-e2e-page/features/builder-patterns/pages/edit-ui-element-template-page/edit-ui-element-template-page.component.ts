import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DjuiComponent, LayoutTemplateService, UIElementTemplateService } from '@dj-ui/core';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { debounceTime, skip, Subject } from 'rxjs';

import { defaultPreviewLayoutConfig } from '../../../../../services/layouts.service';
import { UIElementTemplatesStore } from '../../state-store/uiElementTemplate.store';

@Component({
  selector: 'namnguyen191-edit-ui-element-template-page',
  standalone: true,
  imports: [DjuiComponent, EditorComponent, FormsModule],
  templateUrl: './edit-ui-element-template-page.component.html',
  styleUrl: './edit-ui-element-template-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUIElementTemplatePageComponent {
  readonly #layoutTemplateService = inject(LayoutTemplateService);
  readonly #currentUIElementTemplateId: string = inject(ActivatedRoute).snapshot.params['id'];
  readonly #uiElementTemplatesStore = inject(UIElementTemplatesStore);
  readonly #uiElementTemplateService = inject(UIElementTemplateService);

  readonly PREVIEW_LAYOUT_ID = defaultPreviewLayoutConfig.id;
  readonly previewLayout = toSignal(
    this.#layoutTemplateService.getLayoutTemplate(defaultPreviewLayoutConfig.id)
  );

  readonly codeChangeSubject = new Subject<string>();

  editorOptions = { theme: 'vs-dark', language: 'json' };
  code = '';

  constructor() {
    this.#uiElementTemplatesStore.updateQuery({ id: this.#currentUIElementTemplateId });
    this.codeChangeSubject.pipe(skip(1), debounceTime(500), takeUntilDestroyed()).subscribe({
      next: (newCode) => this.#onCodeChange(newCode),
    });

    this.#loadTemplateInPreview();
    this.#watchCodeChange();
  }

  #onCodeChange(code: string): void {
    try {
      const parsedTemplate = JSON.parse(code);
      this.#uiElementTemplateService.updateUIElementTemplate(parsedTemplate);
    } catch (err) {
      console.log('Something went wrong:', err);
    }
  }

  #watchCodeChange(): void {
    effect(() => {
      const currentTemplate = this.#uiElementTemplatesStore.filteredUIElementTemplates()[0];
      if (!currentTemplate) {
        return;
      }
      this.code = JSON.stringify(currentTemplate);
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
