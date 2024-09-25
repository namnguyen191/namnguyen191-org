import { Directive, output } from '@angular/core';

@Directive({
  selector: '[djuiCommonEmitOnClick]',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
  },
})
export class EmitOnClickDirective {
  onHostClicked = output<void>();

  onClick(): void {
    this.onHostClicked.emit();
  }
}
