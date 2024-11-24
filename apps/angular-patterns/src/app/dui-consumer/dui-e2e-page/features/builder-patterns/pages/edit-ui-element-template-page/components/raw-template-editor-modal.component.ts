import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LayoutTemplateService, UIElementTemplateService } from '@dj-ui/core';
import { BaseModal, ButtonModule, LoadingModule, ModalModule } from 'carbon-components-angular';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserEstree from 'prettier/plugins/estree';
import * as prettier from 'prettier/standalone';
import { debounceTime, skip, Subject } from 'rxjs';

import { defaultPreviewLayoutConfig } from '../../../../../../services/layouts.service';
import { AppUIElementTemplate } from '../../../../../../services/ui-element-templates.service';
import { UIElementTemplatesStore } from '../../../state-store/uiElementTemplate.store';

@Component({
  selector: 'namnguyen191-raw-template-editor-modal',
  standalone: true,
  imports: [CommonModule, ModalModule, EditorComponent, FormsModule, LoadingModule, ButtonModule],
  templateUrl: './raw-template-editor-modal.component.html',
  styleUrl: './raw-template-editor-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RawTemplateEditorModalComponent extends BaseModal {
  readonly #layoutTemplateService = inject(LayoutTemplateService);
  readonly #uiElementTemplatesStore = inject(UIElementTemplatesStore);
  readonly #uiElementTemplateService = inject(UIElementTemplateService);

  readonly loadingSig = this.#uiElementTemplatesStore.isPending;

  readonly PREVIEW_LAYOUT_ID = defaultPreviewLayoutConfig.id;
  readonly previewLayout = toSignal(
    this.#layoutTemplateService.getLayoutTemplate(defaultPreviewLayoutConfig.id)
  );
  readonly codeChangeSubject = new Subject<string>();

  readonly editorOptions = { theme: 'vs-dark', language: 'json' };
  code: string = '';

  constructor() {
    super();
    this.codeChangeSubject.pipe(skip(1), debounceTime(500), takeUntilDestroyed()).subscribe({
      next: (newCode) => this.#onCodeChange(newCode),
    });

    this.#watchCodeChange();
  }

  async updateUIElementTemplate(): Promise<void> {
    const templateFromCode = JSON.parse(this.code) as AppUIElementTemplate;
    const { updatedAt, createdAt, ...updatePayload } = templateFromCode;

    await this.#uiElementTemplatesStore.updateOne(updatePayload);
    this.closeModal();
  }

  #watchCodeChange(): void {
    effect(async () => {
      const currentTemplate = this.#uiElementTemplatesStore.filteredUIElementTemplates()[0];
      if (!currentTemplate) {
        return;
      }
      const rawJSON = JSON.stringify(currentTemplate);
      const prettifyJSON = await this.#formatJSON(rawJSON);
      this.code = prettifyJSON;
    });
  }

  async #formatJSON(rawJSON: string): Promise<string> {
    const formatted = await prettier.format(rawJSON, {
      parser: 'json',
      plugins: [parserBabel, parserEstree],
    });

    return formatted;
  }

  #onCodeChange(code: string): void {
    try {
      const parsedTemplate = JSON.parse(code);
      this.#uiElementTemplateService.updateUIElementTemplate(parsedTemplate);
    } catch (err) {
      console.log('Something went wrong:', err);
    }
  }
}
