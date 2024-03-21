import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Observable, of } from 'rxjs';

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

  isLoadingConfigOption: InputSignal<Observable<boolean>> = input(of(false), {
    alias: 'isLoading',
  });
  titleConfigOption: InputSignal<string> = input('No text', { alias: 'title' });
  columnsConfigOption: InputSignal<TableColumnObject[]> = input<TableColumnObject[]>([], {
    alias: 'columns',
  });

  rowsConfigOption: InputSignal<TableRowObject[]> = input<TableRowObject[]>([], { alias: 'rows' });
}
