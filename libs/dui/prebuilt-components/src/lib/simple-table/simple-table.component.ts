import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EnvironmentInjector,
  inject,
  input,
  InputSignalWithTransform,
  runInInjectionContext,
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import {
  ContextBasedElement,
  inputObsTransform,
  triggerMultipleUIActions,
  UICommAction,
  UIElementImplementation,
  ZodIsError,
  ZodIsLoading,
  ZodObjectType,
  ZodStringOrNumberOrBoolean,
  ZodUICommAction,
} from '@namnguyen191/dui';
import { InterpolationService } from '@namnguyen191/dui';
import { ObjectType } from '@namnguyen191/types-helper';
import { isEmpty } from 'lodash-es';
import { first, from, map, Observable, of, switchMap, withLatestFrom } from 'rxjs';
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
  rows: z.array(ZodTableRowObject),
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
  implements UIElementImplementation<SimpleTableUIElementComponentConfigs>, ContextBasedElement
{
  static readonly ELEMENT_TYPE = 'SIMPLE_TABLE';

  isErrorConfigOption: InputSignalWithTransform<
    Observable<boolean>,
    boolean | Observable<boolean>
  > = input(of(false), {
    alias: 'isError',
    transform: inputObsTransform(ZodIsError),
  });

  isLoadingConfigOption: InputSignalWithTransform<
    Observable<boolean>,
    boolean | Observable<boolean>
  > = input(of(false), {
    alias: 'isLoading',
    transform: inputObsTransform(ZodIsLoading),
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

  readonly DEFAULT_PAGINATION_PAGE_SIZES = [5, 10, 20];
  paginationConfigOption: InputSignalWithTransform<
    Observable<TablePaginationConfigs>,
    TablePaginationConfigs | Observable<TablePaginationConfigs>
  > = input(of({}), {
    alias: 'pagination',
    transform: inputObsTransform(ZodSimpleTableUIElementComponentConfigs.shape.pagination),
  });
  shouldDisplayPagination = computed(() => {
    const paginationConfig = this.paginationConfigOption();
    return paginationConfig.pipe(map((config) => !isEmpty(config)));
  });

  // Cannot use [ComponentContextPropertyKey] otherwise Angular won't detect it as an input
  $context$: InputSignalWithTransform<Observable<ObjectType>, ObjectType | Observable<ObjectType>> =
    input(of({}), {
      transform: inputObsTransform(ZodObjectType),
    });

  #interpolationService: InterpolationService = inject(InterpolationService);
  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  onPageChange(event: PageEvent): void {
    const { pageSize, pageIndex: currentPage } = event;
    this.paginationConfigOption()
      .pipe(
        withLatestFrom(this.$context$()),
        switchMap(([{ onPageChange }, context]) => {
          if (!onPageChange) {
            return of([]);
          }

          return from(
            this.#interpolationService.interpolate({
              context: { ...context, $paginationContext: { pageSize, currentPage } },
              value: onPageChange,
            }) as Promise<UICommAction[]>
          );
        }),
        first()
      )
      .subscribe((dispatchableActions) => {
        runInInjectionContext(this.#environmentInjector, () =>
          triggerMultipleUIActions(dispatchableActions)
        );
      });
  }
}
