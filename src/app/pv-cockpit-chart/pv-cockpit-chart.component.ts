import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTooltip,
  ApexLegend,
  ApexFill,
  ApexDataLabels,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexGrid,
} from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';

export type PvCockpitChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  fill: ApexFill;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  grid: ApexGrid; 
};

@Component({
  selector: 'app-pv-cockpit-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './pv-cockpit-chart.component.html',
  styleUrls: ['./pv-cockpit-chart.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PvCockpitChartComponent {
  public chartOptions: PvCockpitChartOptions; 

  constructor() {
    const maxValue = 77000; // Max value for the x
    const percentageData = [
      {
        name: 'PV-Stromertrag',
        percentages: [63, 0] 
      },
      {
        name: 'Allgemein',
        percentages: [0, 12] 
      },
      {
        name: 'Zusätzlicher Verbrauch nach Anzahl Personen im HH',
        percentages: [0, 7] 
      },
      {
        name: 'Warmwasser mit Elektro- / Wärmenpumpen-Boiler',
        percentages: [0, 14] 
      },

      {
        name: 'Wärmepumpe /Elektrospeicher',
        percentages: [0, 60] 
      }
    ];

    // Convert percentages to actual values based on maxValue
    const series = percentageData.map(item => ({
      name: item.name,
      data: item.percentages.map(percent => (percent / 100) * maxValue),
    }));

    const filteredLegendSeries = series.filter((item) => item.name !== 'PV-Stromertrag');


    this.chartOptions = {
      series,
      chart: {
        type: 'bar',
        height: 200,
        stacked: true,
        background: '#ffffff',
        toolbar: {
          show: true
        }
      },
      plotOptions: {
        bar: {
          horizontal: true, // Makes the bars horizontal instead of vertical
          barHeight: '40%', // Adjust the height of the bars (as a percentage)
          borderRadius: 4, // Rounds the corners of the bars
          distributed: false,
        },
      },
      stroke: {
        width: 0,
      },
      xaxis: {
        categories: ['PV-Stromabdeckung',  'Gesamtverbrauch'],
        title: {
          text: '(kWh/Jahr)',
          style: {
            fontWeight: 'bold',
            fontSize: '12px'
          }
        },
        
        labels: {
          formatter: (value: string) => `${Number(value)}`
        },
        min: 0,
        max: maxValue,
        tickAmount: 7 // Divides the axis into 7 segments
      },
      tooltip: {
        y: {
          formatter: (val: number, opts) => {
            const seriesIndex = opts.seriesIndex;
            const dataPointIndex = opts.dataPointIndex;
            return `${percentageData[seriesIndex].percentages[dataPointIndex]}%`;
          }
        }
      },
      
      grid: {
        show: false, // This hides the grid lines
      },
      fill: {
        opacity: 1,
        colors: ['#00E396', '#C0C0C0', '#FFA500', '#87CEEB', '#FF6666']
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'left',
        offsetX: -10,
        customLegendItems: filteredLegendSeries.map((item) => item.name), // Only display filtered legend names
        labels: {
          colors: '#000',
        },
        
        markers: {
          fillColors: ['#C0C0C0', '#FFA500', '#87CEEB', '#FF6666'], // Custom markers for displayed legend items
        },
        
      },
      dataLabels: {
        enabled:false,
      },
      title: { // Add title here at the top level
        text: 'Stromverbrauch und PV-Cockpit',
        align: 'left',
        margin: 0,
        offsetY: 0,
        offsetX: 0,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
      }
      
    };
  }
}
