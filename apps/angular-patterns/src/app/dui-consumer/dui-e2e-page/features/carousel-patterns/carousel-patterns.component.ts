import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { DjuiComponent } from '@dj-ui/core';

@Component({
  selector: 'namnguyen191-carousel-patterns',
  standalone: true,
  imports: [DjuiComponent],
  templateUrl: './carousel-patterns.component.html',
  styleUrl: './carousel-patterns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselPatternsComponent {
  layoutId: WritableSignal<string> = signal('LAYOUT_CARBON_TEST_SIMPLE_CAROUSEL');
}
