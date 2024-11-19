import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ButtonModule,
  Table,
  TableHeaderItem,
  TableItem,
  TableModel,
  TableModule,
} from 'carbon-components-angular';

import {
  TemplateMetaData,
  UIElementTemplatesStore,
} from '../../state-store/uiElementTemplate.store';

@Component({
  selector: 'namnguyen191-ui-elements-list-page',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, RouterModule],
  templateUrl: './ui-elements-list-page.component.html',
  styleUrl: './ui-elements-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiElementsListPageComponent {
  readonly #uiElementTemplatesStore = inject(UIElementTemplatesStore);
  readonly #cdr = inject(ChangeDetectorRef);
  readonly #router = inject(Router);
  readonly #activatedRoute = inject(ActivatedRoute);

  loadingSig = this.#uiElementTemplatesStore.isPending;
  allTemplatesMetaDataSig = this.#uiElementTemplatesStore.allUIElementTemplateMetaData;
  tableModel = new TableModel();
  tableSkeletonModel = Table.skeletonModel(20, 3);

  constructor() {
    this.tableModel.header = this.#constructTableHeader();

    effect(() => {
      const allTemplatesMetaData = this.allTemplatesMetaDataSig();
      this.tableModel.data = this.#constructTableRows(allTemplatesMetaData);
      this.#cdr.detectChanges();
    });
  }

  onRowClick(e: number): void {
    const currentId = this.tableModel.data[e]?.[0]?.data as string;
    this.#router.navigate(['edit', currentId], {
      relativeTo: this.#activatedRoute,
    });
  }

  #constructTableHeader(): TableHeaderItem[] {
    return [
      new TableHeaderItem({
        data: 'ID',
      }),
      new TableHeaderItem({
        data: 'Created at',
      }),
      new TableHeaderItem({
        data: 'Updated at',
      }),
    ];
  }

  #constructTableRows(templatesMetaData: TemplateMetaData[]): TableItem[][] {
    const dateFormatter = new Intl.DateTimeFormat('en-US');
    return templatesMetaData.map(({ id, createdAt, updatedAt }) => {
      const createdAtDate = new Date(createdAt);
      const formattedCreatedAtDate = dateFormatter.format(createdAtDate);
      const updatedAtDate = updatedAt ? new Date(updatedAt) : null;
      const formattedUpdatedAtDate = updatedAtDate
        ? dateFormatter.format(updatedAtDate)
        : 'Newly created';
      return [
        new TableItem({
          data: id,
        }),
        new TableItem({
          data: formattedCreatedAtDate,
        }),
        new TableItem({
          data: formattedUpdatedAtDate,
        }),
      ];
    });
  }
}
