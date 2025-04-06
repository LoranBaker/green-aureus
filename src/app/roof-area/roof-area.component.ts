import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

// Interface for PV system parameters
interface PVParameters {
  alignment: string;        // Ausrichtung
  roofInclination: string;  // Dachneigung
  roofArea: string;         // Dachfläche
  moduleArea: string;       // Modulfläche
  peakPerformance: string;  // Peak Leistung
  panelCount: number;       // Anzahl Panels
  potentialYield: string;   // PV-Strompotenzial
  moduleType: string;       // Art
  usage: string;            // Einsatz
  storageSize: string;      // Speichergröße
  flowTemperature?: string; // Vorlauftemperatur (only for solarthermie)
}

// Interface for energy output data
interface EnergyOutputData {
  pvYield: string;           // PV-Stromertrag
  gridFeedIn: string;        // Gesamtverbrauch
  eigenverbrauch: string;    // Eigenverbrauch
  investmentCost?: string;   // Investition für PV
  sunHoursPA?: number;       // Sonnenstunden p.a.
  heatingPeriod?: string;    // Heizperiode
}

// Interface for monthly energy data
interface MonthlyEnergyData {
  month: string;
  strombedarf: number;       // Electricity need
  verteilungProzent: number; // Monthly distribution %
  eigenverbrauch: number;    // Self-consumption
  eigenverbrauchProzent: number; // Self-consumption %
  netzbezug: number;         // Grid purchase
  netzeinspeisung: number;   // Grid feed-in
  stromerzeugung: number;    // Electricity generation
}

@Component({
  selector: 'app-roof-area',
  standalone: true,
  templateUrl: './roof-area.component.html',
  styleUrls: ['./roof-area.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RoofAreaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') private chartContainer!: ElementRef;

  // Resize observer to handle responsive chart updates
  private resizeObserver: ResizeObserver | null = null;
  
  // Data model properties
  currentData: string = 'photovoltaik';
  withStorage: boolean = true;
  maxProduction: boolean = true;
  strompreis: string = '0'; // Property for electricity price
  readonly CO2_FACTOR: number = 0.3; // kg CO2 per kWh of grid electricity
  readonly FEED_IN_TARIFF: number = 0.081; // € per kWh fed into the grid
  readonly YEARS_PROJECTION: number = 15; // Number of years for projections

  // Monthly electricity consumption data 
  monthlyConsumptionData: { month: string; consumption: number; percentage: number }[] = [
    { month: 'Januar', consumption: 590, percentage: 9.83 },
    { month: 'Februar', consumption: 550, percentage: 9.17 },
    { month: 'März', consumption: 530, percentage: 8.83 },
    { month: 'April', consumption: 500, percentage: 8.33 },
    { month: 'Mai', consumption: 470, percentage: 7.83 },
    { month: 'Juni', consumption: 450, percentage: 7.50 },
    { month: 'Juli', consumption: 420, percentage: 7.00 },
    { month: 'August', consumption: 410, percentage: 6.83 },
    { month: 'September', consumption: 450, percentage: 7.50 },
    { month: 'Oktober', consumption: 480, percentage: 8.00 },
    { month: 'November', consumption: 540, percentage: 9.00 },
    { month: 'Dezember', consumption: 610, percentage: 10.17 }
  ];
  
  // Monthly PV electricity generation data (PV-Stromerzeugung)
  monthlyPVGenerationData: { month: string; generation: number }[] = [
    { month: 'Januar', generation: 312 },
    { month: 'Februar', generation: 365 },
    { month: 'März', generation: 521 },
    { month: 'April', generation: 966 },
    { month: 'Mai', generation: 1130 },
    { month: 'Juni', generation: 1356 },
    { month: 'Juli', generation: 1478 },
    { month: 'August', generation: 1489 },
    { month: 'September', generation: 1210 },
    { month: 'Oktober', generation: 834 },
    { month: 'November', generation: 321 },
    { month: 'Dezember', generation: 298 }
  ];

  // Properties for Berechnungsgrundlage
  storageText: string = 'Mit Speicher';
  productionText: string = 'Max. Stromproduktion';

  // Loading states
  isLoadingParams: boolean = false;

  // System parameters data 
  photovoltaikParams: PVParameters = {
    alignment: 'SSO',
    roofInclination: '45°',
    roofArea: '100 m²',
    moduleArea: '46 m²',
    peakPerformance: '11,5 kWp',
    panelCount: 23,
    potentialYield: '10.280 kWh/Jahr',
    moduleType: 'Monokristalline PV-Module',
    usage: 'Stromerzeugung',
    storageSize: '11 kWh / ohne'
  };

  solarthermieParams: PVParameters = {
    alignment: 'SO',
    roofInclination: '50°',
    roofArea: '200 m²',
    moduleArea: '80 m²',
    peakPerformance: '20 MW',
    panelCount: 40,
    potentialYield: '60.000 kWh/Jahr',
    moduleType: 'Polycrystalline PV-Module',
    usage: 'Wärmegewinnung',
    storageSize: '10 kWh',
    flowTemperature: '50°C'
  };

  // Energy output data
  energyOutputData: EnergyOutputData = {
    pvYield: '', // Will be calculated from monthly PV generation data
    gridFeedIn: '', // Will be calculated from monthly consumption data
    eigenverbrauch: '', // Will be calculated from monthly data
    investmentCost: '-14.465 €',
    sunHoursPA: 1200,
    heatingPeriod: '212 Tage'
  };

  // Monthly data with all calculated values
  monthlyEnergyData: MonthlyEnergyData[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // Calculate monthly energy data 
    this.calculateMonthlyEnergyData();
    
    // Set gridFeedIn, pvYield and eigenverbrauch based on calculated monthly data totals
    this.energyOutputData.gridFeedIn = this.calculatedGridFeedIn;
    this.energyOutputData.pvYield = this.calculatedPVYield;
    this.energyOutputData.eigenverbrauch = this.totalEigenverbrauchFormatted;
    
    // Initial setup of event listeners
    setTimeout(() => {
      this.setupEventListeners();
    }, 0);
  }

  ngAfterViewInit(): void {
    // Create the chart after the view is initialize
    setTimeout(() => {
      this.createEnergyBalanceChart();
      
      // Setup resize observer for responsive chart
      this.setupResizeObserver();
    }, 0);
  }

  ngOnDestroy(): void {
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }


  searchQuery: string = '';


onSearchInput(event: any): void {

  console.log('Searching for:', this.searchQuery);

}

// Clear search field
clearSearch(): void {
  this.searchQuery = '';
  console.log('Search cleared');
}

profitCalculated: boolean = false;

// Add this method to the RoofAreaComponent class:
calculatePVProfit(): void {
  // Check if user has entered a valid electricity price
  if (!this.strompreis || parseFloat(this.strompreis.replace(',', '.')) <= 0) {
    // Show alert if no valid price has been entered
    alert('Bitte geben Sie zunächst einen gültigen Strompreis ein.');
    return;
  }

  // Recalculate monthly data and outputs based on current inputs
  this.calculateMonthlyEnergyData();
  
  // Update calculated values
  this.energyOutputData.gridFeedIn = this.calculatedGridFeedIn;
  this.energyOutputData.pvYield = this.calculatedPVYield;
  this.energyOutputData.eigenverbrauch = this.totalEigenverbrauchFormatted;
  
  // Mark profit as calculated to display the values
  this.profitCalculated = true;
  
  // Update chart
  this.updateChart();
}

  // Computed property for current parameters
  get currentParameters(): PVParameters {
    return this.currentData === 'photovoltaik' ? this.photovoltaikParams : this.solarthermieParams;
  }

  // Calculate total annual consumption from monthly data
  get totalAnnualConsumption(): number {
    return this.monthlyConsumptionData.reduce((total, month) => total + month.consumption, 0);
  }

  // Calculate total annual PV generation from monthly data
  get totalAnnualPVGeneration(): number {
    return this.monthlyPVGenerationData.reduce((total, month) => total + month.generation, 0);
  }

  // Calculate and format gridFeedIn based on monthly data
  get calculatedGridFeedIn(): string {
    return this.totalAnnualConsumption.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' kWh';
  }
  
  // Calculate and format pvYield based on monthly PV generation data
  get calculatedPVYield(): string {
    return this.totalAnnualPVGeneration.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' kWh';
  }
  
  // Calculate all monthly energy data values
  calculateMonthlyEnergyData(): void {
    this.monthlyEnergyData = [];
    
    for (let i = 0; i < this.monthlyConsumptionData.length; i++) {
      const month = this.monthlyConsumptionData[i].month;
      const strombedarf = this.monthlyConsumptionData[i].consumption;
      const verteilungProzent = this.monthlyConsumptionData[i].percentage;
      const stromerzeugung = this.monthlyPVGenerationData[i].generation;
      
      // Calculate eigenverbrauch (self-consumption)
      // If PV generation is lower than consumption, all PV power is consumed
      // Otherwise, only as much as needed is consumed
      const eigenverbrauch = Math.min(strombedarf, stromerzeugung);
      
      // Calculate eigenverbrauch percentage
      const eigenverbrauchProzent = strombedarf > 0 ? (eigenverbrauch / strombedarf) * 100 : 0;
      
      // Calculate netzbezug (grid purchase)
      // If consumption is higher than PV generation, the difference is purchased from grid
      const netzbezug = Math.max(0, strombedarf - stromerzeugung);
      
      // Calculate netzeinspeisung (grid feed-in)
      // If PV generation is higher than consumption, the excess is fed into grid
      const netzeinspeisung = Math.max(0, stromerzeugung - strombedarf);
      
      this.monthlyEnergyData.push({
        month,
        strombedarf,
        verteilungProzent,
        eigenverbrauch,
        eigenverbrauchProzent,
        netzbezug,
        netzeinspeisung,
        stromerzeugung
      });
    }
  }

  // Calculate totals for the whole year from monthly energy data
  get totalEigenverbrauch(): number {
    return this.monthlyEnergyData.reduce((total, month) => total + month.eigenverbrauch, 0);
  }
  
  get totalEigenverbrauchFormatted(): string {
    return this.totalEigenverbrauch.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' kWh';
  }
  
  get totalNetzbezug(): number {
    return this.monthlyEnergyData.reduce((total, month) => total + month.netzbezug, 0);
  }
  
  get totalNetzbezugFormatted(): string {
    return this.totalNetzbezug.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' kWh';
  }
  
  get totalNetzeinspeisung(): number {
    return this.monthlyEnergyData.reduce((total, month) => total + month.netzeinspeisung, 0);
  }
  
  get totalNetzeinspeisungFormatted(): string {
    return this.totalNetzeinspeisung.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' kWh';
  }
  
  // Parse Gesamtverbrauch (total consumption) as number for calculations
  get gesamtverbrauchValue(): number {
    return this.totalAnnualConsumption;
  }
  
  // Parse Strompreis (electricity price) as number for calculations
  get strompreisValue(): number {
    return parseFloat(this.strompreis.replace('.', '').replace(',', '.'));
  }
  
  // Calculate Überschusseinspeisung Netz (grid feed-in)
  get ueberschusseinspeisung(): string {
    return this.totalNetzeinspeisungFormatted;
  }
  
  // Get Überschusseinspeisung value as number (for calculations)
  get ueberschusseinspeisungValue(): number {
    return this.totalNetzeinspeisung;
  }
  
  // Calculate Netzbezug (grid usage)
  get netzbezug(): string {
    return this.totalNetzbezugFormatted;
  }
  
  // Get Netzbezug value as number (for calculations)
  get netzbezugValue(): number {
    return this.totalNetzbezug;
  }
  
  // Calculate Autarkie percentage
  get autarkiePercentage(): number {
    // Use total eigenverbrauch from monthly calculations
    const eigenverbrauchValue = this.totalEigenverbrauch;
    const gesamtverbrauchValue = this.gesamtverbrauchValue;
    
    // Calculate percentage
    const autarkieValue = (eigenverbrauchValue / gesamtverbrauchValue) * 100;
    
    // Round to nearest integer
    return Math.round(autarkieValue);
  }
  
  // Calculate Stromüberschuss percentage (Electricity Surplus)
  get stromuberschussPercentage(): number {
    // Use the total annual PV generation directly
    const pvYieldValue = this.totalAnnualPVGeneration;
    const gesamtverbrauchValue = this.gesamtverbrauchValue;
    
    // Calculate percentage: PV-Stromertrag / Gesamtverbrauch * 100
    const stromuberschussValue = (pvYieldValue / gesamtverbrauchValue) * 100;
    
    // Round to nearest integer
    return Math.round(stromuberschussValue);
  }
  
  // Get CO2 savings value per year as number (for calculations)
  get co2SavingsValue(): number {
    // Use the total eigenverbrauch from monthly calculations
    const eigenverbrauchValue = this.totalEigenverbrauch;
    
    // Calculate CO2 savings (kg): eigenverbrauch (kWh) × CO2_FACTOR kg CO2/kWh
    return eigenverbrauchValue * this.CO2_FACTOR;
  }

  // Calculate CO2 savings based on self-consumed PV electricity
  get co2Savings(): string {
    // Format the result with German number format
    return this.co2SavingsValue.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' Kg';
  }
  
  // Get cost savings value as number (for calculations)
  get costSavingsValue(): number {
    // Use the total eigenverbrauch from monthly calculations
    const eigenverbrauchValue = this.totalEigenverbrauch;
    
    // Parse strompreis value, handling German number format
    const strompreisValue = parseFloat(this.strompreis.replace('.', '').replace(',', '.'));
    
    // Calculate cost savings (€): eigenverbrauch (kWh) × strompreis (€/kWh)
    return eigenverbrauchValue * strompreisValue;
  }
  
  // Calculate cost savings based on self-consumed PV electricity and electricity price
  get costSavings(): string {
    // Format the result with German number format
    return this.costSavingsValue.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' €';
  }
  
  // Get sales revenue value as number (for calculations)
  get salesRevenueValue(): number {
    // Calculate revenue (€): ueberschusseinspeisung (kWh) × FEED_IN_TARIFF (€/kWh)
    return this.ueberschusseinspeisungValue * this.FEED_IN_TARIFF;
  }
  
  // Calculate revenue from selling excess electricity to the grid
  get salesRevenue(): string {
    // Format the result with German number format
    return this.salesRevenueValue.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' €/Jahr';
  }
  
  // Calculate total added value (Mehrwert p.a.) - sum of cost savings and sales revenue
  get mehrwertTotal(): string {
    // Calculate the sum of cost savings and sales revenue
    const mehrwertValue = this.costSavingsValue + this.salesRevenueValue;
    
    // Format the result with German number format
    return mehrwertValue.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' €';
  }
  
  // Calculate costs without PV over 15 years
  get costsWithoutPV(): number {
    // Calculate: consumption (kWh/year) × years × electricity price (€/kWh)
    return this.gesamtverbrauchValue * this.YEARS_PROJECTION * this.strompreisValue;
  }
  
  // Format costs without PV for display
  get costsWithoutPVFormatted(): string {
    return this.costsWithoutPV.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' €';
  }
  
  // Calculate costs with PV over 15 years (netzbezug × 15 years × electricity price)
  get costsWithPV(): number {
    return this.netzbezugValue * this.YEARS_PROJECTION * this.strompreisValue;
  }
  
  // Format costs with PV for display (as negative value)
  get costsWithPVFormatted(): string {
    return '-' + this.costsWithPV.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' €';
  }
  
  // Calculate saved electricity costs (Stromkosten gespart)
  get stromkostenGespart(): number {
    return this.costsWithoutPV - this.costsWithPV;
  }
  
  // Format saved electricity costs for display
  get stromkostenGespartFormatted(): string {
    return this.stromkostenGespart.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' €';
  }
  
  // Calculate total revenue from electricity sales over 15 years
  get ertragStromverkauf15J(): number {
    // Use the salesRevenueValue getter which already calculates annual revenue
    return this.salesRevenueValue * this.YEARS_PROJECTION;
  }
  
  // Format total revenue from electricity sales for display
  get ertragStromverkauf15JFormatted(): string {
    return this.ertragStromverkauf15J.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' €';
  }
  
  // Get investment cost for PV system (formatted for display)
  get investmentCostFormatted(): string {
    return this.energyOutputData.investmentCost || '-0 €';
  }
  
  // Get investment cost value as number (for calculations)
  get investmentCostValue(): number {
    if (!this.energyOutputData.investmentCost) return 0;
    return parseFloat(this.energyOutputData.investmentCost.replace('.', '').replace(',', '.').replace(' €', '').replace('€', ''));
  }
  
  // Calculate savings after investment
  get ersparnisseNachInvest(): number {
    return this.stromkostenGespart + this.ertragStromverkauf15J + this.investmentCostValue;
  }
  
  // Format savings after investment for display
  get ersparnisseNachInvestFormatted(): string {
    return this.ersparnisseNachInvest.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' €';
  }
  
  // Calculate total CO2 savings over 15 years in kg
  get co2SavingsTotal(): number {
    return this.co2SavingsValue * this.YEARS_PROJECTION;
  }
  
  // Calculate total CO2 savings over 15 years in tons
  get co2SavingsTons(): number {
    return this.co2SavingsTotal / 1000;
  }
  
  // Format total CO2 savings in kg for display
  get co2SavingsTotalFormatted(): string {
    return this.co2SavingsTotal.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' kg';
  }
  
  // Format total CO2 savings in tons for display
  get co2SavingsTonsFormatted(): string {
    return this.co2SavingsTons.toLocaleString('de-DE', { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1 
    }).replace('.', ',') + ' Ton.';
  }
  
  // Calculate equivalent number of trees based on CO2 savings
  get equivalentTrees(): number {
    const KG_CO2_PER_TREE = 25; // kg CO2 absorbed by one tree per year
    return this.co2SavingsTotal / KG_CO2_PER_TREE;
  }
  
  // Format equivalent number of trees for display
  get equivalentTreesFormatted(): string {
    return Math.round(this.equivalentTrees).toLocaleString('de-DE');
  }
  
  // Calculate annual cost savings
  get ersparnissePA(): number {
    // Using costSavingsValue which is already calculated as: eigenverbrauch × strompreis
    return this.costSavingsValue;
  }
  
  // Calculate break-even period in years
  get breakEvenYears(): number {
    // Take the absolute value of investmentCostValue (which is negative)
    const investmentAbsolute = Math.abs(this.investmentCostValue);
    
    // Calculate annual total benefit (H+D)
    const annualBenefit = this.ersparnissePA + this.salesRevenueValue;
    
    // Calculate G/(H+D)
    return investmentAbsolute / annualBenefit;
  }
  
  // Format break-even period for display
  get breakEvenYearsFormatted(): string {
    return Math.round(this.breakEvenYears) + ' J.';
  }
  
  // Get sun hours per year for display
  get sunHoursPAFormatted(): string {
    return this.energyOutputData.sunHoursPA?.toString() || '0';
  }
  
  // Get heating period for display
  get heatingPeriodFormatted(): string {
    return this.energyOutputData.heatingPeriod || '0 Tage';
  }
  
  // Update Strompreis when input changes
  updateStrompreis(event: any): void {
    // Ensure only valid number format with comma
    const value = event.target.value;
    // Replace any non-numeric characters except comma
    const sanitizedValue = value.replace(/[^0-9,]/g, '');
    // Ensure only one comma
    const parts = sanitizedValue.split(',');
    if (parts.length > 1) {
      this.strompreis = parts[0] + ',' + parts.slice(1).join('');
    } else {
      this.strompreis = sanitizedValue;
    }
    
    // Recalculations will happen automatically through getter methods
    console.log('Strompreis updated:', this.strompreis);
    
    // Update chart
    this.updateChart();
  }

  // Toggle between photovoltaik and solarthermie
  toggleData(event: any): void {
    this.currentData = event.target.checked ? 'solarthermie' : 'photovoltaik';
    
    // Update chart
    this.updateChart();
  }

  // Toggle storage mode
  toggleStorage(event: any): void {
    this.withStorage = !event.target.checked;
    
    // Update labels with bold styling
    const mitSpeicherLabel = document.getElementById('mitSpeicherLabel');
    const ohneSpeicherLabel = document.getElementById('ohneSpeicherLabel');
    
    if (mitSpeicherLabel) {
      mitSpeicherLabel.classList.toggle('fw-bold', this.withStorage);
    }
    
    if (ohneSpeicherLabel) {
      ohneSpeicherLabel.classList.toggle('fw-bold', !this.withStorage);
    }

    // Update property for template binding
    this.storageText = this.withStorage ? 'Mit Speicher' : 'Ohne Speicher';
    
    // Update chart
    this.updateChart();
  }

  // Toggle production/coverage mode
  toggleProduction(event: any): void {
    this.maxProduction = !event.target.checked;
    
    // Update labels with bold styling
    const productionLabel = document.getElementById('productionLabel');
    const coverageLabel = document.getElementById('coverageLabel');
    
    if (productionLabel) {
      productionLabel.classList.toggle('fw-bold', this.maxProduction);
    }
    
    if (coverageLabel) {
      coverageLabel.classList.toggle('fw-bold', !this.maxProduction);
    }

    // Update property for template binding
    this.productionText = this.maxProduction ? 'Max. Stromproduktion' : 'Max. Stromabdeckung';
    
    // Update chart
    this.updateChart();
  }

  // Set up event listeners for toggle controls
  private setupEventListeners(): void {
    // Storage toggle
    const storageToggle = document.getElementById('storageToggle') as HTMLInputElement;
    if (storageToggle) {
      storageToggle.addEventListener('change', (event) => this.toggleStorage(event));
    }
    
    // Production toggle
    const productionToggle = document.getElementById('productionToggle') as HTMLInputElement;
    if (productionToggle) {
      productionToggle.addEventListener('change', (event) => this.toggleProduction(event));
    }
  }

  // Set up resize observer for responsive chart
  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateChart();
      });
      
      if (this.chartContainer && this.chartContainer.nativeElement) {
        this.resizeObserver.observe(this.chartContainer.nativeElement);
      }
    }
  }

  // Update the chart (recalculate and redraw)
  private updateChart(): void {
    // Recalculate monthly data
    this.calculateMonthlyEnergyData();
    
    // Update calculated values
    this.energyOutputData.gridFeedIn = this.calculatedGridFeedIn;
    this.energyOutputData.pvYield = this.calculatedPVYield;
    this.energyOutputData.eigenverbrauch = this.totalEigenverbrauchFormatted;
    
    // Redraw the chart
    if (this.chartContainer && this.chartContainer.nativeElement) {
      this.createEnergyBalanceChart();
    }
  }
  
  // Generate abbreviated month names for chart labels
  private getAbbreviatedMonthNames(): string[] {
    return this.monthlyConsumptionData.map(item => {
      // Get first three characters of month name
      return item.month.substring(0, 3);
    });
  }
  
  // Format kWh value for tooltip
  private formatKwh(value: number): string {
    return value.toLocaleString('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }) + ' kWh';
  }

  // Create tooltip element
  private createTooltip(): d3.Selection<HTMLDivElement, unknown, HTMLElement, any> {
    // Remove any existing tooltip
    d3.select('body').selectAll('.energy-chart-tooltip').remove();
      
    return d3.select('body')
      .append('div')
      .attr('class', 'energy-chart-tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('background', 'rgba(255, 255, 255, 0.95)')
      .style('padding', '8px 12px')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('box-shadow', '0 2px 5px rgba(0, 0, 0, 0.1)')
      .style('z-index', '100');
  }

  // Create the energy balance chart using D3.js
private createEnergyBalanceChart(): void {
  if (!this.chartContainer || !this.chartContainer.nativeElement) {
    return;
  }
  
  const container = this.chartContainer.nativeElement;
  
  // Clear any previous chart
  d3.select(container).selectAll('*').remove();
  
  // Set up dimensions and margins
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;
  
  // Create SVG element
  const svg = d3.select(container)
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Create X scale for months
  const x = d3.scaleBand()
    .domain(this.getAbbreviatedMonthNames())
    .range([0, width])
    .padding(0.3);
  
  // Find max value for Y scale
  const maxEigenverbrauchPlusNetzbezug = d3.max(this.monthlyEnergyData, d => d.eigenverbrauch + d.netzbezug) || 0;
  const maxNetzeinspeisung = d3.max(this.monthlyEnergyData, d => d.netzeinspeisung) || 0;
  const maxStrombedarf = d3.max(this.monthlyEnergyData, d => d.strombedarf) || 0;
  
  // Add a bit of padding to the max value
  const yMax = Math.max(maxEigenverbrauchPlusNetzbezug, maxNetzeinspeisung, maxStrombedarf) * 1.05;
  
  // Create Y scale
  const y = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);
  
  // Create tooltip
  const tooltip = this.createTooltip();
  
  // Create horizontal grid lines
  svg.append('g')
    .attr('class', 'grid')
    .selectAll('line')
    .data(y.ticks(5))
    .enter()
    .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '3,3');
  
  // Add X axis
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('dy', '1em');
  
  // Add Y axis
  svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}`));
  
  // Remove axis lines
  svg.selectAll('.domain').remove();
  svg.selectAll('.tick line').remove();
  
  // Create Netzeinspeisung bars (Grid feed-in, blue)
  const netzeinspeisungBars = svg.selectAll('.bar-netzeinspeisung')
    .data(this.monthlyEnergyData)
    .enter()
    .append('rect')
      .attr('class', 'bar-netzeinspeisung')
      .attr('x', d => (x(d.month.substring(0, 3)) || 0))
      .attr('y', d => y(d.netzeinspeisung))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.netzeinspeisung))
      .attr('fill', '#2196F3') // Updated to match CSS (blue)
      .attr('rx', 2)
      .attr('ry', 2);
      
  // Add tooltip for Netzeinspeisung bars
  netzeinspeisungBars
    .on('mouseover', (event, d) => {
      tooltip
        .style('opacity', 1)
        .html(`
          <div><strong>${d.month}</strong></div>
          <div>Netzeinspeisung: ${this.formatKwh(d.netzeinspeisung)}</div>
        `);
    })
    .on('mousemove', (event) => {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });
  
  // Create Eigenverbrauch bars (Self-consumption, green)
  const eigenverbrauchBars = svg.selectAll('.bar-eigenverbrauch')
    .data(this.monthlyEnergyData)
    .enter()
    .append('rect')
      .attr('class', 'bar-eigenverbrauch')
      .attr('x', d => (x(d.month.substring(0, 3)) || 0))
      .attr('y', d => y(d.eigenverbrauch))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.eigenverbrauch))
      .attr('fill', '#4CAF50') // Updated to match CSS (green)
      .attr('rx', 2)
      .attr('ry', 2);
  
  // Add tooltip for Eigenverbrauch bars
  eigenverbrauchBars
    .on('mouseover', (event, d) => {
      tooltip
        .style('opacity', 1)
        .html(`
          <div><strong>${d.month}</strong></div>
          <div>Eigenverbrauch PV-Strom: ${this.formatKwh(d.eigenverbrauch)}</div>
        `);
    })
    .on('mousemove', (event) => {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });
  
  // Create Netzbezug bars (Grid purchase, gray)
  const netzbezugBars = svg.selectAll('.bar-netzbezug')
    .data(this.monthlyEnergyData)
    .enter()
    .append('rect')
      .attr('class', 'bar-netzbezug')
      .attr('x', d => (x(d.month.substring(0, 3)) || 0))
      .attr('y', d => y(d.eigenverbrauch + d.netzbezug))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.netzbezug))
      .attr('fill', '#9E9E9E') // Updated to match CSS (gray)
      .attr('rx', 2)
      .attr('ry', 2);
  
  // Add tooltip for Netzbezug bars
  netzbezugBars
    .on('mouseover', (event, d) => {
      tooltip
        .style('opacity', 1)
        .html(`
          <div><strong>${d.month}</strong></div>
          <div>Netzbezug: ${this.formatKwh(d.netzbezug)}</div>
        `);
    })
    .on('mousemove', (event) => {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });
  
  // Create line generator for Strombedarf (Electricity demand)
  const lineGenerator = d3.line<MonthlyEnergyData>()
    .x(d => (x(d.month.substring(0, 3)) || 0) + x.bandwidth() / 2)
    .y(d => y(d.strombedarf));
  
  // Add Strombedarf dotted line (orange-red)
  svg.append('path')
    .datum(this.monthlyEnergyData)
    .attr('class', 'line-strombedarf')
    .attr('d', lineGenerator)
    .attr('fill', 'none')
    .attr('stroke', '#FF5722') // Updated to match CSS (orange-red)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5');
    
  // Add visible dots/markers on the Strombedarf line
  const dots = svg.selectAll('.dot-strombedarf')
    .data(this.monthlyEnergyData)
    .enter()
    .append('circle')
      .attr('class', 'dot-strombedarf')
      .attr('cx', d => (x(d.month.substring(0, 3)) || 0) + x.bandwidth() / 2)
      .attr('cy', d => y(d.strombedarf))
      .attr('r', 4) // Increased radius to make dots more visible
      .attr('fill', '#FF5722') // Match line color (orange-red)
      .style('opacity', 1) // Make dots visible
      .style('cursor', 'pointer'); // Change cursor on hover
  
  // Add tooltip for Strombedarf dots
  dots
    .on('mouseover', (event, d) => {
      // Highlight the current dot
      d3.select(event.currentTarget)
        .attr('r', 6)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
        
      tooltip
        .style('opacity', 1)
        .html(`
          <div><strong>${d.month}</strong></div>
          <div>Strombedarf: ${this.formatKwh(d.strombedarf)}</div>
        `);
    })
    .on('mousemove', (event) => {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', (event) => {
      // Restore normal dot appearance
      d3.select(event.currentTarget)
        .attr('r', 4)
        .attr('stroke', 'none');
        
      tooltip.style('opacity', 0);
    });
}
}