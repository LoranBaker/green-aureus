import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PvCockpitChartComponent } from './pv-cockpit-chart.component';

describe('PvCockpitChartComponent', () => {
  let component: PvCockpitChartComponent;
  let fixture: ComponentFixture<PvCockpitChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PvCockpitChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PvCockpitChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
