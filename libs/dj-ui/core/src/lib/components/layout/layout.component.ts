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
  Signal,
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
import { Observable, Subject, takeUntil } from 'rxjs';

import { CORE_CONFIG } from '../../global';
import { EventsService } from '../../services/events-and-actions/events.service';
import { LayoutTemplateService } from '../../services/templates/layout-template.service';
import {
  LayoutTemplate,
  LayoutTemplateWithStatus,
  UIElementInstance,
} from '../../services/templates/layout-template-interfaces';
import { logSubscription } from '../../utils/logging';
import { UiElementWrapperComponent } from './ui-element-wrapper/ui-element-wrapper.component';

type LayoutGridItem = GridsterItem & {
  id: string;
  trackById: string;
  elementInstance: UIElementInstance;
};

const GRID_COLS = 16; // 16 columns layout
const GRID_ROW_HEIGHT = 16; // 16px per row
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
  pushItems: true,
  compactType: 'compactLeft&Up',
};

const isLayoutGridItem = (item: GridsterItem): item is LayoutGridItem => {
  return typeof item['id'] === 'string' && item['elementInstance'];
};

const LAYOUTS_CHAIN_TOKEN = new InjectionToken<Set<string>>('LAYOUTS_CHAIN_TOKEN');

@Component({
  selector: 'dj-ui-layout',
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
export class LayoutComponent {
  readonly #layoutService = inject(LayoutTemplateService);
  readonly #layoutsChain = inject(LAYOUTS_CHAIN_TOKEN);

  #unsubscribeFromLayoutConfig = new Subject<void>();

  layoutId: InputSignal<string> = input.required<string>();
  layoutConfig: Signal<Observable<LayoutTemplateWithStatus>> = computed(() => {
    const layoutId = this.layoutId();
    return this.#layoutService.getLayoutTemplate(layoutId);
  });
  #prevLayoutId: string | null = null;

  gridItems: WritableSignal<LayoutGridItem[] | null> = signal<LayoutGridItem[] | null>(null);

  isInfinite: WritableSignal<boolean> = signal<boolean>(false);

  layoutGridConfigs: GridsterConfig = {
    ...GRID_CONFIG,
    itemChangeCallback: this.#handleGridItemChanged.bind(this),
  };

  #eventService: EventsService = inject(EventsService);

  layoutLoadingComponent = inject(CORE_CONFIG, { optional: true })?.layoutLoadingComponent;

  constructor() {
    this.#onLayoutConfigStreamChangedEffect();
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

  #onLayoutConfigStreamChangedEffect(): void {
    effect(
      (onCleanup) => {
        onCleanup(() => {
          this.#unsubscribeFromLayoutConfig.next();
          this.#unsubscribeFromLayoutConfig.complete();
        });
        const layoutConfigStream = this.layoutConfig();
        this.#unsubscribeFromLayoutConfig.next();
        layoutConfigStream
          .pipe(takeUntil(this.#unsubscribeFromLayoutConfig))
          .subscribe((layoutConfigVal) => {
            logSubscription(`Layout config stream for ${layoutConfigVal.id}`);
            if (!layoutConfigVal || layoutConfigVal.status !== 'loaded') {
              return;
            }

            const gridItems = this.#createGridItems(layoutConfigVal.config);
            this.gridItems.set(gridItems);

            const currentLayoutId = layoutConfigVal.config.id;
            if (this.#prevLayoutId) {
              this.#layoutsChain.delete(this.#prevLayoutId);
              this.#prevLayoutId = currentLayoutId;
            }

            const isInfinite = this.#layoutsChain.has(currentLayoutId);

            if (isInfinite) {
              console.error(`Layout with id ${currentLayoutId} has already existed in parents`);
            }

            this.#layoutsChain.add(currentLayoutId);
            this.isInfinite.set(isInfinite);
          });
      },
      {
        allowSignalWrites: true,
      }
    );
  }
}
