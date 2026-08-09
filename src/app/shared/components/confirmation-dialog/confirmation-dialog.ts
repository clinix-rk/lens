import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss'
})
export class ConfirmationDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
  readonly data = inject<ConfirmationData>(MAT_DIALOG_DATA);

  get title(): string {
    return this.data.title || 'Confirm';
  }

  get message(): string {
    return this.data.message || 'Are you sure you want to proceed?';
  }

  get confirmText(): string {
    return this.data.confirmText || 'Confirm';
  }

  get cancelText(): string {
    return this.data.cancelText || 'Cancel';
  }

  get isDanger(): boolean {
    return this.data.isDanger || false;
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
