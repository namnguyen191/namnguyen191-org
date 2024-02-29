import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'namnguyen191-nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarComponent {}
