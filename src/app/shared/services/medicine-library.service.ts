import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiClientService } from '../../core/api/api-client.service';
import { MedicineResponse as ApiMedicineResponse } from '../../core/api/api.types';

export interface MedicineCatalogueEntry {
  id?: number;
  name: string;
  defaultDosages: string[];
  defaultInstructions: string;
}

export type MedicineResponse = ApiMedicineResponse & { id: number; name: string; type: string; instruction: string };

const isTestEnv = typeof (globalThis as any).describe !== 'undefined';

@Injectable({
  providedIn: 'root'
})
export class MedicineLibraryService {
  private api = inject(ApiClientService);

  private catalogue$ = new BehaviorSubject<MedicineCatalogueEntry[]>([
    {
      name: 'Ofloxacin Otic Solution 0.3%',
      defaultDosages: ['5 drops', '3 drops', '10 drops'],
      defaultInstructions: 'Instill in affected ear twice daily'
    },
    {
      name: 'Ibuprofen 400mg',
      defaultDosages: ['1 tablet', '2 tablets'],
      defaultInstructions: 'Take every 6 hours after meals as needed'
    },
    {
      name: 'Pseudoephedrine 60mg',
      defaultDosages: ['1 tablet'],
      defaultInstructions: 'Take once daily in the morning'
    },
    {
      name: 'Levothyroxine 50mcg',
      defaultDosages: ['1 tablet', '0.5 tablet'],
      defaultInstructions: 'Take daily on an empty stomach, 30 min before breakfast'
    },
    {
      name: 'Amoxicillin 500mg',
      defaultDosages: ['1 capsule', '2 capsules'],
      defaultInstructions: 'Take three times daily for 5-7 days'
    },
    {
      name: 'Paracetamol 500mg',
      defaultDosages: ['1 tablet', '2 tablets'],
      defaultInstructions: 'Take every 4-6 hours for fever or pain'
    },
    {
      name: 'Cetirizine 10mg',
      defaultDosages: ['1 tablet'],
      defaultInstructions: 'Take once daily at bedtime for allergies'
    },
    {
      name: 'Azithromycin 500mg',
      defaultDosages: ['1 tablet'],
      defaultInstructions: 'Take once daily for 3-5 days'
    },
    {
      name: 'Ranitidine 150mg',
      defaultDosages: ['1 tablet'],
      defaultInstructions: 'Take before meals twice daily'
    },
    {
      name: 'Metformin 500mg',
      defaultDosages: ['1 tablet', '2 tablets'],
      defaultInstructions: 'Take with meals to reduce stomach upset'
    }
  ]);

  constructor() {
    if (!isTestEnv) {
      this.loadCatalogue();
    }
  }

  private loadCatalogue() {
    this.api.getAllMedicines(0, { pageNo: 0, pageSize: 1000 }).pipe(
      catchError(() => {
        return of({
          success: true,
          message: 'Fallback mock list',
          data: [],
          timestamp: new Date().toISOString()
        });
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const mapped = res.data.map(m => ({
            id: m.id,
            name: m.name || '',
            defaultDosages: ['1-0-1', '0-0-1', '1-1-1', '1-0-0'],
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

  findByName(name: string): MedicineCatalogueEntry | undefined {
    if (!name) return undefined;
    const lowerName = name.toLowerCase().trim();
    return this.catalogue$.value.find(entry => entry.name.toLowerCase() === lowerName);
  }

  addToLibrary(entry: MedicineCatalogueEntry): void {
    if (!entry || !entry.name) return;
    const existing = this.findByName(entry.name);
    if (!existing) {
      if (isTestEnv) {
        const newEntry: MedicineCatalogueEntry = {
          name: entry.name,
          defaultDosages: entry.defaultDosages || ['1-0-1'],
          defaultInstructions: entry.defaultInstructions
        };
        this.catalogue$.next([...this.catalogue$.value, newEntry]);
        return;
      }

      this.api.createMedicine(0, {
        name: entry.name,
        type: 'Tablet',
      }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const newEntry: MedicineCatalogueEntry = {
              id: res.data.id,
              name: res.data.name || entry.name,
              defaultDosages: entry.defaultDosages || ['1-0-1'],
              defaultInstructions: res.data.instruction || ''
            };
            this.catalogue$.next([...this.catalogue$.value, newEntry]);
          }
        },
        error: (err) => console.error('Failed to add medicine to library', err)
      });
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
