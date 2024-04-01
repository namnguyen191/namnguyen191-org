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
import { MatIconModule } from '@angular/material/icon';
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

export const GRID_COLS = 16; // 16 columns layout
export const GRID_ROW_HEIGHT = 16; // 16px per row
export const DEFAULT_UI_ELEMENT_COLSPAN = 4;
export const DEFAULT_UI_ELEMENT_ROWSPAN = 20;
export const DEFAULT_UI_ELEMENT_X = 0;
export const DEFAULT_UI_ELEMENT_Y = 0;
export const DEFAULT_UI_ELEMENT_RESIZABLE = true;
export const DEFAULT_UI_ELEMENT_DRAGGABLE = true;
export const DEFAULT_POSITION_AND_SIZE: Pick<
  GridsterItem,
  'x' | 'y' | 'rows' | 'cols' | 'resizeEnabled' | 'dragEnabled'
> = {
  x: DEFAULT_UI_ELEMENT_X,
  y: DEFAULT_UI_ELEMENT_Y,
  rows: DEFAULT_UI_ELEMENT_ROWSPAN,
  cols: DEFAULT_UI_ELEMENT_COLSPAN,
  resizeEnabled: DEFAULT_UI_ELEMENT_RESIZABLE,
  dragEnabled: DEFAULT_UI_ELEMENT_DRAGGABLE,
};

export const UI_ELEMENT_MAX_ROWS = 400;

export const GRID_CONFIG: GridsterConfig = {
  setGridSize: true,
  margin: 5,
  displayGrid: DisplayGrid.None,
  gridType: GridType.VerticalFixed,
  fixedRowHeight: GRID_ROW_HEIGHT,
  minCols: GRID_COLS,
  maxCols: GRID_COLS,
  maxItemCols: GRID_COLS,
  maxItemRows: UI_ELEMENT_MAX_ROWS,
  resizable: {
    enabled: true,
    handles: { n: true, s: true, e: true, w: true, se: false, sw: false, nw: false, ne: false },
  },
  draggable: { enabled: true, ignoreContent: true, dragHandleClass: 'drag-area' },
  defaultItemRows: DEFAULT_UI_ELEMENT_ROWSPAN,
  defaultItemCols: DEFAULT_UI_ELEMENT_COLSPAN,
};

const isLayoutGridItem = (item: GridsterItem): item is LayoutGridItem => {
  return typeof item['id'] === 'string' && item['elementInstance'];
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
    MatIconModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  layoutConfigSig: InputSignal<LayoutConfig> = input.required<LayoutConfig>({
    alias: 'layoutConfig',
  });
  gridItems: Signal<LayoutGridItem[]> = computed(() => {
    const layoutConfig = this.layoutConfigSig();
    return this.#createGridItems(layoutConfig);
  });

  layoutGridConfigs: GridsterConfig = {
    ...GRID_CONFIG,
    itemChangeCallback: this.#handleGridItemChanged.bind(this),
  };

  #createGridItems(layoutConfig: LayoutConfig): LayoutGridItem[] {
    return layoutConfig.uiElementInstances.map((eI) => {
      const { positionAndSize } = eI;
      return {
        id: eI.id,
        elementInstance: eI,
        ...DEFAULT_POSITION_AND_SIZE,
        ...positionAndSize,
      };
    });
  }

  #handleGridItemChanged(item: GridsterItem): void {
    if (isLayoutGridItem(item)) {
      const { id, x, y, rows, cols } = item;
      console.log('Nam data is: id', id);
      console.log('Nam data is: x', x);
      console.log('Nam data is: y', y);
      console.log('Nam data is: rows', rows);
      console.log('Nam data is: cols', cols);
    }
  }
}
