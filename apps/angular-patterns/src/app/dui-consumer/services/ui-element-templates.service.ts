import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UIElementTemplate } from '@dj-ui/core';
import { delay, Observable, shareReplay } from 'rxjs';

const BASE_UI_ELEMENT_TEMPLATE_URL = 'http://localhost:8080/ui-element-templates';

export type AppUIElementTemplate = UIElementTemplate & {
  createdAt: string;
  updatedAt?: string;
};

@Injectable({
  providedIn: 'root',
})
export class UIElementTemplateService {
  readonly #httpClient = inject(HttpClient);

  #uiElementTemplatesCache: Record<string, Observable<AppUIElementTemplate>> = {};

  loadAllUIElementTemplates = (): Observable<AppUIElementTemplate[]> => {
    return this.#httpClient
      .get<AppUIElementTemplate[]>(`${BASE_UI_ELEMENT_TEMPLATE_URL}`)
      .pipe(delay(2000));
  };

  getUIElementTemplateById = (id: string): Observable<AppUIElementTemplate> => {
    let uiElementTemplate$ = this.#uiElementTemplatesCache[id];
    if (!uiElementTemplate$) {
      uiElementTemplate$ = this.#fetchUIElementTemplateById(id).pipe(shareReplay(1));
      this.#uiElementTemplatesCache[id] = uiElementTemplate$;
    }

    return uiElementTemplate$;
  };

  #fetchUIElementTemplateById(id: string): Observable<AppUIElementTemplate> {
    return this.#httpClient.get<AppUIElementTemplate>(`${BASE_UI_ELEMENT_TEMPLATE_URL}/${id}`);
  }
}
