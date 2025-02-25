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
  measures = [
    {
      name: 'Heizung',
      budget: 41000,
      timeline: '10/2025',
      quarter: 'Q1/2024',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 76 // Progress in percentage
    },
    {
      name: 'Solarthermie',
      budget: 63500,
      timeline: '20/2025',
      quarter: 'Q2/2024',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 58 // Progress in percentage
    },
    {
      name: 'Photovoltaik',
      budget: 47850,
      timeline: '20/2025',
      quarter: 'Q3/2024',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 20 // Progress in percentage
    },
    {
      name: 'Kellerdecke',
      budget: 2000,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 100 // Progress in percentage
    },
    {
      name: 'Dachgeschossdecke',
      budget: 3000,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 60 // Progress in percentage
    },
    {
      name: 'Dach dämmen', 
      budget: 3000,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 90 // Progress in percentage
    },
    {
      name: 'Fassade dämmen', 
      budget: 3000,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 60 // Progress in percentage
    },
    {
      name: 'Dachfenster', 
      budget: 3000,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 80 // Progress in percentage
    },
    {
      name: 'Fenster & Türen', 
      budget: 3000,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 60 // Progress in percentage
    },
    {
      name: 'Lüftungsanlage', 
      budget: 3000,
      timeline: '',
      quarter: '',
      selectedMeasures: [] as string[],
      confirmedOptions: {} as { [key: string]: string[] },
      level: 39 // Progress in percentage
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
  showModal: boolean = false;
  modalMessage: string = '';
  selectedMeasureIndex: number | null = null;

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
    const idx = selectedList.indexOf(option);
    if (idx === -1) {
      selectedList.push(option);
    } else {
      selectedList.splice(idx, 1);
    }

    this.measures[measureIndex].level = this.calculateLevel(selectedList);
  }

  selectQuarter(index: number, quarter: string) {
    this.measures[index].quarter = quarter;
    this.toggleDropdown(index, 'quartals');
  }

  confirmSelection(measure: any, quarter: string) {
    if (!measure.confirmedOptions[quarter]) {
      measure.confirmedOptions[quarter] = [];
    }
    measure.confirmedOptions[quarter] = [...measure.selectedMeasures];
  }

  
  handleConfirm(measureIndex: number) {
    const measure = this.measures[measureIndex];
    const selectedMeasure = measure.selectedMeasures[measure.selectedMeasures.length - 1];
    const selectedMeasureIndex = this.measureOptions.indexOf(selectedMeasure);
  
    if (selectedMeasureIndex === 0) {
      this.confirmSelection(measure, measure.quarter);
      this.resetSelection(measureIndex);
      return;
    }
  
    const previousOptions = this.measureOptions.slice(0, selectedMeasureIndex).join(', ');
    this.modalMessage = `You selected "${selectedMeasure}". Are you sure you don't need these: ${previousOptions}?`;
    this.showModal = true;
    this.selectedMeasureIndex = measureIndex;
  }
  
  closeModal(confirm: boolean) {
    if (confirm && this.selectedMeasureIndex !== null) {
      const measure = this.measures[this.selectedMeasureIndex];
      measure.confirmedOptions[measure.quarter] = [...measure.selectedMeasures];
  
      this.resetSelection(this.selectedMeasureIndex);
    }
  
    this.showModal = false;
    this.modalMessage = '';
    this.selectedMeasureIndex = null;
  }
  
  resetSelection(index: number) {
    if (this.dropdownState[index]) {
      this.dropdownState[index].measures = false;
      this.dropdownState[index].quartals = false;
    }
  
    this.measures[index].selectedMeasures = [];  
  }
  
  
  resetDropdown(index: number) {
    if (this.dropdownState[index]) {
      this.dropdownState[index].measures = false;
      this.dropdownState[index].quartals = false;
    }
  }
  calculateLevel(selectedMeasures: string[]): number {
    if (!selectedMeasures.length) return 0;

    const highestIndex = Math.max(
      ...selectedMeasures.map((m: string) => this.measureOptions.indexOf(m))
    );

    return Math.round(((highestIndex + 1) / this.measureOptions.length) * 100);
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  get totalBudget() {
    return this.measures.reduce((sum, measure) => sum + measure.budget, 0);
  }

  printTable() {
    const printWindow = window.open('', '_blank');
  
    if (printWindow) {
      // Prepare the printable HTML
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
          </style>
        </head>
        <body>
          <h3 style="text-align: center;">Übersicht Maßnahmen - Timeline</h3>
          <table>
            <thead>
              <tr>
                <th>ESG-Maßnahmen</th>
                <th>Budget</th>
                <th>Timeline</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              ${this.measures
                .map((measure) => {
                  const timeline = this.formatTimeline(measure.confirmedOptions);
                  return `
                    <tr>
                      <td>${measure.name}</td>
                      <td>${measure.budget.toLocaleString('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      })}</td>
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
                <td colspan="4" style="text-align: right; font-weight: bold;">
                  Total Budget: ${this.totalBudget.toLocaleString('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500); // Close the print window after a short delay
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
