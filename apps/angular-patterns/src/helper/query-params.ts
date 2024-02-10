import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Observable } from 'rxjs';

export const getSuperSecretQueryParam = (): Observable<string> =>
  inject(ActivatedRoute).queryParams.pipe(
    filter((params): params is { secretParam: string } => params['secretParam']),
    map((params) => params.secretParam)
  );
