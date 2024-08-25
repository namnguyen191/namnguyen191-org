import { Pipe, PipeTransform } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';

@Pipe({ name: 'pluck', standalone: true })
export class PluckPipe implements PipeTransform {
  transform<TObj extends ObjectType, TKey extends keyof TObj>(
    input: TObj[],
    key: TKey
  ): TObj[TKey][] {
    return input.map((value) => value[key]);
  }
}
