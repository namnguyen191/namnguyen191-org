import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LazyLoadedService {
  constructor() {
    console.log('Lazy loaded service init');
  }

  sayHello(): void {
    console.log('Hello');
  }
}
