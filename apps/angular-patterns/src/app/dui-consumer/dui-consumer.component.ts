import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DuiComponent } from '@namnguyen191/dui';

@Component({
  selector: 'namnguyen191-dui-consumer',
  standalone: true,
  imports: [CommonModule, DuiComponent],
  templateUrl: './dui-consumer.component.html',
  styleUrl: './dui-consumer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiConsumerComponent {}
