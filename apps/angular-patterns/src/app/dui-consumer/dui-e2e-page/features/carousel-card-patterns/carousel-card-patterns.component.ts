import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { signal, WritableSignal } from '@angular/core';
import { DjuiComponent } from '@dj-ui/core';

@Component({
  selector: 'namnguyen191-carousel-card-patterns',
  standalone: true,
  imports: [CommonModule, DjuiComponent],
  templateUrl: './carousel-card-patterns.component.html',
  styleUrl: './carousel-card-patterns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselCardPatternsComponent {
  layoutId: WritableSignal<string> = signal('carbon-simple-carousel-card-test');
}
