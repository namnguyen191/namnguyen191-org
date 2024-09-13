import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  output,
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { BaseUIElementComponent, UIElementImplementation } from '@namnguyen191/dui-core';
import { parseZodWithDefault, ZodNonEmptyPrimitive } from '@namnguyen191/types-helper';
import { isEmpty } from 'lodash-es';
import { z } from 'zod';

import { PluckPipe } from './pluck.pipe';

const ZodTableRowObject = z.record(z.string(), ZodNonEmptyPrimitive);
export type TableRowObject = z.infer<typeof ZodTableRowObject>;

const ZodTableColumnObject = z.object({
  dataKey: z.string({
    invalid_type_error: 'dataKey must be a string',
  }),
  displayedValue: z.string(),
});
export type TableColumnObject = z.infer<typeof ZodTableColumnObject>;

const ZodTablePaginationConfigs = z.object({
  pageSizes: z.array(z.number()).optional(),
  onPageChange: z.array(z.any()).optional(),
});
export type TablePaginationConfigs = z.infer<typeof ZodTablePaginationConfigs>;

const ZodSimpleTableUIElementComponentConfigs = z.object({
  title: z.string(),
  columns: z.array(ZodTableColumnObject),
  rows: z.array(ZodTableRowObject, {
    errorMap: () => ({ message: 'Invalid config for table rows' }),
  }),
  pagination: ZodTablePaginationConfigs,
});

export type SimpleTableUIElementComponentConfigs = z.infer<
  typeof ZodSimpleTableUIElementComponentConfigs
>;

export type PaginationChangedPayload = {
  $pageEvent: PageEvent;
};

export type SimpleTableUIElementComponentEvents = {
  paginationChanged: PaginationChangedPayload;
};

@Component({
  selector: 'namnguyen191-simple-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, PluckPipe, MatProgressSpinnerModule, MatPaginatorModule],
  templateUrl: './simple-table.component.html',
  styleUrl: './simple-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleTableComponent
  extends BaseUIElementComponent
  implements
    UIElementImplementation<
      SimpleTableUIElementComponentConfigs,
      SimpleTableUIElementComponentEvents
    >
{
  static override readonly ELEMENT_TYPE = 'SIMPLE_TABLE';

  defaultTitle = 'Default title';
  titleConfigOption: InputSignal<string> = input(this.defaultTitle, {
    alias: 'title',
    transform: (val) =>
      parseZodWithDefault(
        ZodSimpleTableUIElementComponentConfigs.shape.title,
        val,
        this.defaultTitle
      ),
  });

  columnsConfigOption: InputSignal<TableColumnObject[]> = input([], {
    alias: 'columns',
    transform: (val) =>
      parseZodWithDefault<TableColumnObject[]>(
        ZodSimpleTableUIElementComponentConfigs.shape.columns,
        val,
        []
      ),
  });

  rowsConfigOption: InputSignal<TableRowObject[]> = input([], {
    alias: 'rows',
    transform: (val) =>
      parseZodWithDefault<TableRowObject[]>(
        ZodSimpleTableUIElementComponentConfigs.shape.rows,
        val,
        []
      ),
  });

  readonly DEFAULT_PAGINATION_PAGE_SIZES = [5, 10, 20];
  // do not parse zod for the pagination input because we expect the un-interpolated value here
  paginationConfigOption: InputSignal<TablePaginationConfigs> = input(
    {},
    {
      alias: 'pagination',
    }
  );
  shouldDisplayPagination = computed(() => !isEmpty(this.paginationConfigOption()));

  paginationChanged = output<PaginationChangedPayload>();

  async onPageChange(event: PageEvent): Promise<void> {
    this.paginationChanged.emit({
      $pageEvent: event,
    });
  }
}
