import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { PatientService } from '../../../features/patients/patient.service';

export interface PdfViewerData {
  pdfUrl: string;
  filename: string;
  isPatientPdf: boolean;
  fileId?: number;
}

@Component({
  selector: 'app-pdf-viewer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pdf-viewer-dialog.html',
  styleUrl: './pdf-viewer-dialog.scss'
})
export class PdfViewerDialogComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private confirmationService = inject(ConfirmationService);
  private patientService = inject(PatientService);
  private cd = inject(ChangeDetectorRef);
  readonly dialogRef = inject(MatDialogRef<PdfViewerDialogComponent>);
  readonly data = inject<PdfViewerData>(MAT_DIALOG_DATA);

  isLoading = true;
  errorMsg: string | null = null;
  safeUrl: SafeResourceUrl | null = null;
  
  private objectUrl: string | null = null;
  private blob: Blob | null = null;

  ngOnInit() {
    this.loadPdf();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private loadPdf() {
    console.log('[PdfViewer] loadPdf called, pdfUrl=', this.data?.pdfUrl);
    this.http.get(this.data.pdfUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        console.log('[PdfViewer] received blob, size=', blob?.size);
        this.blob = blob;
        this.objectUrl = URL.createObjectURL(blob);
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
        this.isLoading = false;
        // Force change detection to ensure iframe is added to DOM immediately
        try { this.cd.detectChanges(); } catch (e) { /* ignore */ }
      },
      error: (err) => {
        console.error('Failed to download PDF:', err);
        this.errorMsg = 'Failed to load PDF document. Please try again.';
        this.isLoading = false;
        try { this.cd.detectChanges(); } catch (e) { /* ignore */ }
      }
    });
  }

  private cleanup() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  onDownload() {
    if (!this.blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(this.blob);
    a.download = this.data.filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  onRemove() {
    if (!this.data.fileId) return;

    this.confirmationService.confirm(
      'Are you sure you want to remove this patient PDF? This cannot be undone.',
      'Remove PDF',
      true
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading = true;
        this.patientService.deletePatientFile(this.data.fileId!).subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close('deleted');
          },
          error: (err) => {
            console.error('Failed to delete patient PDF:', err);
            this.errorMsg = 'Failed to delete the PDF. Please try again.';
            this.isLoading = false;
          }
        });
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}
