import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  InjectionToken,
  input,
  InputSignal,
  OnDestroy,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  DisplayGrid,
  GridsterComponent,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent,
  GridType,
} from 'angular-gridster2';
import { Subject } from 'rxjs';

import { UIElementInstance } from '../../interfaces';
import { LayoutTemplate } from '../../interfaces/Layout';
import { EventsService, LayoutTemplateService } from '../../services';
import { UiElementWrapperComponent } from './ui-element-wrapper/ui-element-wrapper.component';

export type LayoutGridItem = GridsterItem & {
  id: string;
  trackById: string;
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

export const LAYOUTS_CHAIN_TOKEN = new InjectionToken<Set<string>>('LAYOUTS_CHAIN_TOKEN');

@Component({
  selector: 'namnguyen191-layout',
  standalone: true,
  imports: [CommonModule, UiElementWrapperComponent, GridsterComponent, GridsterItemComponent],
  providers: [
    {
      provide: LAYOUTS_CHAIN_TOKEN,
      useFactory: (): Set<string> => {
        const existingToken = inject(LAYOUTS_CHAIN_TOKEN, { optional: true, skipSelf: true });

        return existingToken ? structuredClone(existingToken) : new Set();
      },
    },
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnDestroy {
  #layoutService: LayoutTemplateService = inject(LayoutTemplateService);
  #layoutsChain: Set<string> = inject(LAYOUTS_CHAIN_TOKEN);
  #eventsService: EventsService = inject(EventsService);

  #cancelLayoutSubscriptionSubject = new Subject<void>();
  #destroyRef = new Subject<void>();

  layoutId: InputSignal<string> = input.required<string>();
  layoutConfig = computed(() => {
    const layoutId = this.layoutId();
    return this.#layoutService.getLayoutTemplate(layoutId);
  });

  gridItems: WritableSignal<LayoutGridItem[] | null> = signal<LayoutGridItem[] | null>(null);

  isInfinite: WritableSignal<boolean> = signal<boolean>(false);

  layoutGridConfigs: GridsterConfig = {
    ...GRID_CONFIG,
    itemChangeCallback: this.#handleGridItemChanged.bind(this),
  };

  #eventService: EventsService = inject(EventsService);

  constructor() {
    effect(
      () => {
        const layoutConfigVal = this.layoutConfig()();

        if (layoutConfigVal.status === 'missing') {
          this.#eventsService.emitEvent({
            type: 'MISSING_LAYOUT',
            payload: {
              id: layoutConfigVal.id,
            },
          });
          return;
        }

        if (layoutConfigVal.status !== 'loaded') {
          return;
        }

        const gridItems = this.#createGridItems(layoutConfigVal.config);
        this.gridItems.set(gridItems);

        const isInfinite = this.#layoutsChain.has(layoutConfigVal.config.id);

        if (isInfinite) {
          console.error(
            `Layout with id ${layoutConfigVal.config.id} has already existed in parents`
          );
        }

        this.#layoutsChain.add(layoutConfigVal.config.id);
        this.isInfinite.set(isInfinite);
      },
      {
        allowSignalWrites: true,
      }
    );
  }

  ngOnDestroy(): void {
    this.#cancelLayoutSubscriptionSubject.next();
    this.#cancelLayoutSubscriptionSubject.complete();
    this.#destroyRef.next();
    this.#destroyRef.complete();
  }

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
          id,
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
