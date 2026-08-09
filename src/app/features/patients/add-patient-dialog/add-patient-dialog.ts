import { Component, inject, signal, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PatientService } from '../patient.service';
import { CreatePatientRequest } from '../patient.model';
import { MultiSelectWithAdd } from '../../../shared/components/multi-select-with-add/multi-select-with-add';
import { DoctorService, Doctor } from '../../doctors/doctor.service';

@Component({
  selector: 'app-add-patient-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
    MatAutocompleteModule,
    MultiSelectWithAdd,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './add-patient-dialog.html',
  styleUrl: './add-patient-dialog.scss',
})
export class AddPatientDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddPatientDialog>);
  private patientService = inject(PatientService);
  private doctorService = inject(DoctorService);

  availableConditions = signal<string[]>([]);
  availableAllergies = signal<string[]>([]);
  doctors = signal<Doctor[]>([]);
  maxDate = new Date();

  patientForm: FormGroup = this.fb.group({
    doctorId: ['', Validators.required],
    name: ['', [Validators.required, Validators.maxLength(50)]],
    dateOfBirth: [null, Validators.required],
    gender: ['', Validators.required],
    email: ['', [Validators.email, Validators.maxLength(100)]],
    primaryPhone: ['', [Validators.required, Validators.pattern(/^\+?[1-9][0-9]{7,14}$/)]],
    secondaryPhone: ['', [Validators.pattern(/^\+?[1-9][0-9]{7,14}$/)]],
    address: [''],
    city: ['', [Validators.maxLength(50)]],
    pincode: ['', [Validators.pattern(/^[a-zA-Z0-9-]+$/)]],
    referredBy: ['', [Validators.maxLength(50)]],
    medicalConditions: [[]],
    drugAllergies: [''],
  });

  ngOnInit() {
    this.loadMetadata();
  }

  private loadMetadata() {
    this.patientService.getAvailableMedicalConditions().subscribe((conditions) => {
      this.availableConditions.set(conditions);
    });

    this.patientService.getAvailableDrugAllergies().subscribe((allergies) => {
      this.availableAllergies.set(allergies);
    });

    this.doctorService.getDoctors().subscribe((doctorsList) => {
      this.doctors.set(doctorsList);
    });
  }

  onConditionAdded(newCondition: string) {
    if (!this.availableConditions().includes(newCondition)) {
      this.availableConditions.update((list) => [...list, newCondition].sort());
    }
  }

  onAllergyAdded(newAllergy: string) {
    if (!this.availableAllergies().includes(newAllergy)) {
      this.availableAllergies.update((list) => [...list, newAllergy].sort());
    }
  }

  getFilteredAllergies(value: any): string[] {
    const filterValue = (
      typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : ''
    )
      .toLowerCase()
      .trim();
    if (!filterValue) {
      return this.availableAllergies();
    }
    return this.availableAllergies().filter((allergy) =>
      allergy.toLowerCase().includes(filterValue)
    );
  }

  onSubmit() {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    const val = this.patientForm.value;

    const phoneNumbers: { phoneNumber: string; type: 'PRIMARY' | 'SECONDARY' }[] = [
      { phoneNumber: val.primaryPhone, type: 'PRIMARY' },
    ];
    if (val.secondaryPhone) {
      phoneNumbers.push({ phoneNumber: val.secondaryPhone, type: 'SECONDARY' });
    }

    const medicalConditions = val.medicalConditions || [];
    const rawAllergies = val.drugAllergies;
    const drugAllergies: string[] =
      typeof rawAllergies === 'string'
        ? rawAllergies.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
        : Array.isArray(rawAllergies)
        ? rawAllergies
        : [];

    const request: CreatePatientRequest = {
      doctorId: Number(val.doctorId),
      name: val.name,
      dateOfBirth: this.formatDate(val.dateOfBirth),
      gender: val.gender,
      email: val.email || undefined,
      address: val.address || undefined,
      city: val.city || undefined,
      pincode: val.pincode || undefined,
      referredBy: val.referredBy || undefined,
      phoneNumbers,
      medicalConditions,
      drugAllergies,
    };

    this.patientService.addPatient(request).subscribe({
      next: (response) => {
        this.dialogRef.close(response.data);
      },
      error: (err) => {
        console.error('Failed to add patient', err);
      },
    });
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCancel() {
    this.dialogRef.close();
  }
}
