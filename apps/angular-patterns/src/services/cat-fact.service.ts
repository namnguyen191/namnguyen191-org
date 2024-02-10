import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type CatFact = {
  fact: string;
  length: number;
};

@Injectable({
  providedIn: 'root',
})
export class CatFactService {
  #httpClient: HttpClient = inject(HttpClient);

  getCatFacts(): Observable<CatFact> {
    return this.#httpClient.get<CatFact>('https://catfact.ninja/fact');
  }
}
