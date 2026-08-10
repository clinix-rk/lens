import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MedicineLibraryService, MedicineCatalogueEntry } from '../../../shared/services/medicine-library.service';

export interface AddMedicineDialogData {
  defaultName?: string;
}

@Component({
  selector: 'app-add-medicine-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatButton
  ],
  templateUrl: './add-medicine-dialog.html',
  styleUrl: './add-medicine-dialog.scss'
})
export class AddMedicineDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddMedicineDialog>);
  private data = inject<AddMedicineDialogData>(MAT_DIALOG_DATA, { optional: true });
  private medicineLibrary = inject(MedicineLibraryService);

  medicineForm!: FormGroup;
  isSubmitting = false;

  medicineTypes = [
    'Tablet',
    'Capsule',
    'Syrup',
    'Injection',
    'Drops',
    'Cream',
    'Ointment',
    'Other'
  ];

  ngOnInit() {
    this.medicineForm = this.fb.group({
      name: [this.data?.defaultName || '', [Validators.required]],
      type: ['Tablet', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.medicineForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const { name, type } = this.medicineForm.value;

    this.medicineLibrary.createMedicine({ name: name.trim(), type }).subscribe({
      next: (entry: MedicineCatalogueEntry) => {
        this.isSubmitting = false;
        this.dialogRef.close(entry);
      },
      error: (err) => {
        console.error('Failed to create medicine', err);
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
