import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent {
  Math = Math; // Make Math available in template
  
  measures = [
    {
      name: 'Heizung',
      budget: 41000,
      kosten: 20500,
      timeline: '10/2025',
      quarter: 'Q1/2024',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 76
    },
    {
      name: 'Solarthermie',
      budget: 63500,
      kosten: 127000,
      timeline: '20/2025',
      quarter: 'Q2/2024',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 58
    },
    {
      name: 'Photovoltaik',
      budget: 47850,
      kosten: 35000,
      timeline: '20/2025',
      quarter: 'Q3/2024',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 20
    },
    {
      name: 'Kellerdecke',
      budget: 2000,
      kosten: 1800,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 100
    },
    {
      name: 'Dachgeschossdecke',
      budget: 3000,
      kosten: 3200,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 60
    },
    {
      name: 'Dach dämmen', 
      budget: 3000,
      kosten: 2800,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 90
    },
    {
      name: 'Fassade dämmen', 
      budget: 3000,
      kosten: 3500,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 60
    },
    {
      name: 'Dachfenster', 
      budget: 3000,
      kosten: 2750,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 80
    },
    {
      name: 'Fenster & Türen', 
      budget: 3000,
      kosten: 3100,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 60
    },
    {
      name: 'Lüftungsanlage', 
      budget: 3000,
      kosten: 2900,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 39
    },
  ];

  measureOptions = [
    'Geplant',
    'Förderung',
    'Finanzierung',
    'Budgetiert',
    'Handwerker',
    'In Arbeit',
    'Saniert',
  ];

  quarterOptions: string[] = [];
  dropdownState: { [key: number]: { measures?: boolean; quartals?: boolean } } = {};

  constructor() {
    this.quarterOptions = this.generateQuarterOptions();
    for (const measure of this.measures) {
      measure.quarter = this.quarterOptions[0];
      measure.selectedMeasures.push(this.measureOptions[0]);
      measure.level = this.calculateLevel(measure.selectedMeasures);
    }
  }

  generateQuarterOptions(): string[] {
    const quarters: string[] = [];
    const currentYear = new Date().getFullYear();
    let startQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

    for (let year = currentYear; year < currentYear + 5; year++) {
      for (let q = startQuarter; q <= 4; q++) {
        quarters.push(`Q${q}/${year}`);
      }
      startQuarter = 1;
    }
    return quarters;
  }

  toggleDropdown(index: number, type: 'measures' | 'quartals') {
    if (!this.dropdownState[index]) {
      this.dropdownState[index] = {};
    }
    this.dropdownState[index][type] = !this.dropdownState[index][type];
  }

  toggleCheckbox(option: string, selectedList: string[], measureIndex: number) {
    const measure = this.measures[measureIndex];
    const currentQuarter = measure.quarter;
    
    // Check if this option is already confirmed for the current quarter
    const isConfirmedForCurrentQuarter = measure.confirmedOptions[currentQuarter]?.includes(option) || false;
    
    if (isConfirmedForCurrentQuarter) {
      // If it's confirmed, remove it from confirmed options
      this.removeConfirmedMeasure(measureIndex, currentQuarter, option);
      // Also remove from selected list if present
      const idx = selectedList.indexOf(option);
      if (idx !== -1) {
        selectedList.splice(idx, 1);
      }
    } else {
      // Normal toggle behavior for unconfirmed measures
      const idx = selectedList.indexOf(option);
      if (idx === -1) {
        selectedList.push(option);
      } else {
        selectedList.splice(idx, 1);
      }
    }

    this.measures[measureIndex].level = this.calculateLevel(selectedList);
  }

  // Method to check if a measure is confirmed for the current quarter
  isMeasureConfirmedForCurrentQuarter(measureIndex: number, option: string): boolean {
    const measure = this.measures[measureIndex];
    const currentQuarter = measure.quarter;
    return measure.confirmedOptions[currentQuarter]?.includes(option) || false;
  }

  // Method to check if a measure should be checked in the dropdown
  isMeasureChecked(measureIndex: number, option: string): boolean {
    const measure = this.measures[measureIndex];
    const isSelected = measure.selectedMeasures.includes(option);
    const isConfirmed = this.isMeasureConfirmedForCurrentQuarter(measureIndex, option);
    return isSelected || isConfirmed;
  }

  // Method to get display text for measures dropdown button
  getMeasuresDisplayText(measureIndex: number): string {
    const measure = this.measures[measureIndex];
    const currentQuarter = measure.quarter;
    
    // Get confirmed measures for current quarter
    const confirmedForCurrentQuarter = measure.confirmedOptions[currentQuarter] || [];
    
    // Combine confirmed and newly selected measures
    const allCurrentMeasures = [...confirmedForCurrentQuarter, ...measure.selectedMeasures];
    
    // Remove duplicates
    const uniqueMeasures = [...new Set(allCurrentMeasures)];
    
    if (uniqueMeasures.length > 0) {
      return uniqueMeasures.join(', ');
    }
    
    return this.measureOptions[0];
  }

  selectQuarter(index: number, quarter: string) {
    this.measures[index].quarter = quarter;
    this.toggleDropdown(index, 'quartals');
  }

  confirmSelection(measure: any, quarter: string) {
    if (!measure.confirmedOptions[quarter]) {
      measure.confirmedOptions[quarter] = [];
    }
    
    // Instead of replacing, we merge the new selections with existing ones
    const existingMeasures: string[] = measure.confirmedOptions[quarter] || [];
    const newMeasures: string[] = measure.selectedMeasures.filter((m: string) => !existingMeasures.includes(m));
    
    // Combine existing and new measures (avoid duplicates)
    measure.confirmedOptions[quarter] = [...existingMeasures, ...newMeasures];
  }

  handleConfirm(measureIndex: number) {
    const measure = this.measures[measureIndex];
    
    // Check if there are any selected measures
    if (!measure.selectedMeasures.length) {
      alert('Please select at least one measure before confirming.');
      return;
    }

    // Directly confirm the selection without modal
    this.confirmSelection(measure, measure.quarter);
    this.resetSelection(measureIndex);
  }
  
  resetSelection(index: number) {
    // Close dropdowns
    if (this.dropdownState[index]) {
      this.dropdownState[index].measures = false;
      this.dropdownState[index].quartals = false;
    }
  
    // Only clear the selected measures for new selection, but keep confirmed ones
    this.measures[index].selectedMeasures = [];  
  }
  
  resetDropdown(index: number) {
    if (this.dropdownState[index]) {
      this.dropdownState[index].measures = false;
      this.dropdownState[index].quartals = false;
    }
  }

  // Method to remove a specific confirmed measure from a quarter
  removeConfirmedMeasure(measureIndex: number, quarter: string, measureToRemove: string) {
    const measure = this.measures[measureIndex];
    if (measure.confirmedOptions[quarter]) {
      measure.confirmedOptions[quarter] = measure.confirmedOptions[quarter].filter(m => m !== measureToRemove);
      
      // If no measures left for this quarter, remove the quarter key
      if (measure.confirmedOptions[quarter].length === 0) {
        delete measure.confirmedOptions[quarter];
      }
    }
  }

  // Method to clear all confirmed measures for a specific quarter
  clearQuarterMeasures(measureIndex: number, quarter: string) {
    const measure = this.measures[measureIndex];
    if (measure.confirmedOptions[quarter]) {
      delete measure.confirmedOptions[quarter];
    }
  }

  calculateLevel(selectedMeasures: string[]): number {
    if (!selectedMeasures.length) return 0;

    const highestIndex = Math.max(
      ...selectedMeasures.map((m: string) => this.measureOptions.indexOf(m))
    );

    return Math.round(((highestIndex + 1) / this.measureOptions.length) * 100);
  }

  calculateCostPercentage(budget: number, kosten: number): number {
    if (budget === 0) return 0;
    return Math.round(((kosten - budget) / budget) * 100);
  }

  // Get the sign for percentage display (inverted logic)
  getPercentageSign(percentage: number): string {
    return percentage < 0 ? '+' : percentage > 0 ? '-' : ''; // Under budget shows +, over budget shows -
  }

  // Get CSS class for percentage styling
  getPercentageClass(percentage: number): string {
    if (percentage > 0) return 'text-danger'; // Over budget - red with - sign
    if (percentage < 0) return 'text-success'; // Under budget - green with + sign  
    return 'text-dark'; // Exactly on budget - dark with no sign
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  get totalBudget() {
    return this.measures.reduce((sum, measure) => sum + measure.budget, 0);
  }

  get totalKosten() {
    return this.measures.reduce((sum, measure) => sum + measure.kosten, 0);
  }

  get totalPercentage() {
    return this.calculateCostPercentage(this.totalBudget, this.totalKosten);
  }

  printTable() {
    const printWindow = window.open('', '_blank');
  
    if (printWindow) {
      const printableContent = `
        <html>
        <head>
          <title>Übersicht Maßnahmen - Timeline</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              font-weight: bold;
            }
            .progress-wrapper {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .progress-bar {
              height: 8px;
              flex: 1;
              background-color: #f1f1f1;
              border-radius: 4px;
              overflow: hidden;
            }
            .progress-bar-inner {
              height: 100%;
            }
            .text-success { color: #28a745; }
            .text-danger { color: #dc3545; }
            .text-dark { color: #212529; }
          </style>
        </head>
        <body>
          <h3 style="text-align: center;">Übersicht Maßnahmen - Timeline</h3>
          <table>
            <thead>
              <tr>
                <th>ESG-Maßnahmen</th>
                <th>Budget</th>
                <th>Kosten</th>
                <th>Percentage</th>
                <th>Timeline</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              ${this.measures
                .map((measure) => {
                  const timeline = this.formatTimeline(measure.confirmedOptions);
                  const percentage = this.calculateCostPercentage(measure.budget, measure.kosten);
                  return `
                    <tr>
                      <td>${measure.name}</td>
                      <td>${measure.budget.toLocaleString('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      })}</td>
                      <td>${measure.kosten.toLocaleString('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      })}</td>
                      <td class="${percentage > 0 ? 'text-danger' : percentage < 0 ? 'text-success' : 'text-dark'}">
                        ${percentage > 0 ? '+' : ''}${percentage}%
                      </td>
                      <td>${timeline || 'N/A'}</td>
                      <td>
                        <div class="progress-wrapper">
                          <span>${measure.level}%</span>
                          <div class="progress-bar">
                            <div class="progress-bar-inner" style="width: ${measure.level}%; background-color: ${
                    measure.level > 70 ? '#28a745' : measure.level > 30 ? '#ffc107' : '#dc3545'
                  };"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="text-align: right; font-weight: bold;">
                  Total Budget: ${this.totalBudget.toLocaleString('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </td>
                <td style="font-weight: bold;">
                  ${this.totalKosten.toLocaleString('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </td>
                <td class="${this.totalPercentage > 0 ? 'text-danger' : this.totalPercentage < 0 ? 'text-success' : 'text-dark'}" style="font-weight: bold;">
                  ${this.totalPercentage > 0 ? '+' : ''}${this.totalPercentage}%
                </td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
        </html>
      `;
  
      printWindow.document.open();
      printWindow.document.write(printableContent);
      printWindow.document.close();
    } else {
      alert('Failed to open the print window. Please check your popup blocker settings.');
    }
  }

  formatTimeline(confirmedOptions: { [key: string]: string[] }): string {
    const quarters = Object.keys(confirmedOptions);
    if (!quarters.length) return '';
  
    return quarters
      .map((quarter) => {
        const measures = confirmedOptions[quarter].join(', ');
        return `<strong>${quarter}:</strong> ${measures}`;
      })
      .join('<br>');
  }
}