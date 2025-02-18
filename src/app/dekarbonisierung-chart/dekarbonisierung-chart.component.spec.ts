import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DekarbonisierungChartComponent } from './dekarbonisierung-chart.component';

describe('DekarbonisierungChartComponent', () => {
  let component: DekarbonisierungChartComponent;
  let fixture: ComponentFixture<DekarbonisierungChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DekarbonisierungChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DekarbonisierungChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
