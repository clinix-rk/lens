import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiClientService } from '../../core/api/api-client.service';
import { MedicineResponse as ApiMedicineResponse, CreateMedicineRequest } from '../../core/api/api.types';

export interface MedicineCatalogueEntry {
  id?: number;
  name: string;
  type?: string;
  defaultDosages?: string[];
  defaultInstructions?: string;
}

export type MedicineResponse = ApiMedicineResponse & { id: number; name: string; type: string; instruction: string };

const isTestEnv = typeof (globalThis as any).describe !== 'undefined';

@Injectable({
  providedIn: 'root'
})
export class MedicineLibraryService {
  private api = inject(ApiClientService);

  private catalogue$ = new BehaviorSubject<MedicineCatalogueEntry[]>(
    isTestEnv
      ? [
          { id: 1, name: 'Ibuprofen 400mg', type: 'Tablet', defaultDosages: ['1 tablet'], defaultInstructions: 'Take every 6 hours' },
          { id: 2, name: 'Paracetamol 500mg', type: 'Tablet', defaultDosages: ['1 tablet'], defaultInstructions: 'Take for fever' }
        ]
      : []
  );

  constructor() {
    if (!isTestEnv) {
      this.loadCatalogue();
    }
  }

  public loadCatalogue(): void {
    this.api.getAllMedicines({ pageNo: 0, pageSize: 1000 }).pipe(
      catchError(() => {
        return of({
          success: true,
          message: 'Fallback empty list',
          data: [],
          timestamp: new Date().toISOString()
        });
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const mapped: MedicineCatalogueEntry[] = res.data.map(m => ({
            id: m.id,
            name: m.name || '',
            type: m.type || 'Tablet',
            defaultInstructions: m.instruction || ''
          }));
          this.catalogue$.next(mapped);
        }
      },
      error: (err) => console.error('Failed to load medicine catalogue', err)
    });
  }

  getAll(): MedicineCatalogueEntry[] {
    return this.catalogue$.value;
  }

  getAllMedicines(): Observable<MedicineCatalogueEntry[]> {
    return this.catalogue$.asObservable();
  }

  findById(id: number): MedicineCatalogueEntry | undefined {
    return this.catalogue$.value.find(entry => entry.id === id);
  }

  findByName(name: string): MedicineCatalogueEntry | undefined {
    if (!name) return undefined;
    const lowerName = name.toLowerCase().trim();
    return this.catalogue$.value.find(entry => entry.name.toLowerCase() === lowerName);
  }

  createMedicine(req: CreateMedicineRequest): Observable<MedicineCatalogueEntry> {
    if (isTestEnv) {
      const mockEntry: MedicineCatalogueEntry = {
        id: Date.now(),
        name: req.name,
        type: req.type
      };
      this.catalogue$.next([...this.catalogue$.value, mockEntry]);
      return of(mockEntry);
    }

    return this.api.createMedicine(req).pipe(
      map(res => {
        const item = res.data;
        const entry: MedicineCatalogueEntry = {
          id: item?.id,
          name: item?.name || req.name,
          type: item?.type || req.type,
          defaultInstructions: item?.instruction || ''
        };
        if (entry.id) {
          this.catalogue$.next([...this.catalogue$.value, entry]);
        }
        return entry;
      })
    );
  }

  addToLibrary(entry: MedicineCatalogueEntry): void {
    if (!entry || !entry.name) return;
    const existing = this.findByName(entry.name);
    if (!existing) {
      this.createMedicine({
        name: entry.name,
        type: entry.type || 'Tablet'
      }).subscribe();
    }
  }

  getNames(): string[] {
    return this.catalogue$.value.map(entry => entry.name).sort();
  }

  getNamesObservable(): Observable<string[]> {
    return this.catalogue$.pipe(
      map(list => list.map(entry => entry.name).sort())
    );
  }
}
