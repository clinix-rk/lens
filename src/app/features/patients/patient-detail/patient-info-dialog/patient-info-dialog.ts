import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PatientService } from '../../patient.service';
import { PatientResponse, UpdatePatientRequest } from '../../patient.model';
import { MultiSelectWithAdd } from '../../../../shared/components/multi-select-with-add/multi-select-with-add';

@Component({
  selector: 'app-patient-info-dialog',
  imports: [
    CommonModule,
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
    MatDatepickerModule
  ],
  templateUrl: './patient-info-dialog.html',
  styleUrl: './patient-info-dialog.scss'
})
export class PatientInfoDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PatientInfoDialog>);
  private patientService = inject(PatientService);
  protected data = inject<any>(MAT_DIALOG_DATA);

  patient = signal<PatientResponse>(this.data?.patient ? this.data.patient : this.data);
  isEditMode = signal<boolean>(this.data?.editMode !== undefined ? !!this.data.editMode : false);
  isSaving = signal<boolean>(false);
  maxDate = new Date();

  availableConditions = signal<string[]>([]);
  availableAllergies = signal<string[]>([]);

  patientForm!: FormGroup;

  ngOnInit() {
    this.loadMetadata();
    this.initForm();
  }

  private loadMetadata() {
    this.patientService.getAvailableMedicalConditions().subscribe(conditions => {
      // Merge current patient conditions into the available list to ensure they always show up
      const merged = Array.from(new Set([...conditions, ...this.patient().medicalConditions])).sort();
      this.availableConditions.set(merged);
    });

    this.patientService.getAvailableDrugAllergies().subscribe(allergies => {
      // Merge current patient allergies into the available list to ensure they always show up
      const merged = Array.from(new Set([...allergies, ...this.patient().drugAllergies])).sort();
      this.availableAllergies.set(merged);
    });
  }

  private initForm() {
    const currentPatient = this.patient();
    const primaryPhone = currentPatient.phoneNumbers.find(ph => ph.type === 'PRIMARY')?.phoneNumber || '';
    const secondaryPhone = currentPatient.phoneNumbers.find(ph => ph.type === 'SECONDARY')?.phoneNumber || '';
    const initialAllergies = Array.isArray(currentPatient.drugAllergies)
      ? currentPatient.drugAllergies.join(', ')
      : currentPatient.drugAllergies || '';

    this.patientForm = this.fb.group({
      name: [currentPatient.name, [Validators.required, Validators.maxLength(50)]],
      dateOfBirth: [currentPatient.dateOfBirth ? new Date(currentPatient.dateOfBirth) : null, Validators.required],
      gender: [currentPatient.gender, Validators.required],
      email: [currentPatient.email || '', [Validators.email, Validators.maxLength(100)]],
      primaryPhone: [primaryPhone, [Validators.required, Validators.pattern(/^\+?[1-9][0-9]{9,21}$/)]],
      secondaryPhone: [secondaryPhone, [Validators.pattern(/^\+?[1-9][0-9]{9,21}$/)]],
      address: [currentPatient.address || ''],
      city: [currentPatient.city || '', [Validators.maxLength(50)]],
      pincode: [currentPatient.pincode || '', [Validators.pattern(/^[a-zA-Z0-9-]+$/)]],
      referredBy: [currentPatient.referredBy || '', [Validators.maxLength(50)]],
      medicalConditions: [currentPatient.medicalConditions || []],
      drugAllergies: [initialAllergies]
    });
  }

  toggleEditMode() {
    if (this.isEditMode()) {
      // Revert changes
      this.initForm();
      this.isEditMode.set(false);
    } else {
      this.isEditMode.set(true);
    }
  }

  onConditionAdded(newCondition: string) {
    if (!this.availableConditions().includes(newCondition)) {
      this.availableConditions.update(list => [...list, newCondition].sort());
    }
  }

  onAllergyAdded(newAllergy: string) {
    if (!this.availableAllergies().includes(newAllergy)) {
      this.availableAllergies.update(list => [...list, newAllergy].sort());
    }
  }

  getFilteredAllergies(value: any): string[] {
    const filterValue = (typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : '').toLowerCase().trim();
    if (!filterValue) {
      return this.availableAllergies();
    }
    return this.availableAllergies().filter(allergy =>
      allergy.toLowerCase().includes(filterValue)
    );
  }

  onSubmit() {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const val = this.patientForm.value;

    const phoneNumbers: { phoneNumber: string; type: 'PRIMARY' | 'SECONDARY' }[] = [
      { phoneNumber: val.primaryPhone, type: 'PRIMARY' }
    ];
    if (val.secondaryPhone) {
      phoneNumbers.push({ phoneNumber: val.secondaryPhone, type: 'SECONDARY' });
    }

    const medicalConditions = val.medicalConditions || [];
    const rawAllergies = val.drugAllergies;
    const drugAllergies: string[] = typeof rawAllergies === 'string'
      ? rawAllergies.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : (Array.isArray(rawAllergies) ? rawAllergies : []);

    const request: UpdatePatientRequest = {
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
      drugAllergies
    };

    this.patientService.updatePatientById(this.patient().id, request).subscribe({
      next: (response) => {
        this.patient.set(response.data);
        this.isSaving.set(false);
        this.isEditMode.set(false);
      },
      error: (err) => {
        console.error('Failed to update patient details', err);
        this.isSaving.set(false);
      }
    });
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = date instanceof Date ? date : (typeof date.toDate === 'function' ? date.toDate() : new Date(date));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onClose() {
    // Return the latest updated patient so the parent component updates
    this.dialogRef.close(this.patient());
  }

  getPrimaryPhone(): string {
    return this.patient().phoneNumbers.find(ph => ph.type === 'PRIMARY')?.phoneNumber || '-';
  }

  getSecondaryPhone(): string {
    return this.patient().phoneNumbers.find(ph => ph.type === 'SECONDARY')?.phoneNumber || '-';
  }
}
