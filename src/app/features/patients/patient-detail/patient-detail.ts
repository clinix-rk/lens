import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { PatientService } from '../patient.service';
import { PatientResponse } from '../patient.model';
import { PatientInfoDialog } from './patient-info-dialog/patient-info-dialog';
import { PdfService } from '../../../core/services/pdf.service';
import { Complains } from '../../complains/complains';
import { Suggestions } from '../../suggestions/suggestions';
import { Treatments } from '../../treatments/treatments';
import { Prescriptions } from '../../prescriptions/prescriptions';
import { Payments } from '../../payments/payments';

@Component({
  selector: 'app-patient-detail',
  imports: [
    RouterLink,
    MatIcon,
    MatButton,
    MatIconButton,
    MatTabGroup,
    MatTab,
    Complains,
    Suggestions,
    Treatments,
    Prescriptions,
    Payments,
  ],
  templateUrl: './patient-detail.html',
  styleUrl: './patient-detail.scss',
})
export class PatientDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);
  private dialog = inject(MatDialog);

  private pdfService = inject(PdfService);
  hasPdf = signal<boolean>(false);
  patientFileId = signal<number | null>(null);

  @ViewChild('complainsTab') complainsTab?: Complains;
  @ViewChild('suggestionsTab') suggestionsTab?: Suggestions;
  @ViewChild('treatmentsTab') treatmentsTab?: Treatments;
  @ViewChild('prescriptionsTab') prescriptionsTab?: Prescriptions;
  @ViewChild('paymentsTab') paymentsTab?: Payments;

  patientId = signal<string | null>(null);
  patient = signal<PatientResponse | null>(null);
  isLoading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.patientId.set(idParam);

    if (idParam) {
      const numericId = Number(idParam);
      if (!isNaN(numericId)) {
        this.loadPatientData(numericId);
      } else {
        this.errorMsg.set('Invalid Patient ID format');
        this.isLoading.set(false);
      }
    } else {
      this.errorMsg.set('Patient ID not specified');
      this.isLoading.set(false);
    }
  }

  private loadPatientData(id: number) {
    this.isLoading.set(true);
    this.patientService.getPatientById(id).subscribe({
      next: (wrapper) => {
        this.patient.set(wrapper.data);
        this.checkPatientFile(id);
      },
      error: (err) => {
        console.error('Failed to load patient detail', err);
        this.errorMsg.set('Patient not found or API error.');
        this.isLoading.set(false);
      },
    });
  }

  private checkPatientFile(id: number) {
    this.patientService.getPatientFile(id).subscribe({
      next: (res) => {
        this.hasPdf.set(!!res.data);
        this.patientFileId.set(res.data ? res.data.id : null);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to check patient file', err);
        this.hasPdf.set(false);
        this.patientFileId.set(null);
        this.isLoading.set(false);
      }
    });
  }

  onPdfClick(fileInput: HTMLInputElement) {
    const currentPatient = this.patient();
    if (!currentPatient) return;

    if (this.hasPdf() && this.patientFileId()) {
      const dialogRef = this.pdfService.openPatientPdf(currentPatient.id, this.patientFileId()!);
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'deleted') {
          this.hasPdf.set(false);
          this.patientFileId.set(null);
        }
      });
    } else {
      fileInput.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const currentPatient = this.patient();
    if (!currentPatient) return;

    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeBytes) {
      alert('File size exceeds the 10 MB limit. Please select a smaller PDF file.');
      input.value = '';
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      alert('Invalid file format. Please upload a PDF file.');
      input.value = '';
      return;
    }

    this.isLoading.set(true);
    this.patientService.uploadPatientFile(currentPatient.id, file).subscribe({
      next: (res) => {
        this.hasPdf.set(true);
        this.patientFileId.set(res.data ? res.data.id : null);
        this.isLoading.set(false);
        alert('Patient PDF document uploaded successfully.');
        input.value = '';
      },
      error: (err) => {
        console.error('Failed to upload patient PDF', err);
        this.isLoading.set(false);
        const backendMsg = err?.error?.message;
        alert(backendMsg || 'Failed to upload PDF. Please make sure the file is a PDF and under 10MB.');
        input.value = '';
      }
    });
  }

  getFormattedPhoneNumbers(patient: PatientResponse | null): string {
    if (!patient || !patient.phoneNumbers || patient.phoneNumbers.length === 0) return '-';
    return patient.phoneNumbers.map((ph) => ph.phoneNumber).join(', ');
  }

  getAgeGender(patient: PatientResponse | null): string {
    if (!patient) return '';

    // Title-case gender
    const gender = patient.gender
      ? patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()
      : '';

    if (!patient.dateOfBirth) {
      return gender ? `- / ${gender}` : '-';
    }

    // Calculate age
    const dob = new Date(patient.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return `${age} Yrs / ${gender}`;
  }

  openMoreInfoDialog(editMode = false) {
    const currentPatient = this.patient();
    if (!currentPatient) return;

    const dialogRef = this.dialog.open(PatientInfoDialog, {
      width: '650px',
      data: { patient: currentPatient, editMode },
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((updatedPatient) => {
      if (updatedPatient) {
        this.patient.set(updatedPatient);
      }
    });
  }

  onTabChanged(tabIndex: number) {
    const tabComponents = [
      this.complainsTab,
      this.suggestionsTab,
      this.treatmentsTab,
      this.prescriptionsTab,
      this.paymentsTab,
    ];

    const selectedComponent = tabComponents[tabIndex];
    if (selectedComponent && typeof (selectedComponent as any).loadData === 'function') {
      (selectedComponent as any).loadData();
    }
  }
}
