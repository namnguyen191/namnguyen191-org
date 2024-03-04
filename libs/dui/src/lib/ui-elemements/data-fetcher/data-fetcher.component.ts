import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  InputSignal,
} from '@angular/core';

import { UIElementImplementation } from '../../interfaces/UIElement';
import { DataFetchingService } from '../../services/data-fetching.service';
import { BaseUIElementComponent } from '../base';

export type HttpRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type DataFetcherUIElementComponentConfigs = {
  endpoint: string;
  requestMethod: HttpRequestMethod;
  body?: string;
  headers?: Record<string, string>;
};

@Component({
  selector: 'namnguyen191-data-fetcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-fetcher.component.html',
  styleUrl: './data-fetcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataFetcherUIElementComponent
  extends BaseUIElementComponent
  implements UIElementImplementation<DataFetcherUIElementComponentConfigs>
{
  static override readonly ELEMENT_TYPE = 'DATA_FETCHER';

  endpointConfigOption: InputSignal<string> = input.required();
  requestMethodConfigOption: InputSignal<HttpRequestMethod> = input.required();
  bodyConfigOption: InputSignal<string | undefined> = input();
  headersConfigOption: InputSignal<Record<string, string> | undefined> = input();

  dataFetchingService: DataFetchingService = inject(DataFetchingService);

  constructor() {
    super();
    effect(() => {
      this.dataFetchingService
        .fetchData({
          endpoint: this.endpointConfigOption(),
          method: this.requestMethodConfigOption(),
          headers: this.headersConfigOption(),
          body: this.bodyConfigOption(),
        })
        .subscribe((val) => {
          console.log('Nam data is: ', val);
        });
    });
  }
}
