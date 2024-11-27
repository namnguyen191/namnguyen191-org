import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LayoutTemplateService, UIElementTemplateService } from '@dj-ui/core';
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

import { defaultPreviewLayoutConfig } from '../../../../../../services/layouts.service';
import {
  AppUIElementTemplateEditableFields,
  AppUIElementTemplateUnEditableFields,
} from '../../../../../../services/ui-element-templates.service';
import { UIElementTemplatesStore } from '../../../state-store/uiElementTemplate.store';

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
  readonly #layoutTemplateService = inject(LayoutTemplateService);
  readonly #uiElementTemplateService = inject(UIElementTemplateService);
  readonly #uiElementTemplatesStore = inject(UIElementTemplatesStore);

  readonly loadingSig = this.#uiElementTemplatesStore.isPending;

  readonly PREVIEW_LAYOUT_ID = defaultPreviewLayoutConfig.id;
  readonly previewLayout = toSignal(
    this.#layoutTemplateService.getLayoutTemplate(defaultPreviewLayoutConfig.id)
  );

  readonly codeChangeSubject = new Subject<string>();
  readonly editorOptions: IStandaloneEditorConstructionOptions = {
    theme: 'vs-dark',
    language: 'json',
    wordWrap: 'on',
  };
  code: string = '';
  #uneditableTemplateMetaData: AppUIElementTemplateUnEditableFields | null = null;
  readonly errorStateSig = signal<'noError' | 'isError' | 'isPending'>('noError');

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

    this.#watchCodeChange();
  }

  async updateUIElementTemplate(): Promise<void> {
    const templateFromCode = JSON.parse(this.code) as AppUIElementTemplateEditableFields;

    if (!this.#uneditableTemplateMetaData) {
      console.error('Meta data is missing');
      return;
    }

    await this.#uiElementTemplatesStore.updateOne({
      ...this.#uneditableTemplateMetaData,
      ...templateFromCode,
    });
    if (!untracked(this.#uiElementTemplatesStore.error)) {
      this.#uiElementTemplateService.updateUIElementTemplate({
        id: this.#uneditableTemplateMetaData.id,
        ...templateFromCode,
      });
      this.closeModal();
    }
  }

  #watchCodeChange(): void {
    effect(async () => {
      const currentTemplate = this.#uiElementTemplatesStore.filteredUIElementTemplates()[0];
      if (!currentTemplate) {
        return;
      }
      const { createdAt, updatedAt, id, ...templateWithoutTimeStamps } = currentTemplate;
      this.#uneditableTemplateMetaData = {
        id,
        createdAt,
        updatedAt,
      };
      const rawJSON = JSON.stringify(templateWithoutTimeStamps);
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

  #isValidCode(code: string): boolean {
    try {
      JSON.parse(code);
      return true;
    } catch (err) {
      console.log('Something went wrong:', err);
      return false;
    }
  }
}
