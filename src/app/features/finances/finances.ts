import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { PatientRecordsService } from '../patients/patient-records.service';
import { FinancePaymentMethodFilter, FinanceRow, Payment, PaymentMethod } from '../patients/patient-records.model';
import { DoctorService, Doctor } from '../doctors/doctor.service';
import { PdfService } from '../../core/services/pdf.service';
import { RecordDialogPayment } from '../payments/record-dialog/record-dialog';

@Component({
  selector: 'app-finances',
  imports: [
    CommonModule,
    FormsModule,
    MatIcon,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatSelect,
    MatOption,
    MatDatepickerModule
  ],
  templateUrl: './finances.html',
  styleUrl: './finances.scss',
})
export class Finances implements OnInit {
  private recordsService = inject(PatientRecordsService);
  private doctorService = inject(DoctorService);
  private pdfService = inject(PdfService);
  private dialog = inject(MatDialog);

  rows = signal<FinanceRow[]>([]);
  doctors = signal<Doctor[]>([]);
  selectedDoctorId = signal<number | null>(null);
  selectedMethod = signal<FinancePaymentMethodFilter>('ALL');
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
  methods: FinancePaymentMethodFilter[] = ['ALL', 'CASH', 'ONLINE', 'CHEQUE'];

  get showingStart(): number {
    if (this.totalElements() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalElements());
  }

  ngOnInit() {
    this.doctorService.getDoctors().subscribe({
      next: (list) => this.doctors.set(list),
      error: (err) => console.error('Failed to load doctors', err),
    });
  }

  canLoadFilters(): boolean {
    return this.selectedDoctorId() != null && !!this.startDate() && !!this.endDate();
  }

  loadFinances() {
    if (!this.canLoadFilters()) {
      this.rows.set([]);
      this.totalPages.set(1);
      this.totalElements.set(0);
      this.isLast.set(true);
      this.isLoading.set(false);
      return;
    }

    const doctorId = this.selectedDoctorId()!;
    const start = this.formatDate(this.startDate());
    const end = this.formatDate(this.endDate());
    if (!start || !end) {
      return;
    }

    this.isLoading.set(true);
    this.recordsService.getFinances(
      this.currentPage(),
      this.pageSize(),
      start,
      end,
      doctorId,
      this.selectedMethod()
    ).subscribe({
      next: (wrapper) => {
        const data = wrapper.data;
        this.rows.set(data.items);
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
    this.selectedDoctorId.set(null);
    this.selectedMethod.set('ALL');
    this.startDate.set(null);
    this.endDate.set(null);
    this.currentPage.set(1);
    this.rows.set([]);
    this.totalPages.set(1);
    this.totalElements.set(0);
    this.isLast.set(true);
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadFinances();
  }

  onPageSizeChange(event: Event) {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadFinances();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadFinances();
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

  trackRow(index: number, row: FinanceRow): string {
    return `${row.id}|${row.receiptNo}|${row.caseNo}|${index}`;
  }

  onEdit(row: FinanceRow) {
    if (!row.id || !row.patientId) {
      console.warn('Cannot edit payment: missing id or patientId on finance row', row);
      return;
    }

    const payment: Payment = {
      id: row.id,
      patientId: row.patientId,
      amount: row.amount,
      method: (row.method as PaymentMethod) || 'CASH',
      referenceName: '',
      date: row.date,
      treatmentDetails: row.treatmentDetails,
      receivedDate: row.receivedDate,
      createdAt: '',
      updatedAt: '',
    };

    const dialogRef = this.dialog.open(RecordDialogPayment, {
      width: '480px',
      data: { patientId: row.patientId, payment },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadFinances();
      }
    });
  }

  onGenerateForm25() {
    const params = this.getFinanceFormParams();
    if (!params) {
      return;
    }
    this.pdfService.openFinanceForm25Pdf(params);
  }

  onGenerateSummary() {
    const params = this.getFinanceFormParams();
    if (!params) {
      return;
    }
    this.pdfService.openFinanceForm25SummaryPdf(params);
  }

  private getFinanceFormParams(): {
    startDate: string;
    endDate: string;
    doctorId: number;
    paymentMethod: string;
  } | null {
    if (!this.canLoadFilters()) {
      return null;
    }

    const startDate = this.formatDate(this.startDate());
    const endDate = this.formatDate(this.endDate());
    if (!startDate || !endDate) {
      return null;
    }

    return {
      startDate,
      endDate,
      doctorId: this.selectedDoctorId()!,
      paymentMethod: this.selectedMethod(),
    };
  }
}
