import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  BaseModal,
  ButtonModule,
  InlineLoadingModule,
  LoadingModule,
  ModalModule,
} from 'carbon-components-angular';
import { editor } from 'monaco-editor';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserEstree from 'prettier/plugins/estree';
import * as prettier from 'prettier/standalone';
import { debounceTime, Subject, tap } from 'rxjs';

import { AppUIElementTemplateEditableFields } from '../../../../../../services/ui-element-templates.service';
import { UIElementTemplatesStore } from '../../../state-store/uiElementTemplate.store';
import { UIElementTemplateEditorStore } from '../../../state-store/uiElementTemplateEditor.store';

export type IStandaloneEditorConstructionOptions = NonNullable<Parameters<typeof editor.create>[1]>;

@Component({
  selector: 'namnguyen191-raw-template-editor-modal',
  standalone: true,
  imports: [
    CommonModule,
    ModalModule,
    EditorComponent,
    FormsModule,
    LoadingModule,
    ButtonModule,
    InlineLoadingModule,
  ],
  templateUrl: './raw-template-editor-modal.component.html',
  styleUrl: './raw-template-editor-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RawTemplateEditorModalComponent extends BaseModal {
  readonly #uiElementTemplatesStore = inject(UIElementTemplatesStore);
  readonly #uiElementTemplateEditorStore = inject(UIElementTemplateEditorStore);

  readonly loadingSig = this.#uiElementTemplatesStore.isPending;

  readonly codeChangeSubject = new Subject<string>();
  readonly editorOptions: IStandaloneEditorConstructionOptions = {
    theme: 'vs-dark',
    language: 'json',
    wordWrap: 'on',
  };
  code: string = '';
  readonly errorStateSig = signal<'noError' | 'isError' | 'isPending'>('noError');
  #originalCode = '';

  constructor() {
    super();
    this.codeChangeSubject
      .pipe(
        tap({
          next: () => this.errorStateSig.set('isPending'),
        }),
        debounceTime(500),
        tap({
          next: (code) => {
            if (this.#isValidCode(code)) {
              this.errorStateSig.set('noError');
            } else {
              this.errorStateSig.set('isError');
            }
          },
        }),
        takeUntilDestroyed()
      )
      .subscribe();

    this.#loadTemplateIntoCode();
  }

  async updateUIElementTemplate(): Promise<void> {
    const templateFromCode = JSON.parse(this.code) as AppUIElementTemplateEditableFields;

    this.#uiElementTemplateEditorStore.updateCurrentEditingTemplate(templateFromCode);
    const latestEditedTemplated = untracked(
      this.#uiElementTemplateEditorStore.currentEditingTemplate
    );

    if (!latestEditedTemplated) {
      console.error('Edited template is missing from store');
      return;
    }

    await this.#uiElementTemplatesStore.updateOne(latestEditedTemplated);
    if (!untracked(this.#uiElementTemplatesStore.error)) {
      this.closeModal();
    }
  }

  #loadTemplateIntoCode(): void {
    effect(async () => {
      const currentEditableTemplate = this.#uiElementTemplateEditorStore.currentEditableFields();
      if (!currentEditableTemplate) {
        return;
      }

      const rawJSON = JSON.stringify(currentEditableTemplate);
      const prettifyJSON = await this.#formatJSON(rawJSON);
      this.code = this.#originalCode = prettifyJSON;
    });
  }

  async #formatJSON(rawJSON: string): Promise<string> {
    const formatted = await prettier.format(rawJSON, {
      parser: 'json',
      plugins: [parserBabel, parserEstree],
    });

    return formatted;
  }

  #isValidCode(code: string): boolean {
    try {
      JSON.parse(code);
      return true;
    } catch (err) {
      console.log('Something went wrong:', err);
      return false;
    }
  }

  override closeModal(): void {
    this.code = this.#originalCode;
    super.closeModal();
  }
}
