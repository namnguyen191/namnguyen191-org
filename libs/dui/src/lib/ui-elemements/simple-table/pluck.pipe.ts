import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'pluck', standalone: true })
export class PluckPipe implements PipeTransform {
  transform<TObj extends Record<string, unknown>, TKey extends keyof TObj>(
    input: TObj[],
    key: TKey
  ): TObj[TKey][] {
    return input.map((value) => value[key]);
  }
}
