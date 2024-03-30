import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import {
  DisplayGrid,
  GridsterComponent,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent,
  GridType,
} from 'angular-gridster2';

import { UIElementInstance } from '../interfaces';
import { LayoutConfig } from '../interfaces/Layout';
import { UiElementWrapperComponent } from './ui-element-wrapper/ui-element-wrapper.component';

export type LayoutGridItem = GridsterItem & {
  id: string;
  elementInstance: UIElementInstance;
};

@Component({
  selector: 'namnguyen191-layout',
  standalone: true,
  imports: [
    CommonModule,
    UiElementWrapperComponent,
    MatGridListModule,
    GridsterComponent,
    GridsterItemComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  readonly DEFAULT_COLSPAN = 4;
  readonly DEFAULT_ROWSPAN = 20;

  layoutConfigSig: InputSignal<LayoutConfig> = input.required<LayoutConfig>({
    alias: 'layoutConfig',
  });
  gridItems: Signal<LayoutGridItem[]> = computed(() => {
    const layoutConfig = this.layoutConfigSig();
    return this.#createGridItems(layoutConfig);
  });

  options: GridsterConfig = {
    setGridSize: true,
    margin: 5,
    displayGrid: DisplayGrid.None,
    gridType: GridType.VerticalFixed,
    fixedRowHeight: 4,
    minCols: 16,
    maxCols: 16,
    resizable: { enabled: true },
    draggable: { enabled: true },
  };

  #createGridItems(layoutConfig: LayoutConfig): LayoutGridItem[] {
    return layoutConfig.uiElementInstances.map((eI) => ({
      id: eI.id,
      cols: eI.colSpan ?? this.DEFAULT_COLSPAN,
      rows: eI.rowSpan ?? this.DEFAULT_ROWSPAN,
      x: 0,
      y: 0,
      elementInstance: eI,
    }));
  }
}
