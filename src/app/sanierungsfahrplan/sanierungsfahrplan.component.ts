import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx'; 


@Component({
  selector: 'app-sanierungsfahrplan',
  imports: [FormsModule, CommonModule],
  templateUrl: './sanierungsfahrplan.component.html',
  styleUrls: ['./sanierungsfahrplan.component.css']
})
export class SanierungsfahrplanComponent {
  // Data to capture form inputs
  formData = {
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    strasse: '',
    postleitzahl:'',
    ort:'',
    gebaeudefoto:'',
    gebaeudeteil:'',
    gebaeudetyp:'',
    wohnungen:'',
    baujahr:'',
    laenge:'',
    breite:'',
    formDesGebaeudes:'',
    gebaeudeGrenzt:'',
    anzahlVollgeschosse:'',
    geschosshoehe:'',
    bauweise:'',
    baujahrFenster:'',
    verglasungFenster:'',
    materialFenster:'',
    beheizterAnbau:'',
    baujahrAnbau:'',
    hoeheAnbau:'',
    lueftungsanlage:'',
    lueftungsanlageType:'',
    artDerLueftung: '',
    gebaeudekuehlung:'',
    artDerKuehlung:'',
    warmwasseranlage:'',
    heizungsatyp:'',
    standortHeizungsanlage:'',
    fotoTypenschild:'',
    baujahrHeizung:'',
    photovoltaikanlage:'',
    solarthermie:'',
    pellets:'',
    baujahrRohrleitung:'',
    kellergeschossVorhanden:'',
    kellergeschossTyp:'',
    kellergeschossBeheizung:'',
    kellerbauweise:'',
    bodendaemmung:'',
    dachgeschossBeheizt:'',
    dachausrichtung:'',
    dachdaemmung:'',
    wandstaerke:'',
    wandstaerkeAnbau:'',
    daemmungFassade:'',
    anbauWanddaemmung:'',
    wandbauart: {
      Hochlochziegel: false,
      Bimsbetonhohlstein: false,
      ZweischaligeBauweise: false,
      Sonstige: false
    },
    massivwaende:'',
    zusatzdaemmung:''
  };

  // Method to handle form submission
  submitForm() {
    console.log('Form Data:', this.formData);
    // Prepare this data for backend submission
    // Convert the form data to Excel
    this.exportToExcel();
  }

  exportToExcel() {
    // Convert the formData object to an array of key-value pairs
    const dataToExport = Object.entries(this.formData).map(([key, value]) => ({
      Field: key,
      Value: value
    }));

    // Create a new worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'FormData');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'Sanierungsfahrplan_FormData.xlsx');
  }
}
