import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EnvironmentInjector,
  inject,
  input,
  InputSignal,
  runInInjectionContext,
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import {
  BaseUIElementComponent,
  ContextBasedElement,
  triggerMultipleUIActions,
  UICommAction,
  UIElementImplementation,
  ZodStringOrNumberOrBoolean,
  ZodUICommAction,
} from '@namnguyen191/dui';
import { InterpolationService } from '@namnguyen191/dui';
import { ObjectType } from '@namnguyen191/types-helper';
import { isEmpty } from 'lodash-es';
import { z } from 'zod';

import { PluckPipe } from './pluck.pipe';

const ZodTableRowObject = z.record(z.string(), ZodStringOrNumberOrBoolean);
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
  onPageChange: z.array(ZodUICommAction).optional(),
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
  implements UIElementImplementation<SimpleTableUIElementComponentConfigs>, ContextBasedElement
{
  static readonly ELEMENT_TYPE = 'SIMPLE_TABLE';
  static readonly NEED_CONTEXT = true;

  titleConfigOption: InputSignal<string> = input('Default title', {
    alias: 'title',
    transform: (val) => ZodSimpleTableUIElementComponentConfigs.shape.title.parse(val),
  });

  columnsConfigOption: InputSignal<TableColumnObject[]> = input([], {
    alias: 'columns',
    transform: (val) => ZodSimpleTableUIElementComponentConfigs.shape.columns.parse(val),
  });

  rowsConfigOption: InputSignal<TableRowObject[]> = input([], {
    alias: 'rows',
    transform: (val) => ZodSimpleTableUIElementComponentConfigs.shape.rows.parse(val),
  });

  readonly DEFAULT_PAGINATION_PAGE_SIZES = [5, 10, 20];
  paginationConfigOption: InputSignal<TablePaginationConfigs> = input(
    {},
    {
      alias: 'pagination',
    }
  );
  shouldDisplayPagination = computed(() => !isEmpty(this.paginationConfigOption()));

  // Cannot use [ComponentContextPropertyKey] otherwise Angular won't detect it as an input
  $context$: InputSignal<ObjectType> = input<ObjectType>({});

  #interpolationService: InterpolationService = inject(InterpolationService);
  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  async onPageChange(event: PageEvent): Promise<void> {
    const { pageSize, pageIndex: currentPage } = event;
    const onPageChange: UICommAction[] | undefined = this.paginationConfigOption().onPageChange;
    if (!onPageChange || onPageChange.length === 0) {
      return;
    }

    const context = this.$context$();
    try {
      const actions = (await this.#interpolationService.interpolate({
        context: { ...context, $paginationContext: { pageSize, currentPage } },
        value: onPageChange,
      })) as UICommAction[];

      runInInjectionContext(this.#environmentInjector, () => triggerMultipleUIActions(actions));
    } catch (error) {
      console.warn('Failed to interpolate onPageChange config');
    }
  }
}
