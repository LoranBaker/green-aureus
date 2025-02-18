import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexStroke,
  ApexLegend,
  ApexMarkers,
  ApexFill,
  ApexDataLabels,
  ApexPlotOptions,
  ApexGrid
} from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis[];
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  markers: ApexMarkers;
  legend: ApexLegend;
  fill: ApexFill;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  grid: ApexGrid;
};

interface EmissionData {
  Year: string;
  DE: number;
}

interface EmissionMeasure {
  x: string;
  y: number;
  action: string;
  isOutOfBounds?: boolean;
}

interface TableRow {
  year: string;
  measure: string;
  strandedAsset: string;
  strandedTime: string;
  co2Savings: string;
  co2Diff: string; 
}


@Component({
  selector: 'app-dekarbonisierung-chart',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './dekarbonisierung-chart.component.html',
  styleUrls: ['./dekarbonisierung-chart.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DekarbonisierungChartComponent {
  public chartOptions: ChartOptions = {
    series: [],
    chart: {
      type: 'line',
      height: 350,
      width: 800,
      stacked: false,
      background: '#FFFFFF',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    xaxis: {
      type: 'category'
    },
    yaxis: [
      {
        title: {
          text: 'kg CO₂/m²',
          style: { color: '#003366' }
        },
        labels: {
          style: { colors: '#003366' }
        },
        min: 0,
        max: 100,
        tickAmount: 4
      }
    ],
    fill: {
      type: 'solid',
      opacity: [0.7, 1],
      colors: ['#B9FBC0', '#0090FF']
    },
    stroke: {
      curve: ['smooth', 'smooth', 'straight', 'straight'],
      width: [4, 4, 2, 2],
      colors: ['#B9FBC0', '#0090FF', '#00008B', '#FF00FF']
    },
    markers: {
      size: 0
    },
    legend: {
      show: false
    },
    tooltip: {
      shared: true,
      intersect: false
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {},
    grid: {
      show: false,
      borderColor: '#FFFFFF',
      padding: { top: 10, right: 10, bottom: 0, left: 10 }
    }
  };

  public selectedSeries: 'single' | 'multi' = 'single';

  private singleSeries: { x: string; y: number }[] = [];
  private multiSeries: { x: string; y: number }[] = [];

  // Emission measures
  public emissionReductionData: EmissionMeasure[] = [
    { x: '2025', y: 35, action: 'CRREM Analyse' },
    { x: '2025', y: 21, action: 'Kellerdecke, Dach, Fenster, Heizung' },
    { x: '2027', y: 10, action: 'Photovoltaik' },
    { x: '2037', y: 1.5, action: 'Lüftungsanlage, Dachfenster' }
  ];

  public outOfBoundSeries: { x: string; y: number }[] = [];

  public tableData = this.emissionReductionData.map((item, i, arr) => {
    let co2Diff = "";
  
    if (i === 0) {
      co2Diff = "";
    } else {
      co2Diff = (arr[i - 1].y - item.y).toString();
    }
  
    return {
      year: item.x,
      measure: item.action,
      strandedAsset: item.y > 20 ? 'Yes' : 'No',
      strandedTime: item.y < 10 ? 'Critical' : 'Moderate',
      co2Savings: `${item.y} kg/m²`,
      co2Diff 
    };
  });
  
  calculateYearDistance(): { year: string; distance: string }[] {
    const selectedSeriesData = this.getSelectedSeriesData();
    if (!selectedSeriesData.length) return [];
  
    return this.emissionReductionData.map((measure) => {
      const closestPoint = selectedSeriesData.reduce((closest, data) => {
        const diffCurrent = Math.abs(parseInt(data.x, 10) - parseInt(measure.x, 10));
        const diffClosest = closest ? Math.abs(parseInt(closest.x, 10) - parseInt(measure.x, 10)) : Infinity;
        return diffCurrent < diffClosest ? data : closest;
      }, null as { x: string; y: number } | null);
  
      const strandedTime = closestPoint ? `${Math.abs(parseInt(measure.x, 10) - parseInt(closestPoint.x, 10))} years` : 'N/A';
  
      return {
        year: measure.x,
        distance: strandedTime
      };
    });
  }
  
  
  getSelectedSeriesData(): { x: string; y: number }[] {
    return this.selectedSeries === 'single' ? this.singleSeries : this.multiSeries;
  }
  
  
  public yearDistanceData: { singleYear: string; multiYear: string; distance: number }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEmissionData();
    this.updateChart(); 
  }

  loadEmissionData() {
    Promise.all([
      this.http
        .get<{ 'Single-family'?: EmissionData[] }>(
          'emission-data/single_family_data.json'
        )
        .toPromise(),
      this.http
        .get<{ 'Multi-family'?: EmissionData[] }>(
          'emission-data/multi_family_data.json'
        )
        .toPromise()
    ])
      .then(([singleData, multiData]) => {
        if (singleData && singleData['Single-family']) {
          this.singleSeries = singleData['Single-family'].map((item) => ({
            x: item.Year,
            y: item.DE
          }));
        }
        if (multiData && multiData['Multi-family']) {
          this.multiSeries = multiData['Multi-family'].map((item) => ({
            x: item.Year,
            y: item.DE
          }));
        }
        this.updateChart();
      })
      .catch((error) => {
        console.error('Error loading emission data:', error);
      });
  }

  generateVerticalDropSeries() {
    const arr = this.emissionReductionData;
    const transformed: { x: string; y: number }[] = [];
    for (let i = 0; i < arr.length - 1; i++) {
      transformed.push({ x: arr[i].x, y: arr[i].y });
      transformed.push({ x: arr[i + 1].x, y: arr[i].y });
      transformed.push({ x: arr[i + 1].x, y: arr[i + 1].y });
    }
    return transformed;
  }

  private findClosestDataPoint(
    existingSeries: { x: string; y: number }[],
    emissionYear: string,
    emissionY: number,
    threshold = 0.1
  ): { found: boolean; index: number } {
    if (!existingSeries || !existingSeries.length) return { found: false, index: -1 };

    let closestIndex = -1;
    let smallestDiff = Number.POSITIVE_INFINITY;
    existingSeries.forEach((dp, i) => {
      const diff = Math.abs(dp.y - emissionY);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIndex = i;
      }
    });

    if (smallestDiff > threshold) {
      return { found: false, index: -1 };
    }
    return { found: true, index: closestIndex };
  }

  private findClosestYMatch(
    series: { x: string; y: number }[],
    targetY: number
  ): { index: number; data: { x: string; y: number } } | null {
    if (!series || !series.length) return null;

    let closestIndex = 0;
    let smallestDiff = Math.abs(series[0].y - targetY);
    series.forEach((dp, i) => {
      const diff = Math.abs(dp.y - targetY);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIndex = i;
      }
    });

    return { index: closestIndex, data: series[closestIndex] };
  }
  updateChart() {
    const verticalDropSeries = this.generateVerticalDropSeries();
    this.outOfBoundSeries = [];
  
    const selectedSeriesData = this.selectedSeries === 'single' ? this.singleSeries : this.multiSeries;
  
    if (!selectedSeriesData.length) {
      console.warn("No data available for the selected series.");
      return;
    }
  
    let previousStrandedYear: number | null = null; // Store previous stranded time for comparison

    this.tableData = this.emissionReductionData.map((item, i, arr) => {
      let co2Diff = i === 0 ? "" : (arr[i - 1].y - item.y).toString();
  
      let closestMarker = selectedSeriesData.reduce((closest, data) => {
        const diffCurrent = Math.abs(data.y - item.y);
        const diffClosest = closest ? Math.abs(closest.y - item.y) : Infinity;
        return diffCurrent < diffClosest ? data : closest;
      }, null as { x: string; y: number } | null);
  
      let strandedYear = closestMarker ? parseInt(closestMarker.x, 10) : NaN;
      let actionYear = parseInt(item.x, 10);

      // Calculate Strand. Ztpkt.
      let strandedTimeValue: string;
      if (!isNaN(strandedYear)) {
          strandedTimeValue = strandedYear.toString();
      } else {
          strandedTimeValue = previousStrandedYear !== null ? previousStrandedYear.toString() : "N/A";
      }


      let strandedAssetValue: string;
      if (i === 0) {
          strandedAssetValue = !isNaN(strandedYear) ? `${strandedYear - actionYear} ` : "N/A";
      } else {
          strandedAssetValue = previousStrandedYear !== null
              ? `${parseInt(strandedTimeValue, 10) - previousStrandedYear} `
              : "N/A";
      }

      previousStrandedYear = parseInt(strandedTimeValue, 10);

      return {
        year: item.x,
        measure: item.action,
        strandedAsset: `${strandedAssetValue} Jahre`, 
        strandedTime: strandedTimeValue,  
        co2Savings: `${item.y} kg/m²`,
        co2Diff: co2Diff
      };
    });
    

    const singleFamilyMarkers = this.emissionReductionData.map((point, i) => {
      if (i === 0) return null;
      const result = this.findClosestDataPoint(
        this.singleSeries,
        point.x,
        point.y,
        0.5
      );
      if (!result.found) {
        this.outOfBoundSeries.push({ x: point.x, y: point.y });
        point.isOutOfBounds = true;
        const newIndex = this.outOfBoundSeries.length - 1;
        return {
          seriesIndex: 3,
          dataPointIndex: newIndex,
          size: 6,
          fillColor: '#FF0000',
          strokeColor: '#fff',
          strokeWidth: 2,
          action: point.action
        };
      } else {
        point.isOutOfBounds = false;
        return {
          seriesIndex: 0,
          dataPointIndex: result.index,
          size: 6,
          fillColor: '#FF0000',
          strokeColor: '#fff',
          strokeWidth: 2,
          action: point.action
        };
      }
    }).filter((m) => m !== null);

    const multiFamilyMarkers = this.emissionReductionData.map((point, i) => {
      if (i === 0) return null;
      const result = this.findClosestDataPoint(
        this.multiSeries,
        point.x,
        point.y,
        0.5
      );
      if (!result.found) {
        this.outOfBoundSeries.push({ x: point.x, y: point.y });
        point.isOutOfBounds = true;
        const newIndex = this.outOfBoundSeries.length - 1;
        return {
          seriesIndex: 3,
          dataPointIndex: newIndex,
          size: 6,
          fillColor: '#FF0000',
          strokeColor: '#fff',
          strokeWidth: 2,
          action: point.action
        };
      } else {
        point.isOutOfBounds = false;
        return {
          seriesIndex: 1,
          dataPointIndex: result.index,
          size: 6,
          fillColor: '#FF0000',
          strokeColor: '#fff',
          strokeWidth: 2,
          action: point.action
        };
      }
    }).filter((m) => m !== null);


    // Special Blue Series for the first measure
    // Increase marker size to 8 or 10 if you want it bigger
    const firstMeasureBlueSeries = {
      name: 'First Emission Marker',
      type: 'scatter',
      data: [
        // Just one data point:
        { x: '2025', y: 35 }
      ],
      markers: { size: 8, colors: ['#0000FF'] },
      tooltip: {
        enabled: true,
        intersect: true,
        custom: ({ seriesIndex, dataPointIndex, w }: {
          seriesIndex: number;
          dataPointIndex: number;
          w: any;
        }) => {
          const pointData = w.config.series[seriesIndex].data[dataPointIndex];
          // Do your own HTML
          return `
            <div style="
              background: #fff; 
              padding: 10px; 
              border: 1px solid #ccc; 
              border-radius: 5px;
              font-family: Arial, sans-serif;
              font-size: 12px;
              box-shadow: 2px 2px 10px rgba(0,0,0,0.2);
            ">
              <b>First Emission Marker</b><br/>
              Year: ${pointData.x}, CO₂: ${pointData.y} kg/m²
            </div>
          `;
        }
      }
    };
    

    // Emission Reduction Markers (vertical drops, seriesIndex=2)
    const emissionReductionMarkers = this.emissionReductionData.map((point) => {
      const dropIndex = verticalDropSeries.findIndex(
        (p, i) => p.x === point.x && i > 0 && verticalDropSeries[i - 1].y !== p.y
      );
      if (dropIndex !== -1) {
        return {
          seriesIndex: 2,
          dataPointIndex: dropIndex,
          size: 6,
          fillColor: '#00008B',
          strokeColor: '#fff'
        };
      }
      return null;
    }).filter((m) => m !== null);

    // Dashed lines (skip i=0 or outOfBounds)
    const singleFamilyLines: { x: string; y: number }[][] = [];
    const multiFamilyLines: { x: string; y: number }[][] = [];

    this.emissionReductionData.forEach((point, i) => {
      if (i === 0) return; // skip first measure
      if (point.isOutOfBounds) return;

      const singleClosest = this.findClosestYMatch(this.singleSeries, point.y);
      if (singleClosest) {
        const sameX = singleClosest.data.x === point.x;
        const sameY = singleClosest.data.y === point.y;
        if (!(sameX && sameY)) {
          singleFamilyLines.push([
            { x: singleClosest.data.x, y: singleClosest.data.y },
            { x: point.x, y: point.y }
          ]);
        }
      }

      const multiClosest = this.findClosestYMatch(this.multiSeries, point.y);
      if (multiClosest) {
        const sameX = multiClosest.data.x === point.x;
        const sameY = multiClosest.data.y === point.y;
        if (!(sameX && sameY)) {
          multiFamilyLines.push([
            { x: multiClosest.data.x, y: multiClosest.data.y },
            { x: point.x, y: point.y }
          ]);
        }
      }
    });

    const singleConnectionSeries = singleFamilyLines.map((line, idx) => ({
      name: `Single-Family Connection ${idx + 1}`,
      type: 'line',
      data: line,
      color: '#808080',
      stroke: { width: 2, dashArray: 5 }
    }));

    const multiConnectionSeries = multiFamilyLines.map((line, idx) => ({
      name: `Multi-Family Connection ${idx + 1}`,
      type: 'line',
      data: line,
      color: '#606060',
      stroke: { width: 2, dashArray: 5 }
    }));

    // Out-of-Bound Series
    const outOfBoundSeriesObj = {
      name: 'Out-of-Bound Markers',
      type: 'scatter',
      data: this.outOfBoundSeries,
      color: '#FF00FF'
    };

    // Final chart config
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: 'Single Family Dekarbonisierungspfad',
          type: 'area',
          data: this.selectedSeries === 'single' ? this.singleSeries : [],
          color: '#B9FBC0'
        },
        {
          name: 'Multi Family Dekarbonisierungspfad',
          type: 'area',
          data: this.selectedSeries === 'multi' ? this.multiSeries : [],
          color: '#0090FF'
        },
        {
          name: 'Emission Reduction Measures',
          type: 'line',
          data: verticalDropSeries,
          color: '#00008B'
        },
        outOfBoundSeriesObj,
        firstMeasureBlueSeries, 
        ...(this.selectedSeries === 'single' ? singleConnectionSeries : []),
        ...(this.selectedSeries === 'multi' ? multiConnectionSeries : [])
      ],
      markers: {
        size: 0,
        discrete: [
          ...singleFamilyMarkers,
          ...multiFamilyMarkers,
          ...emissionReductionMarkers
        ]
      },
      stroke: {
        width: [4, 4, 2, 2, 8], // the 5th is the firstMeasureBlueSeries
        dashArray: [0, 0, 0, 5, 0]
      },
      tooltip: {
        enabled: true,
        shared: false,
        intersect: true,
        custom: ({ seriesIndex, dataPointIndex, w }) => {
          const pointData = w.config.series[seriesIndex]?.data[dataPointIndex];
      
          // Single or Multi
          if (seriesIndex === 0 || seriesIndex === 1) {
            const markerWithAction = [
              ...singleFamilyMarkers,
              ...multiFamilyMarkers
            ].find(
              (m) =>
                m.seriesIndex === seriesIndex && m.dataPointIndex === dataPointIndex
            );
            const actionText = markerWithAction
              ? markerWithAction.action
              : 'No Action Recorded';
      
            return `
              <div style="
                background: white; 
                padding: 10px; 
                border: 1px solid #ccc; 
                border-radius: 5px; 
                font-family: Arial, sans-serif; 
                font-size: 12px; 
                box-shadow: 2px 2px 10px rgba(0,0,0,0.2);
              ">
                <div style="color: #FF9F00; font-weight: bold; font-size: 13px;">
                  Stranding Point in ${pointData.x}
                </div>
                <div style="font-weight: bold; margin-top: 5px;">
                  Maßnahmen:
                </div>
                <div style="margin-left: 10px;">✔️ ${actionText}</div>
              </div>
            `;
          }
      
          // Out-of-bound
          if (seriesIndex === 3) {
            const markerWithAction = [
              ...singleFamilyMarkers,
              ...multiFamilyMarkers
            ].find(
              (m) =>
                m.seriesIndex === 3 && m.dataPointIndex === dataPointIndex
            );
            const actionText = markerWithAction
              ? markerWithAction.action
              : 'No Action Recorded';
      
            return `
              <div style="
                background: white; 
                padding: 10px; 
                border: 1px solid #ccc; 
                border-radius: 5px; 
                font-family: Arial, sans-serif; 
                font-size: 12px; 
                box-shadow: 2px 2px 10px rgba(0,0,0,0.2);
              ">
                <div style="color: #FF9F00; font-weight: bold; font-size: 13px;">
                  Stranding Point in ${pointData.x}
                </div>
                <div style="font-weight: bold; margin-top: 5px;">
                  Maßnahmen:
                </div>
                <div style="margin-left: 10px;">✔️ ${actionText}</div>
              </div>
            `;
          }
      
          // The special first measure Blue series => name: 'First Measure (Blue)'
          if (w.config.series[seriesIndex]?.name === 'First Measure (Blue)') {
            const foundMeasure = this.emissionReductionData.find(
              (m) => m.x === pointData.x && m.y === pointData.y
            );
            if (foundMeasure) {
              return `
                <div style="background: white; border:1px solid #ccc; border-radius:5px;
                            padding:10px; font-size:12px; box-shadow:2px 2px 10px rgba(0,0,0,0.2);">
                  <div style="font-weight:bold;">First Measure</div>
                  <div>Year = ${foundMeasure.x}</div>
                  <div>CO₂: ${foundMeasure.y} kg/m²</div>
                  <div>Action: ${foundMeasure.action}</div>
                </div>
              `;
            }
            return `<div style="background:white; padding:8px;">First measure info not found</div>`;
          }
      
          // If Emission Reduction Measures (index=2)
          if (seriesIndex === 2) {
            // Emission Reduction Series
            if (dataPointIndex === 0) {
              // FIRST emission marker => separate tooltip
              return `
                <div style="
                  padding: 10px; 
                  border: 1px solid #ddd; 
                  background: #FFFBCC;
                  border-radius: 5px; 
                  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                ">
                  <div style="font-weight: bold; margin-bottom: 5px;">
                    First Emission Marker
                  </div>
                  <div>🔥 This is the <b>first</b> item in the Emission Measures!</div>
                </div>
              `;
            } else {
              // Normal Emission tooltip for others
              const emissionMatch = this.emissionReductionData.find(
                (d) => d.x === pointData.x
              );
              const emissionYear = emissionMatch ? emissionMatch.x : 'N/A';
              const emissionValue = emissionMatch ? emissionMatch.y : 'N/A';
          
              return `
                <div style="
                  padding: 10px; 
                  border: 1px solid #ddd; 
                  background: white; 
                  border-radius: 5px; 
                  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                ">
                  <div style="font-weight: bold; margin-bottom: 5px;">
                    Year: ${emissionYear}
                  </div>
                  <div style="margin-left: 10px;">
                    📉 CO₂ Intensity: ${emissionValue} kg/m²
                  </div>
                </div>
              `;
            }
          }
      
          return `<div style="background:white; padding:8px;">No Custom Tooltip</div>`;
        }
      }
    };
  }

  toggleSeries(series: 'single' | 'multi') {
    this.selectedSeries = series;
    this.updateChart();
  }
}  
