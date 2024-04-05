import { Pipe, PipeTransform } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';

@Pipe({ name: 'pluck' })
export class PluckPipe implements PipeTransform {
  transform(input: ObjectType[], key: string): unknown {
    return input.map((value) => value[key]);
  }
}
