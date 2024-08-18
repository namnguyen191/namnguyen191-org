import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom, tap } from 'rxjs';

export const TOKEN_LOCAL_STORAGE_KEY = 'userToken';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #httpClient = inject(HttpClient);

  AUTH_ENDPOINT = 'http://localhost:3333/login';

  login(params: { email: string; password: string }): Promise<{ token: string }> {
    const { email, password } = params;
    return lastValueFrom(
      this.#httpClient
        .post<{ token: string }>(this.AUTH_ENDPOINT, {
          email,
          password,
        })
        .pipe(
          tap({
            next: ({ token }) => localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, token),
          })
        )
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY) ?? null;
  }
}
