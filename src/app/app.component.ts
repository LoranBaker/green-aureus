import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TimelineComponent } from './timeline/timeline.component';
import { EmissionChartComponent } from './emission-chart/emission-chart.component';
import { PortfolioTimelineComponent } from "./portfolio-timeline/portfolio-timeline.component";
import { PvCockpitChartComponent } from "./pv-cockpit-chart/pv-cockpit-chart.component";
import { RoofAreaComponent } from "./roof-area/roof-area.component";
import { SanierungsfahrplanComponent } from "./sanierungsfahrplan/sanierungsfahrplan.component";
import { DekarbonisierungChartComponent } from './dekarbonisierung-chart/dekarbonisierung-chart.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TimelineComponent, EmissionChartComponent, PortfolioTimelineComponent,
    PvCockpitChartComponent, RoofAreaComponent, SanierungsfahrplanComponent,DekarbonisierungChartComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'green-aureus';
}
