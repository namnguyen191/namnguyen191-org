import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoadingModule } from 'carbon-components-angular';

@Component({
  selector: 'namnguyen191-dui-ui-element-loading',
  standalone: true,
  imports: [LoadingModule],
  templateUrl: './dui-ui-element-loading.component.html',
  styleUrl: './dui-ui-element-loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiUiElementLoadingComponent {}
