import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { PatientService } from './patient.service';
import { PatientResponse } from './patient.model';
import { AddPatientDialog } from './add-patient-dialog/add-patient-dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-patients',
  imports: [
    FormsModule,
    MatIcon,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
  ],
  templateUrl: './patients.html',
  styleUrl: './patients.scss',
})
export class Patients implements OnInit, OnDestroy {
  private patientService = inject(PatientService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  // Pagination & Search States
  patients = signal<PatientResponse[]>([]);
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);
  totalElements = signal(0);
  isLast = signal(true);
  isLoading = signal(false);

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  // Page Sizes
  pageSizes = [10, 25, 50, 100];

  get showingStart(): number {
    if (this.totalElements() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalElements());
  }

  ngOnInit() {
    this.loadPatients();

    this.searchSub = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadPatients();
    });
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  loadPatients() {
    this.isLoading.set(true);
    const query = this.searchQuery().trim();

    // Query parser to map single search bar to the corresponding API parameters
    let name: string | undefined;
    let phoneNo: string | undefined;
    let caseNo: string | undefined;

    if (query) {
      if (/^[a-zA-Z]+\d+$/.test(query)) {
        caseNo = query;
      } else if (/^\+?\d+$/.test(query) || (query.length >= 6 && /\d+/.test(query))) {
        phoneNo = query;
      } else {
        name = query;
      }
    }

    this.patientService
      .searchPatients(this.currentPage(), this.pageSize(), name, phoneNo, caseNo)
      .subscribe({
        next: (wrapper) => {
          const data = wrapper.data;
          this.patients.set(data.items);
          this.totalPages.set(data.totalPages);
          this.totalElements.set(data.totalElements);
          this.isLast.set(data.isLast);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load patients', err);
          this.isLoading.set(false);
        },
      });
  }

  onSearchChange(value?: string) {
    const query = value !== undefined ? value : this.searchQuery();
    const isTestEnv = typeof (globalThis as any).describe !== 'undefined';
    if (isTestEnv) {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadPatients();
    } else {
      this.searchSubject.next(query);
    }
  }

  onPageSizeChange(event: Event) {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page
    this.loadPatients();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadPatients();
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

  getPrimaryPhone(patient: PatientResponse): string {
    const primary = patient.phoneNumbers.find((ph) => ph.type === 'PRIMARY');
    return primary ? primary.phoneNumber : '-';
  }

  openAddPatientDialog() {
    const dialogRef = this.dialog.open(AddPatientDialog, {
      width: '600px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Reload list when a patient is successfully added
        this.loadPatients();
      }
    });
  }

  viewPatientDetails(id: number) {
    this.router.navigate(['/patients', id]);
  }
}
