import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationData } from '../../shared/components/confirmation-dialog/confirmation-dialog';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private dialog = inject(MatDialog);

  /**
   * Opens a confirmation modal dialog.
   * @param message Message to display.
   * @param title Title of the dialog.
   * @param isDanger If true, styles the confirm button as a danger/delete action (Deep Red).
   * @returns Observable that emits true if confirmed, false if cancelled/closed.
   */
  confirm(message: string, title: string = 'Confirm Action', isDanger: boolean = false): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '440px',
      data: {
        title,
        message,
        confirmText: isDanger ? 'Delete' : 'Confirm',
        cancelText: 'Cancel',
        isDanger
      },
      disableClose: false
    });

    return new Observable<boolean>((subscriber) => {
      dialogRef.afterClosed().subscribe({
        next: (result) => {
          subscriber.next(!!result);
          subscriber.complete();
        },
        error: (err) => {
          subscriber.error(err);
        }
      });
    });
  }
}
