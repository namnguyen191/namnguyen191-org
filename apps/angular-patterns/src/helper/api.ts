import { inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { BoreService } from '../services/bore.service';
import { CatFactService } from '../services/cat-fact.service';

export const getSomethingFun = (): Observable<string> => {
  const catFactService = inject(CatFactService);
  const boreService = inject(BoreService);

  return forkJoin({
    catFact: catFactService.getCatFacts(),
    suggestedActivity: boreService.getSuggestedActivity(),
  }).pipe(
    map(({ catFact, suggestedActivity }) => {
      const catFactText = `Here's a fun cat fact for you: ${catFact.fact}`;
      const suggestedActivityText = `Now, knowing what you know, I want you to try ${suggestedActivity.activity}. It's quite affordable too and should only cost around ${suggestedActivity.price}$`;

      return `Feeling bore? Can't afford therapy? Don't worry!\n${catFactText}\n${suggestedActivityText}`;
    })
  );
};
