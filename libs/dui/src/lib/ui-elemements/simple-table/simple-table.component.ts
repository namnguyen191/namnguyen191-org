import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignalWithTransform } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Observable, of } from 'rxjs';
import { z } from 'zod';

import { UIElementImplementation } from '../../interfaces/UIElement';
import { inputObsTransform } from '../../utils/helper';
import { zodStringOrNumberOrBoolean } from '../../utils/zod-types';
import { PluckPipe } from './pluck.pipe';

const ZodTableRowObject = z.record(z.string(), zodStringOrNumberOrBoolean);
export type TableRowObject = z.infer<typeof ZodTableRowObject>;

const ZodTableColumnObject = z.object({
  dataKey: z.string({
    invalid_type_error: 'dataKey must be a string',
  }),
  displayedValue: z.string(),
});
export type TableColumnObject = z.infer<typeof ZodTableColumnObject>;

const ZodSimpleTableUIElementComponentConfigs = z.object({
  title: z.string(),
  columns: z.array(ZodTableColumnObject),
  rows: z.array(ZodTableRowObject),
});

export type SimpleTableUIElementComponentConfigs = z.infer<
  typeof ZodSimpleTableUIElementComponentConfigs
>;

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
    transform: inputObsTransform(z.boolean()),
  });
  titleConfigOption: InputSignalWithTransform<Observable<string>, string | Observable<string>> =
    input(of('Default title'), {
      alias: 'title',
      transform: inputObsTransform(ZodSimpleTableUIElementComponentConfigs.shape.title),
    });
  columnsConfigOption: InputSignalWithTransform<
    Observable<TableColumnObject[]>,
    TableColumnObject[] | Observable<TableColumnObject[]>
  > = input(of([]), {
    alias: 'columns',
    transform: inputObsTransform(ZodSimpleTableUIElementComponentConfigs.shape.columns),
  });
  rowsConfigOption: InputSignalWithTransform<
    Observable<TableRowObject[]>,
    TableRowObject[] | Observable<TableRowObject[]>
  > = input(of([]), {
    alias: 'rows',
    transform: inputObsTransform(ZodSimpleTableUIElementComponentConfigs.shape.rows),
  });
}
