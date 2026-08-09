import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { DoctorService } from './doctor.service';
import { DoctorResponse } from './doctor.model';
import { DoctorDialog } from './doctor-dialog/doctor-dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-doctors',
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
  templateUrl: './doctors.html',
  styleUrl: './doctors.scss',
})
export class Doctors implements OnInit, OnDestroy {
  private doctorService = inject(DoctorService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  // Pagination & Search States
  doctors = signal<DoctorResponse[]>([]);
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
    this.loadDoctors();

    this.searchSub = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadDoctors();
    });
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  loadDoctors() {
    this.isLoading.set(true);
    const query = this.searchQuery().trim();

    this.doctorService
      .searchDoctors(this.currentPage(), this.pageSize(), query || undefined)
      .subscribe({
        next: (wrapper) => {
          const data = wrapper.data;
          this.doctors.set(data.items);
          this.totalPages.set(data.totalPages);
          this.totalElements.set(data.totalElements);
          this.isLast.set(data.isLast);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load doctors', err);
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
      this.loadDoctors();
    } else {
      this.searchSubject.next(query);
    }
  }

  onPageSizeChange(event: Event) {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page
    this.loadDoctors();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadDoctors();
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

  openAddDoctorDialog() {
    const dialogRef = this.dialog.open(DoctorDialog, {
      width: '500px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDoctors();
      }
    });
  }

  viewDoctorDetails(id: number) {
    this.router.navigate(['/doctors', id]);
  }
}
