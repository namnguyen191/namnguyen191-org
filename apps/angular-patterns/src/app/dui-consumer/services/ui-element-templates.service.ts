import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UIElementTemplate } from '@dj-ui/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { Observable, shareReplay } from 'rxjs';

const BASE_UI_ELEMENT_TEMPLATE_URL = 'http://localhost:8080/ui-element-templates';

export type AppUIElementTemplate<T extends ObjectType = object> = UIElementTemplate<T> & {
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateAppUIElementTemplatePayload = Omit<
  AppUIElementTemplate,
  'createdAt' | 'updatedAt'
>;

export type UpdateAppUIElementTemplatePayload = CreateAppUIElementTemplatePayload;

@Injectable({
  providedIn: 'root',
})
export class UIElementTemplateService {
  readonly #httpClient = inject(HttpClient);

  #uiElementTemplatesCache: Record<string, Observable<AppUIElementTemplate>> = {};

  loadAllUIElementTemplates = (): Observable<AppUIElementTemplate[]> => {
    return this.#httpClient.get<AppUIElementTemplate[]>(`${BASE_UI_ELEMENT_TEMPLATE_URL}`);
  };

  getUIElementTemplateById = (id: string): Observable<AppUIElementTemplate> => {
    let uiElementTemplate$ = this.#uiElementTemplatesCache[id];
    if (!uiElementTemplate$) {
      uiElementTemplate$ = this.#fetchUIElementTemplateById(id).pipe(shareReplay(1));
      this.#uiElementTemplatesCache[id] = uiElementTemplate$;
    }

    return uiElementTemplate$;
  };

  createUIElementTemplate = (
    payload: CreateAppUIElementTemplatePayload
  ): Observable<AppUIElementTemplate> => {
    return this.#httpClient.post<AppUIElementTemplate>(BASE_UI_ELEMENT_TEMPLATE_URL, payload);
  };

  updateUIElementTemplate = (
    payload: UpdateAppUIElementTemplatePayload
  ): Observable<AppUIElementTemplate> => {
    return this.#httpClient.put<AppUIElementTemplate>(BASE_UI_ELEMENT_TEMPLATE_URL, payload);
  };

  #fetchUIElementTemplateById(id: string): Observable<AppUIElementTemplate> {
    return this.#httpClient.get<AppUIElementTemplate>(`${BASE_UI_ELEMENT_TEMPLATE_URL}/${id}`);
  }
}
