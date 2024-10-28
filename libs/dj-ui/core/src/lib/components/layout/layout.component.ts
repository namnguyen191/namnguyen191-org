import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { computedFromObservable } from '@namnguyen191/common-angular-helper';
import { parentContains } from '@namnguyen191/common-js-helper';
import {
  DisplayGrid,
  GridsterComponent,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent,
  GridType,
} from 'angular-gridster2';

import { CORE_CONFIG } from '../../global';
import { EventsService } from '../../services/events-and-actions/events.service';
import { LayoutTemplateService } from '../../services/templates/layout-template.service';
import {
  LayoutTemplate,
  LayoutTemplateWithStatus,
  UIElementInstance,
} from '../../services/templates/layout-template-interfaces';
import { UiElementWrapperComponent } from './ui-element-wrapper/ui-element-wrapper.component';

type LayoutGridItem = GridsterItem & {
  id: string;
  trackById: string;
  elementInstance: UIElementInstance;
};

const GRID_COLS_MAX = 16; // 16 columns layout
const GRID_COLS_MIN = 16; // 16 columns layout
const GRID_ROW_HEIGHT = 16; // 16px per row
const DEFAULT_GRID_GAP = 5;
const DEFAULT_UI_ELEMENT_COLSPAN = 4;
const DEFAULT_UI_ELEMENT_ROWSPAN = 20;
const DEFAULT_UI_ELEMENT_X = 0;
const DEFAULT_UI_ELEMENT_Y = 0;
const DEFAULT_UI_ELEMENT_RESIZABLE = true;
const DEFAULT_UI_ELEMENT_DRAGGABLE = true;
const DEFAULT_POSITION_AND_SIZE: Pick<
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

const UI_ELEMENT_MAX_ROWS = 400;

const GRID_CONFIG: GridsterConfig = {
  setGridSize: true,
  margin: DEFAULT_GRID_GAP,
  displayGrid: DisplayGrid.None,
  gridType: GridType.VerticalFixed,
  fixedRowHeight: GRID_ROW_HEIGHT,
  minCols: GRID_COLS_MIN,
  maxCols: GRID_COLS_MAX,
  maxItemCols: GRID_COLS_MAX,
  maxItemRows: UI_ELEMENT_MAX_ROWS,
  resizable: {
    enabled: true,
    handles: { n: true, s: true, e: true, w: true, se: false, sw: false, nw: false, ne: false },
  },
  draggable: { enabled: true, ignoreContent: true, dragHandleClass: 'drag-area' },
  defaultItemRows: DEFAULT_UI_ELEMENT_ROWSPAN,
  defaultItemCols: DEFAULT_UI_ELEMENT_COLSPAN,
  pushItems: true,
  compactType: 'compactLeft&Up',
  keepFixedHeightInMobile: true,
  // keepFixedWidthInMobile: true,
};

const isLayoutGridItem = (item: GridsterItem): item is LayoutGridItem => {
  return typeof item['id'] === 'string' && item['elementInstance'];
};

@Component({
  selector: 'dj-ui-layout',
  standalone: true,
  imports: [CommonModule, UiElementWrapperComponent, GridsterComponent, GridsterItemComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.layoutId]': 'layoutId()',
  },
})
export class LayoutComponent {
  readonly #layoutService = inject(LayoutTemplateService);
  readonly #elementRef = inject(ElementRef);

  layoutId: InputSignal<string> = input.required<string>();

  layoutConfig: Signal<LayoutTemplateWithStatus | undefined> = computedFromObservable(() => {
    const layoutId = this.layoutId();
    return this.#layoutService.getLayoutTemplate(layoutId);
  });

  gridItems: Signal<LayoutGridItem[] | null> = computed(() => {
    const layoutConfig = this.layoutConfig();
    if (!layoutConfig || !layoutConfig.config) {
      return null;
    }

    return this.#createGridItems(layoutConfig.config);
  });

  isInfinite: Signal<boolean> = computed(() => {
    const layoutId = this.layoutId();
    const curEle = this.#elementRef.nativeElement as HTMLElement;

    const isInfinite = parentContains({
      ele: curEle,
      attrName: 'layoutId',
      attrValue: layoutId,
    });

    if (isInfinite) {
      console.error(`Layout with id ${layoutId} has already existed in parents`);
    }

    return isInfinite;
  });

  layoutGridConfigs: Signal<GridsterConfig | null> = computed(() => {
    const layoutConfig = this.layoutConfig();
    if (layoutConfig?.status !== 'loaded') {
      return null;
    }

    const gridConfigs = layoutConfig.config.gridConfigs;
    return {
      ...GRID_CONFIG,
      itemChangeCallback: this.#handleGridItemChanged.bind(this),
      margin: gridConfigs?.gap ?? DEFAULT_GRID_GAP,
    };
  });

  #eventService: EventsService = inject(EventsService);

  layoutLoadingComponent = inject(CORE_CONFIG, { optional: true })?.layoutLoadingComponent;

  #createGridItems(layoutConfig: LayoutTemplate): LayoutGridItem[] {
    return layoutConfig.uiElementInstances.map((eI) => {
      const { positionAndSize } = eI;
      return {
        id: eI.id,
        elementInstance: eI,
        trackById: `LAYOUT: ${layoutConfig.id} - ELEMENT: ${eI.id}`,
        ...DEFAULT_POSITION_AND_SIZE,
        ...positionAndSize,
      };
    });
  }

  #handleGridItemChanged(item: GridsterItem): void {
    if (isLayoutGridItem(item)) {
      const { id, x, y, rows, cols } = item;
      this.#eventService.emitEvent({
        type: 'UI_ELEMENT_REPOSITION',
        payload: {
          layoutId: this.layoutId(),
          elementId: id,
          newPositionAndSize: {
            x,
            y,
            rows,
            cols,
          },
        },
      });
    }
  }
}
