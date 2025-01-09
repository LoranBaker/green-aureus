import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TimelineComponent } from './timeline/timeline.component';
import { EmissionChartComponent } from './emission-chart/emission-chart.component';
import { PortfolioTimelineComponent } from "./portfolio-timeline/portfolio-timeline.component";
import { PvCockpitChartComponent } from "./pv-cockpit-chart/pv-cockpit-chart.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TimelineComponent, EmissionChartComponent, PortfolioTimelineComponent, PvCockpitChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'green-aureus';
}
