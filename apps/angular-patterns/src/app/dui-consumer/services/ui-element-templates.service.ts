import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UIElementTemplate } from '@namnguyen191/dui';
import { Observable, shareReplay } from 'rxjs';

const BASE_UI_ELEMENT_TEMPLATE_URL = 'http://localhost:8080/ui-element-templates';

@Injectable({
  providedIn: 'root',
})
export class UIElementTemplateService {
  #httpClient: HttpClient = inject(HttpClient);

  #uiElementTemplatesCache: Record<string, Observable<UIElementTemplate>> = {};

  getUIElementTemplateById(id: string): Observable<UIElementTemplate> {
    let uiElementTemplate$ = this.#uiElementTemplatesCache[id];
    if (!uiElementTemplate$) {
      uiElementTemplate$ = this.#fetchUIElementTemplateById(id).pipe(shareReplay(1));
      this.#uiElementTemplatesCache[id] = uiElementTemplate$;
    }

    return uiElementTemplate$;
  }

  #fetchUIElementTemplateById(id: string): Observable<UIElementTemplate> {
    return this.#httpClient.get<UIElementTemplate>(`${BASE_UI_ELEMENT_TEMPLATE_URL}/${id}`);
  }
}
