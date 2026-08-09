import { Component, inject, signal, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { DoctorService } from '../doctor.service';
import { DoctorResponse } from '../doctor.model';

@Component({
  selector: 'app-doctor-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatButton,
  ],
  templateUrl: './doctor-dialog.html',
  styleUrl: './doctor-dialog.scss',
})
export class DoctorDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DoctorDialog>);
  private doctorService = inject(DoctorService);

  // Inject data from calling component
  public data = inject<{ doctor?: DoctorResponse }>(MAT_DIALOG_DATA, { optional: true });

  isEditMode = signal(false);
  doctorForm!: FormGroup;

  ngOnInit() {
    const editDoc = this.data?.doctor;
    this.isEditMode.set(!!editDoc);

    this.doctorForm = this.fb.group({
      name: [
        editDoc?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      ],
      caseNoPrefix: [
        { value: editDoc?.caseNoPrefix || '', disabled: !!editDoc },
        editDoc ? [] : [Validators.required, Validators.maxLength(5)],
      ],
    });
  }

  onSubmit() {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    const val = this.doctorForm.getRawValue();

    if (this.isEditMode() && this.data?.doctor) {
      this.doctorService.updateDoctorById(this.data.doctor.id, { name: val.name }).subscribe({
        next: (response) => {
          this.dialogRef.close(response.data);
        },
        error: (err) => {
          console.error('Failed to update doctor', err);
        },
      });
    } else {
      this.doctorService
        .addDoctor({
          name: val.name,
          caseNoPrefix: val.caseNoPrefix,
        })
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response.data);
          },
          error: (err) => {
            console.error('Failed to add doctor', err);
          },
        });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
