import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { MainNavComponent } from '../components/main-nav/main-nav.component';

@Component({
  standalone: true,
  imports: [RouterModule, MainNavComponent, MatSidenavModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly #matIconRegistry = inject(MatIconRegistry);
  readonly #domSanitizer = inject(DomSanitizer);

  constructor() {
    this.#matIconRegistry.addSvgIcon(
      'logo-no-background',
      this.#domSanitizer.bypassSecurityTrustResourceUrl('/logo/logo-no-background.svg')
    );
  }
}
