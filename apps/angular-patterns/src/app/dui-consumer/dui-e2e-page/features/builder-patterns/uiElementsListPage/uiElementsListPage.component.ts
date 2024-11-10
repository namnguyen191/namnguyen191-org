import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import {
  Table,
  TableHeaderItem,
  TableItem,
  TableModel,
  TableModule,
} from 'carbon-components-angular';

import { TemplateMetaData, UIElementTemplatesStore } from '../state-store/uiElementTemplate.store';

@Component({
  selector: 'namnguyen191-ui-elements-list-page',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './uiElementsListPage.component.html',
  styleUrl: './uiElementsListPage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiElementsListPageComponent {
  #uiElementTemplatesStore = inject(UIElementTemplatesStore);

  loadingSig = this.#uiElementTemplatesStore.isPending;
  allTemplatesMetaDataSig = this.#uiElementTemplatesStore.allUIElementTemplateMetaData;
  tableModel = new TableModel();
  tableSkeletonModel = Table.skeletonModel(20, 3);

  constructor() {
    this.tableModel.header = this.#constructTableHeader();

    effect(() => {
      const allTemplatesMetaData = this.allTemplatesMetaDataSig();
      this.tableModel.data = this.#constructTableRows(allTemplatesMetaData);
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
