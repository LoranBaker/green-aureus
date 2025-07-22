import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SanierungsfahrplanComponent } from './sanierungsfahrplan.component';

describe('SanierungsfahrplanComponent', () => {
  let component: SanierungsfahrplanComponent;
  let fixture: ComponentFixture<SanierungsfahrplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SanierungsfahrplanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SanierungsfahrplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
