import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';

export type PrescriptionPdfReferralType = 'none' | 'standard' | 'extended';

export interface PrescriptionPrintDetailsResult {
  referralType: PrescriptionPdfReferralType;
  doctorName?: string;
  treatmentDetail?: string;
}

@Component({
  selector: 'app-print-details-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatCheckbox,
  ],
  templateUrl: './print-details-dialog.html',
  styleUrl: './print-details-dialog.scss',
})
export class PrintDetailsDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PrintDetailsDialog, PrescriptionPrintDetailsResult | null>);

  readonly form = this.fb.nonNullable.group({
    doctorName: [''],
    treatmentDetail: ['', Validators.required],
    extendedVersion: [false],
  });

  onGenerate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { doctorName, treatmentDetail, extendedVersion } = this.form.getRawValue();
    this.dialogRef.close({
      referralType: extendedVersion ? 'extended' : 'standard',
      doctorName: doctorName.trim(),
      treatmentDetail: treatmentDetail.trim(),
    });
  }

  onProceedWithoutDetails(): void {
    this.dialogRef.close({ referralType: 'none' });
  }
}
