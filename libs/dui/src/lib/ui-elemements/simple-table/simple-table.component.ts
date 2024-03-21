import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignalWithTransform } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { isObservable, Observable, of } from 'rxjs';

import { UIElementImplementation } from '../../interfaces/UIElement';
import { PluckPipe } from './pluck.pipe';

export type TableRowObject = Record<string, string | number | boolean>;
export type TableColumnObject = {
  dataKey: string;
  displayedValue: string;
};

export type SimpleTableUIElementComponentConfigs = {
  title: string;
  columns: TableColumnObject[];
  rows: TableRowObject[];
};

@Component({
  selector: 'namnguyen191-simple-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, PluckPipe, MatProgressSpinnerModule],
  templateUrl: './simple-table.component.html',
  styleUrl: './simple-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleTableComponent
  implements UIElementImplementation<SimpleTableUIElementComponentConfigs>
{
  static readonly ELEMENT_TYPE = 'SIMPLE_TABLE';

  isLoadingConfigOption: InputSignalWithTransform<
    Observable<boolean>,
    boolean | Observable<boolean>
  > = input(of(false), {
    alias: 'isLoading',
    transform: (val: boolean | Observable<boolean>) => {
      if (!isObservable(val)) {
        return of(val);
      }
      return val;
    },
  });
  titleConfigOption: InputSignalWithTransform<Observable<string>, string | Observable<string>> =
    input(of('Default title'), {
      alias: 'title',
      transform: (val: string | Observable<string>) => {
        if (!isObservable(val)) {
          return of(val);
        }
        return val;
      },
    });
  columnsConfigOption: InputSignalWithTransform<
    Observable<TableColumnObject[]>,
    TableColumnObject[] | Observable<TableColumnObject[]>
  > = input(of([]), {
    alias: 'columns',
    transform: (val: TableColumnObject[] | Observable<TableColumnObject[]>) => {
      if (!isObservable(val)) {
        return of(val);
      }
      return val;
    },
  });
  rowsConfigOption: InputSignalWithTransform<
    Observable<TableRowObject[]>,
    TableRowObject[] | Observable<TableRowObject[]>
  > = input(of([]), {
    alias: 'rows',
    transform: (val: TableRowObject[] | Observable<TableRowObject[]>) => {
      if (!isObservable(val)) {
        return of(val);
      }
      return val;
    },
  });
}
