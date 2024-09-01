import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoadingModule } from 'carbon-components-angular';

@Component({
  selector: 'namnguyen191-dui-layout-loading',
  standalone: true,
  imports: [LoadingModule],
  templateUrl: './dui-layout-loading.component.html',
  styleUrl: './dui-layout-loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiLayoutLoadingComponent {}
