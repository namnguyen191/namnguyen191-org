import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavComponent {}
