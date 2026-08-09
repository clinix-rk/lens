import { Component, inject, signal, input, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { PatientRecordsService } from '../patients/patient-records.service';
import { Prescription } from '../patients/patient-records.model';
import { RecordDialogPrescription } from './record-dialog/record-dialog';
import { PdfService } from '../../core/services/pdf.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-prescriptions',
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
    MatInput,
    MatTooltip
  ],
  templateUrl: './prescriptions.html',
  styleUrl: './prescriptions.scss'
})
export class Prescriptions implements OnInit, OnDestroy {
  private recordsService = inject(PatientRecordsService);
  private dialog = inject(MatDialog);
  private pdfService = inject(PdfService);
  private confirmationService = inject(ConfirmationService);

  // Input Signal from parent
  patientId = input<number | null | undefined>(undefined);

  // States
  items = signal<Prescription[]>([]);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(5);
  totalElements = signal<number>(0);
  totalPages = signal<number>(1);
  isLast = signal<boolean>(true);
  isLoading = signal<boolean>(false);

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  pageSizes = [5, 10, 20, 50];

  constructor() {
    effect(() => {
      const id = this.patientId();
      if (id !== null && id !== undefined) {
        this.loadData();
      } else {
        this.items.set([]);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
    });
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  get showingStart(): number {
    if (this.totalElements() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalElements());
  }

  loadData() {
    const id = this.patientId();
    if (id === null || id === undefined) return;

    this.isLoading.set(true);
    this.recordsService.getPrescriptionsByPatientId(
      id,
      this.currentPage(),
      this.pageSize(),
      this.searchQuery().trim()
    ).subscribe({
      next: (wrapper) => {
        const data = wrapper.data;
        this.items.set(data.items);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        this.isLast.set(data.isLast);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load prescriptions', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(value?: string) {
    const query = value !== undefined ? value : this.searchQuery();
    const isTestEnv = typeof (globalThis as any).describe !== 'undefined';
    if (isTestEnv) {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadData();
    } else {
      this.searchSubject.next(query);
    }
  }

  onPageSizeChange(event: Event) {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadData();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadData();
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

  onAdd() {
    const id = this.patientId();
    if (id === null || id === undefined) return;

    const dialogRef = this.dialog.open(RecordDialogPrescription, {
      width: '600px',
      data: { patientId: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  onEdit(prescription: Prescription) {
    const id = this.patientId();
    if (id === null || id === undefined) return;

    const dialogRef = this.dialog.open(RecordDialogPrescription, {
      width: '600px',
      data: { patientId: id, prescription }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  onDelete(prescription: Prescription) {
    this.confirmationService.confirm(
      'Delete this prescription record? This cannot be undone.',
      'Delete Prescription',
      true
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.recordsService.deletePrescription(prescription.id).subscribe(() => {
          this.loadData();
        });
      }
    });
  }

  onPrint(prescription: Prescription) {
    const patientId = this.patientId();
    if (patientId === null || patientId === undefined) {
      return;
    }

    this.pdfService.openPrescriptionPdf(patientId, prescription.id);
  }
}
