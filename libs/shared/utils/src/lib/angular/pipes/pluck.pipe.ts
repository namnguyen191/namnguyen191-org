import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'pluck' })
export class PluckPipe implements PipeTransform {
  transform(input: Record<string, unknown>[], key: string): unknown {
    return input.map((value) => value[key]);
  }
}
