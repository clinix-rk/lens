import { Component, inject, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { PatientRecordsService } from '../../patients/patient-records.service';
import { Payment, PaymentMethod } from '../../patients/patient-records.model';

export interface PaymentDialogData {
  patientId: number;
  payment?: Payment;
}

@Component({
  selector: 'app-record-dialog-payment',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatPrefix,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
  ],
  templateUrl: './record-dialog.html',
  styleUrl: './record-dialog.scss',
})
export class RecordDialogPayment implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RecordDialogPayment>);
  private data = inject<PaymentDialogData>(MAT_DIALOG_DATA);
  private recordsService = inject(PatientRecordsService);

  paymentForm!: FormGroup;
  isEditMode = false;

  methods: PaymentMethod[] = ['CASH', 'ONLINE', 'CHEQUE'];

  ngOnInit() {
    this.isEditMode = !!this.data.payment;

    const payment = this.data.payment;
    this.paymentForm = this.fb.group({
      amount: [
        payment?.amount !== undefined ? payment.amount : '',
        [Validators.required, Validators.min(0.01)],
      ],
      method: [payment?.method || 'CASH', [Validators.required]],
      referenceName: [
        payment?.referenceName || '',
        [Validators.maxLength(100)],
      ],
    });
  }

  onSubmit() {
    if (this.paymentForm.invalid) return;

    const formVal = this.paymentForm.value;

    if (this.isEditMode && this.data.payment) {
      this.recordsService
        .updatePayment({
          id: this.data.payment.id,
          patientId: this.data.patientId,
          date: this.data.payment.date,
          amount: formVal.amount,
          method: formVal.method,
          referenceName: formVal.referenceName,
          receiptId: this.data.payment.receiptId,
          treatmentId: this.data.payment.treatmentId,
        } as any)
        .subscribe((result) => {
          this.dialogRef.close(result);
        });
    } else {
      this.recordsService
        .addPayment({
          patientId: this.data.patientId,
          date: new Date().toISOString().split('T')[0],
          amount: formVal.amount,
          method: formVal.method,
          referenceName: formVal.referenceName,
        } as any)
        .subscribe((result) => {
          this.dialogRef.close(result);
        });
    }
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
    this.dialogRef.close(null);
  }
}
