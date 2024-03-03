import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuiComponent } from './dui.component';

describe('DuiComponent', () => {
  let component: DuiComponent;
  let fixture: ComponentFixture<DuiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DuiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
