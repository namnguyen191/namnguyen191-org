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
  Signal,
} from '@angular/core';
import {
  BaseUIElementComponent,
  ContextBasedElement,
  InterpolationService,
  JSRunnerContext,
  parseZodWithDefault,
  triggerMultipleUIActions,
  UICommAction,
  UIElementImplementation,
  ZodStringOrNumberOrBoolean,
  ZodUICommAction,
} from '@namnguyen191/dui';
import { ObjectType } from '@namnguyen191/types-helper';
import {
  PaginationModule,
  TableHeaderItem,
  TableItem,
  TableModel,
  TableModule,
} from 'carbon-components-angular';
import { isEmpty } from 'lodash-es';
import { z } from 'zod';

const ZodTableRowObject = z.array(ZodStringOrNumberOrBoolean);
export type TableRowObject = z.infer<typeof ZodTableRowObject>;

const ZodTableRowsConfig = z.array(ZodTableRowObject);
export type TableRowsConfig = z.infer<typeof ZodTableRowsConfig>;

const ZodTableHeadersConfig = z.array(ZodStringOrNumberOrBoolean);
export type TableHeadersConfig = z.infer<typeof ZodTableHeadersConfig>;

const ZodTableDescriptionConfig = z.string({
  errorMap: () => ({ message: 'Table description must be a string' }),
});
export type TableDescriptionConfig = z.infer<typeof ZodTableDescriptionConfig>;

const ZodTablePaginationConfigs = z.object({
  pageSizes: z.array(z.number()).optional(),
  onPageChange: z.array(ZodUICommAction).optional(),
  pageInputDisabled: z.boolean().optional(),
});
export type TablePaginationConfigs = z.infer<typeof ZodTablePaginationConfigs>;

const ZodCarbonTableUIElementComponentConfigs = z.object({
  title: z.string(),
  headers: ZodTableHeadersConfig,
  rows: ZodTableRowsConfig,
  description: ZodTableDescriptionConfig,
});

export type CarbonTableUIElementComponentConfigs = z.infer<
  typeof ZodCarbonTableUIElementComponentConfigs
>;

@Component({
  selector: 'namnguyen191-carbon-table',
  standalone: true,
  imports: [CommonModule, TableModule, PaginationModule],
  templateUrl: './carbon-table.component.html',
  styleUrl: './carbon-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarbonTableComponent
  extends BaseUIElementComponent
  implements UIElementImplementation<CarbonTableUIElementComponentConfigs>, ContextBasedElement
{
  static readonly NEED_CONTEXT = true;
  static readonly ELEMENT_TYPE = 'CARBON_TABLE';

  defaultTitle = 'Default title';
  titleConfigOption: InputSignal<string> = input(this.defaultTitle, {
    alias: 'title',
    transform: (val) =>
      parseZodWithDefault(
        ZodCarbonTableUIElementComponentConfigs.shape.title,
        val,
        this.defaultTitle
      ),
  });

  headersConfigOption: InputSignal<TableHeadersConfig> = input([], {
    alias: 'headers',
    transform: (val) =>
      parseZodWithDefault<TableHeadersConfig>(
        ZodCarbonTableUIElementComponentConfigs.shape.headers,
        val,
        []
      ),
  });

  descriptionConfigOption: InputSignal<TableDescriptionConfig> = input('', {
    alias: 'description',
    transform: (val) =>
      parseZodWithDefault<TableDescriptionConfig>(
        ZodCarbonTableUIElementComponentConfigs.shape.description,
        val,
        ''
      ),
  });

  rowsConfigOption: InputSignal<TableRowsConfig> = input([], {
    alias: 'rows',
    transform: (val) =>
      parseZodWithDefault<TableRowsConfig>(
        ZodCarbonTableUIElementComponentConfigs.shape.rows,
        val,
        []
      ),
  });

  tableModel: Signal<TableModel> = computed(() => {
    const headerConfig = this.headersConfigOption();
    const rowsConfig = this.rowsConfigOption();

    const model = new TableModel();
    model.header = headerConfig.map((headerName) => new TableHeaderItem({ data: headerName }));
    model.data = rowsConfig.map((row) => row.map((item) => new TableItem({ data: item })));

    return model;
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

  // Cannot use [ComponentContextPropertyKey] otherwise Angular won't detect it as an input
  $context$: InputSignal<ObjectType> = input<JSRunnerContext>({});

  #interpolationService: InterpolationService = inject(InterpolationService);
  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  async selectPage(selectedPage: number): Promise<void> {
    const pageLength = this.tableModel().pageLength;
    const onPageChange: UICommAction[] | undefined = this.paginationConfigOption().onPageChange;
    if (!onPageChange || onPageChange.length === 0) {
      return;
    }

    const context = this.$context$();
    try {
      const actions = (await this.#interpolationService.interpolate({
        context: { ...context, $paginationContext: { pageLength, selectedPage } },
        value: onPageChange,
      })) as UICommAction[];

      runInInjectionContext(this.#environmentInjector, () => triggerMultipleUIActions(actions));
    } catch (error) {
      console.warn('Failed to interpolate onPageChange config');
    }
  }
}
