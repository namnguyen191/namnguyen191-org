import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type SuggestedActivity = {
  activity: string;
  type: string;
  participants: number;
  price: number;
  link: string;
  key: string;
  accessibility: number;
};

@Injectable({
  providedIn: 'root',
})
export class BoreService {
  #httpClient: HttpClient = inject(HttpClient);

  getSuggestedActivity(): Observable<SuggestedActivity> {
    return this.#httpClient.get<SuggestedActivity>('https://www.boredapi.com/api/activity');
  }
}
