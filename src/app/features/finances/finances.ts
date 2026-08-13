import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PatientRecordsService } from '../patients/patient-records.service';
import { EnrichedPayment, PaymentMethod } from '../patients/patient-records.model';
import { RecordDialogPayment } from '../payments/record-dialog/record-dialog';
import { PdfService } from '../../core/services/pdf.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIcon,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatDatepickerModule
  ],
  templateUrl: './finances.html',
  styleUrl: './finances.scss',
})
export class Finances implements OnInit {
  private recordsService = inject(PatientRecordsService);
  private dialog = inject(MatDialog);
  private pdfService = inject(PdfService);
  private confirmationService = inject(ConfirmationService);

  // States
  payments = signal<EnrichedPayment[]>([]);
  searchQuery = signal<string>('');
  selectedMethod = signal<PaymentMethod | 'ALL'>('ALL');
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  today = new Date();

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(1);
  totalElements = signal<number>(0);
  isLast = signal<boolean>(true);
  isLoading = signal<boolean>(false);

  pageSizes = [10, 25, 50, 100];
  methods: (PaymentMethod | 'ALL')[] = ['ALL', 'CASH', 'ONLINE', 'CHEQUE'];

  get showingStart(): number {
    if (this.totalElements() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalElements());
  }

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading.set(true);
    this.recordsService.getAllPayments(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery().trim(),
      this.selectedMethod(),
      this.formatDate(this.startDate()) || undefined,
      this.formatDate(this.endDate()) || undefined
    ).subscribe({
      next: (wrapper) => {
        const data = wrapper.data;
        this.payments.set(data.items);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        this.isLast.set(data.isLast);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load finances data', err);
        this.isLoading.set(false);
      }
    });
  }

  formatDate(date: Date | { toDate?: () => Date } | null | undefined): string {
    if (!date) return '';
    // Moment adapter returns Moment objects; normalize to Date for API payloads.
    const d = date instanceof Date ? date : date.toDate?.() ?? new Date(date as Date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedMethod.set('ALL');
    this.startDate.set(null);
    this.endDate.set(null);
    this.onFilterChange();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadPayments();
  }

  onPageSizeChange(event: Event) {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadPayments();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadPayments();
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  goToLastPage() {
    this.goToPage(this.totalPages());
  }

  goToNextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  goToPreviousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  onEdit(payment: EnrichedPayment) {
    const dialogRef = this.dialog.open(RecordDialogPayment, {
      width: '480px',
      data: { patientId: payment.patientId, payment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPayments();
      }
    });
  }

  onDelete(payment: EnrichedPayment) {
    this.confirmationService.confirm(
      `Delete this payment receipt (#${payment.id}) for ${payment.patientName}? This cannot be undone.`,
      'Delete Payment Receipt',
      true
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.recordsService.deletePayment(payment.patientId, payment.id).subscribe(() => {
          this.loadPayments();
        });
      }
    });
  }

  onPrint(payment: EnrichedPayment) {
    if (payment.receiptId) {
      this.pdfService.openReceiptPdf(payment.receiptId);
    } else {
      console.warn('No receipt ID associated with this payment:', payment);
      alert('Cannot print receipt: No receipt ID associated with this transaction.');
    }
  }

  onExportForm3C() {
    const start = this.startDate()
      ? this.formatDate(this.startDate())
      : this.formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const end = this.endDate()
      ? this.formatDate(this.endDate())
      : this.formatDate(new Date());

    this.pdfService.downloadForm3C(start, end);
  }
}
