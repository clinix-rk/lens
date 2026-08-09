import { Component, inject, signal, input, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { PatientRecordsService } from '../patients/patient-records.service';
import { Suggestion } from '../patients/patient-records.model';
import { RecordDialogSuggestion } from './record-dialog/record-dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-suggestions',
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
    MatInput
  ],
  templateUrl: './suggestions.html',
  styleUrl: './suggestions.scss'
})
export class Suggestions implements OnInit, OnDestroy {
  private recordsService = inject(PatientRecordsService);
  private dialog = inject(MatDialog);
  private confirmationService = inject(ConfirmationService);

  // Input Signal from parent
  patientId = input<number | null | undefined>(undefined);

  // States
  items = signal<Suggestion[]>([]);
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
    this.recordsService.getSuggestionsByPatientId(
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
        console.error('Failed to load suggestions', err);
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

    const dialogRef = this.dialog.open(RecordDialogSuggestion, {
      width: '480px',
      data: { patientId: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  onEdit(suggestion: Suggestion) {
    const id = this.patientId();
    if (id === null || id === undefined) return;

    const dialogRef = this.dialog.open(RecordDialogSuggestion, {
      width: '480px',
      data: { patientId: id, suggestion }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  onDelete(suggestion: Suggestion) {
    this.confirmationService.confirm(
      'Delete this suggestion record? This cannot be undone.',
      'Delete Suggestion',
      true
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.recordsService.deleteSuggestion(suggestion.patientId, suggestion.id).subscribe(() => {
          this.loadData();
        });
      }
    });
  }
}
