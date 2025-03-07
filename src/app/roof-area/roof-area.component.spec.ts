import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoofAreaComponent } from './roof-area.component';

describe('RoofAreaComponent', () => {
  let component: RoofAreaComponent;
  let fixture: ComponentFixture<RoofAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoofAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoofAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
