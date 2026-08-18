import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ApiClientService } from '../../core/api/api-client.service';
import {
  Complain,
  Suggestion,
  Treatment,
  Prescription,
  Payment,
  FinancePaymentMethodFilter,
  FinanceRow,
  PaymentMethod,
  SuggestionStatus,
  PaginatedResponseWrapper,
  CreateComplainRequest,
  UpdateComplainRequest,
  CreateSuggestionRequest,
  UpdateSuggestionRequest,
  CreateTreatmentRequest,
  UpdateTreatmentRequest,
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
  CreatePaymentRequest,
  UpdatePaymentRequest
} from './patient-records.model';
import { ComplainCategoryService, ComplainCategoryResponse } from '../complains/complain-category.service';
import { TreatmentCategoryService, TreatmentCategoryResponse } from '../treatments/treatment-category.service';
import { MedicineLibraryService } from '../../shared/services/medicine-library.service';
import { DrugDosageService, DrugDosageResponse } from '../prescriptions/drug-dosage.service';
import { InstructionCatalogService, InstructionCatalogResponse } from '../prescriptions/instruction-catalog.service';
import {
  ComplainResponse,
  SuggestionResponse,
  TreatmentResponse,
  PrescriptionResponse,
  PaymentResponse as BackendPaymentResponse
} from '../../core/api/api.types';

@Injectable({
  providedIn: 'root'
})
export class PatientRecordsService {
  private api = inject(ApiClientService);
  private complainCategoryService = inject(ComplainCategoryService);
  private treatmentCategoryService = inject(TreatmentCategoryService);
  private medicineLibrary = inject(MedicineLibraryService);
  private dosageService = inject(DrugDosageService);
  private instructionCatalogService = inject(InstructionCatalogService);

  private complainCategories: ComplainCategoryResponse[] = [];
  private treatmentCategories: TreatmentCategoryResponse[] = [];
  private dosageCache: DrugDosageResponse[] = [];
  private instructionCache: InstructionCatalogResponse[] = [];

  constructor() {}

  private ensureCacheLoaded(): Observable<void> {
    if (this.complainCategories.length > 0 && this.treatmentCategories.length > 0 && this.dosageCache.length > 0 && this.instructionCache.length > 0) {
      return of(undefined);
    }
    return forkJoin({
      complain: this.complainCategoryService.getAllCategories(0, 1000).pipe(catchError(() => of({ data: { items: [] } } as any))),
      treatment: this.treatmentCategoryService.getAllCategories(0, 1000).pipe(catchError(() => of({ data: { items: [] } } as any))),
      dosage: this.dosageService.getAllDosages(0, 1000).pipe(catchError(() => of({ data: { items: [] } } as any))),
      instruction: this.instructionCatalogService.getAllInstructions(0, 1000).pipe(catchError(() => of({ data: { items: [] } } as any)))
    }).pipe(
      map(res => {
        this.complainCategories = res.complain.data?.items || [];
        this.treatmentCategories = res.treatment.data?.items || [];
        this.dosageCache = res.dosage.data?.items || [];
        this.instructionCache = res.instruction.data?.items || [];
      }),
      map(() => undefined)
    );
  }

  // --- Dynamic category lookups / creation ---

  private getOrCreateComplainCategoryId(name: string): Observable<number> {
    return this.ensureCacheLoaded().pipe(
      switchMap(() => {
        const existing = this.complainCategories.find(c => c.name.toLowerCase() === name.toLowerCase().trim());
        if (existing) return of(existing.id);

        return this.complainCategoryService.createCategory({ name }).pipe(
          map(res => {
            const cat = res.data;
            this.complainCategories.push(cat);
            return cat.id;
          })
        );
      })
    );
  }

  private getOrCreateTreatmentCategoryId(name: string): Observable<number> {
    return this.ensureCacheLoaded().pipe(
      switchMap(() => {
        const existing = this.treatmentCategories.find(c => c.name.toLowerCase() === name.toLowerCase().trim());
        if (existing) return of(existing.id);

        return this.treatmentCategoryService.createCategory({ name }).pipe(
          map(res => {
            const cat = res.data;
            this.treatmentCategories.push(cat);
            return cat.id;
          })
        );
      })
    );
  }

  private getOrCreateMedicineId(patientId: number, name: string): Observable<number> {
    const existing = this.medicineLibrary.findByName(name);
    if (existing && existing.id) return of(existing.id);

    return this.api.createMedicine({
      name,
      type: 'Tablet',
    }).pipe(
      map(res => {
        const m = res.data;
        const medId = m?.id || Date.now();
        this.medicineLibrary.addToLibrary({
          id: medId,
          name: m?.name || name,
          defaultDosages: ['1-0-1'],
          defaultInstructions: m?.instruction || 'As directed'
        });
        return medId;
      })
    );
  }

  private getOrCreateDosageId(dosage: string): Observable<number | undefined> {
    const trimmed = dosage.trim();
    if (!trimmed) return of(undefined);

    return this.ensureCacheLoaded().pipe(
      switchMap(() => {
        const existing = this.dosageCache.find(d => (d.dosage || '').toLowerCase() === trimmed.toLowerCase());
        if (existing) return of(existing.id);

        return this.dosageService.createDosage({ dosage: trimmed }).pipe(
          map(res => {
            const d = res.data;
            const created = { id: d.id, dosage: d.dosage || trimmed } as DrugDosageResponse;
            this.dosageCache.push(created);
            return d.id;
          }),
          catchError(() => of(undefined))
        );
      })
    );
  }

  private getOrCreateInstructionId(instruction: string): Observable<number | undefined> {
    const trimmed = instruction.trim();
    if (!trimmed) return of(undefined);

    return this.ensureCacheLoaded().pipe(
      switchMap(() => {
        const existing = this.instructionCache.find(i => (i.instruction || '').toLowerCase() === trimmed.toLowerCase());
        if (existing) return of(existing.id);

        return this.instructionCatalogService.createInstruction({ instruction: trimmed }).pipe(
          map(res => {
            const inst = res.data;
            const created = { id: inst.id, instruction: inst.instruction || trimmed } as InstructionCatalogResponse;
            this.instructionCache.push(created);
            return inst.id;
          }),
          catchError(() => of(undefined))
        );
      })
    );
  }

  // --- Mappers ---

  private mapComplainResponse(res: ComplainResponse): Complain {
    const cat = this.complainCategories.find(c => c.id === res.categoryId);
    return {
      id: res.id || 0,
      patientId: res.patientId || 0,
      date: res.date || '',
      type: cat ? cat.name : 'Unknown',
      details: res.details || '',
      createdAt: res.createdAt || '',
      updatedAt: res.updatedAt || ''
    };
  }

  private mapTreatmentResponse(res: TreatmentResponse): Treatment {
    const cat = this.treatmentCategories.find(c => c.id === res.categoryId);
    return {
      id: res.id || 0,
      patientId: res.patientId || 0,
      date: res.date || '',
      type: cat ? cat.name : 'Unknown',
      categoryDisplay: res.categoryDisplay || 'Unknown',
      details: res.details || '',
      createdAt: res.createdAt || '',
      updatedAt: res.updatedAt || ''
    };
  }

  private mapSuggestionResponse(res: SuggestionResponse): Suggestion {
    const cat = this.treatmentCategories.find(c => c.id === res.categoryId);
    return {
      id: res.id || 0,
      patientId: res.patientId || 0,
      date: res.date || '',
      type: cat ? cat.name : (res.categoryDisplay || 'Unknown'),
      details: res.details || '',
      cost: res.cost || 0,
      status: (res.status as SuggestionStatus) || 'SUGGESTED',
      createdAt: res.createdAt || '',
      updatedAt: res.updatedAt || ''
    };
  }

  private mapPrescriptionResponse(res: PrescriptionResponse): Prescription {
    const medicines = (res.medicines || []).map(m => {
      const med = this.medicineLibrary.getAll().find(entry => entry.id === m.medicineId);
      const dos = m.dosageId ? this.dosageCache.find(d => d.id === m.dosageId) : undefined;
      const inst = m.instructionId ? this.instructionCache.find(i => i.id === m.instructionId) : undefined;
      return {
        id: m.id,
        medicineId: m.medicineId,
        dosageId: m.dosageId,
        instructionId: m.instructionId,
        name: med ? med.name : 'Unknown Medicine',
        dosage: dos ? dos.dosage : '',
        instructions: inst ? inst.instruction : (med ? (med.defaultInstructions || '') : ''),
        quantity: m.quantity || 1
      };
    });

    return {
      id: res.id || 0,
      patientId: res.patientId || 0,
      date: res.date || '',
      details: res.details || '',
      medicines,
      createdAt: res.createdAt || '',
      updatedAt: res.updatedAt || ''
    };
  }

  private mapPaymentResponse(res: BackendPaymentResponse, patientId: number): Payment {
    return {
      id: res.id || 0,
      patientId: patientId,
      receiptId: (res as any).receiptNo || (res as any).receiptId,
      treatmentId: res.treatmentId,
      treatmentDetails: res.treatmentDetails || '',
      amount: res.amount || 0,
      method: (res.method as PaymentMethod) || 'CASH',
      referenceName: res.reference || '',
      date: (res as any).date || '',
      receivedDate: (res as any).receivedDate || '',
      createdAt: res.createdAt || '',
      updatedAt: res.updatedAt || ''
    };
  }

  // --- Complains Queries ---
  getComplainsByPatientId(
    patientId: number,
    pageNo: number = 1,
    pageSize: number = 5,
    query?: string
  ): Observable<PaginatedResponseWrapper<Complain>> {
    const pageIndex = Math.max(0, pageNo - 1);
    return this.ensureCacheLoaded().pipe(
      switchMap(() => this.api.getAllComplains(patientId, { pageNo: pageIndex, pageSize })),
      map(res => {
        const items = res.data || [];
        const meta = res.pagination;
        return {
          success: !!res.success,
          message: res.message || '',
          timestamp: res.timestamp || new Date().toISOString(),
          meta: { timestamp: res.timestamp || new Date().toISOString() },
          data: {
            items: items.map(item => this.mapComplainResponse(item)),
            pageNumber: meta?.page ?? pageIndex,
            pageSize: meta?.pageSize ?? pageSize,
            totalElements: meta?.totalElements ?? items.length,
            totalPages: meta?.totalPages ?? 1,
            isLast: meta?.hasNext === false
          }
        };
      })
    );
  }

  // --- Suggestions Queries ---
  getSuggestionsByPatientId(
    patientId: number,
    pageNo: number = 1,
    pageSize: number = 5,
    query?: string
  ): Observable<PaginatedResponseWrapper<Suggestion>> {
    const pageIndex = Math.max(0, pageNo - 1);
    return this.ensureCacheLoaded().pipe(
      switchMap(() => this.api.getAllSuggestions({ pageNo: pageIndex, pageSize }, { patientId })),
      map(res => {
        const items = res.data || [];
        const meta = res.pagination;
        return {
          success: !!res.success,
          message: res.message || '',
          timestamp: res.timestamp || new Date().toISOString(),
          meta: { timestamp: res.timestamp || new Date().toISOString() },
          data: {
            items: items.map(item => this.mapSuggestionResponse(item)),
            pageNumber: meta?.page ?? pageIndex,
            pageSize: meta?.pageSize ?? pageSize,
            totalElements: meta?.totalElements ?? items.length,
            totalPages: meta?.totalPages ?? 1,
            isLast: meta?.hasNext === false
          }
        };
      })
    );
  }

  // --- Treatments Queries ---
  getTreatmentsByPatientId(
    patientId: number,
    pageNo: number = 1,
    pageSize: number = 5,
    query?: string
  ): Observable<PaginatedResponseWrapper<Treatment>> {
    const pageIndex = Math.max(0, pageNo - 1);
    return this.ensureCacheLoaded().pipe(
      switchMap(() => this.api.getAllTreatments({ patientId }, { pageNo: pageIndex, pageSize })),
      map(res => {
        const items = res.data || [];
        const meta = res.pagination;
        return {
          success: !!res.success,
          message: res.message || '',
          timestamp: res.timestamp || new Date().toISOString(),
          meta: { timestamp: res.timestamp || new Date().toISOString() },
          data: {
            items: items.map(item => this.mapTreatmentResponse(item)),
            pageNumber: meta?.page ?? pageIndex,
            pageSize: meta?.pageSize ?? pageSize,
            totalElements: meta?.totalElements ?? items.length,
            totalPages: meta?.totalPages ?? 1,
            isLast: meta?.hasNext === false
          }
        };
      })
    );
  }

  // --- Prescriptions Queries ---
  getPrescriptionsByPatientId(
    patientId: number,
    pageNo: number = 1,
    pageSize: number = 5,
    query?: string
  ): Observable<PaginatedResponseWrapper<Prescription>> {
    const pageIndex = Math.max(0, pageNo - 1);
    return this.ensureCacheLoaded().pipe(
      switchMap(() => this.api.getAllPrescriptions(patientId, { pageNo: pageIndex, pageSize })),
      map(res => {
        const items = res.data || [];
        const meta = res.pagination;
        return {
          success: !!res.success,
          message: res.message || '',
          timestamp: res.timestamp || new Date().toISOString(),
          meta: { timestamp: res.timestamp || new Date().toISOString() },
          data: {
            items: items.map(item => this.mapPrescriptionResponse(item)),
            pageNumber: meta?.page ?? pageIndex,
            pageSize: meta?.pageSize ?? pageSize,
            totalElements: meta?.totalElements ?? items.length,
            totalPages: meta?.totalPages ?? 1,
            isLast: meta?.hasNext === false
          }
        };
      })
    );
  }

  // --- Payments Queries (Patient Detail Tab) ---
  getPaymentsByPatientId(
    patientId: number,
    pageNo: number = 1,
    pageSize: number = 5,
    query?: string
  ): Observable<PaginatedResponseWrapper<Payment>> {
    const pageIndex = Math.max(0, pageNo - 1);
    return this.api.getAllPayments(patientId, { pageNo: pageIndex, pageSize }).pipe(
      map(res => {
        const items = res.data || [];
        const meta = res.pagination;
        return {
          success: !!res.success,
          message: res.message || '',
          timestamp: res.timestamp || new Date().toISOString(),
          meta: { timestamp: res.timestamp || new Date().toISOString() },
          data: {
            items: items.map(item => this.mapPaymentResponse(item, patientId)),
            pageNumber: meta?.page ?? pageIndex,
            pageSize: meta?.pageSize ?? pageSize,
            totalElements: meta?.totalElements ?? items.length,
            totalPages: meta?.totalPages ?? 1,
            isLast: meta?.hasNext === false
          }
        };
      })
    );
  }

  // --- Complains Write Methods ---
  addComplain(request: CreateComplainRequest): Observable<Complain> {
    return this.getOrCreateComplainCategoryId(request.type).pipe(
      switchMap(categoryId => {
        return this.api.createComplain(request.patientId, {
          date: request.date,
          details: request.details,
          categoryId,
          patientId: request.patientId
        }).pipe(
          map(res => this.mapComplainResponse(res.data || {} as any))
        );
      })
    );
  }

  updateComplain(request: UpdateComplainRequest): Observable<Complain> {
    return this.getOrCreateComplainCategoryId(request.type).pipe(
      switchMap(categoryId => {
        return this.api.updateComplainById(request.patientId, request.id, {
          date: request.date,
          details: request.details,
          categoryId
        }).pipe(
          map(res => this.mapComplainResponse(res.data || {} as any))
        );
      })
    );
  }

  deleteComplain(patientId: number, id: number): Observable<void> {
    return this.api.deleteComplainById(patientId, id);
  }

  // --- Suggestions Write Methods ---
  addSuggestion(request: CreateSuggestionRequest): Observable<Suggestion> {
    return this.getOrCreateTreatmentCategoryId(request.type).pipe(
      switchMap(categoryId => {
        return this.api.createSuggestion(request.patientId, {
          date: request.date,
          categoryId,
          details: request.details,
          cost: request.cost,
          status: request.status,
          patientId: request.patientId
        }).pipe(
          map(res => this.mapSuggestionResponse(res.data || {} as any))
        );
      })
    );
  }

  updateSuggestion(request: UpdateSuggestionRequest): Observable<Suggestion> {
    return this.getOrCreateTreatmentCategoryId(request.type).pipe(
      switchMap(categoryId => {
        return this.api.updateSuggestionById(request.patientId, request.id, {
          date: request.date,
          categoryId,
          details: request.details,
          cost: request.cost,
          status: request.status
        }).pipe(
          map(res => this.mapSuggestionResponse(res.data || {} as any))
        );
      })
    );
  }

  deleteSuggestion(patientId: number, id: number): Observable<void> {
    return this.api.deleteSuggestionById(patientId, id);
  }

  // --- Treatments Write Methods ---
  addTreatment(request: CreateTreatmentRequest): Observable<Treatment> {
    return this.getOrCreateTreatmentCategoryId(request.type).pipe(
      switchMap(categoryId => {
        return this.api.createTreatment({
          date: request.date,
          details: request.details,
          categoryId,
          patientId: request.patientId
        }).pipe(
          map(res => this.mapTreatmentResponse(res.data || {} as any))
        );
      })
    );
  }

  updateTreatment(request: UpdateTreatmentRequest): Observable<Treatment> {
    return this.getOrCreateTreatmentCategoryId(request.type).pipe(
      switchMap(categoryId => {
        return this.api.updateTreatmentById(request.patientId, request.id, {
          date: request.date,
          details: request.details,
          categoryId
        }).pipe(
          map(res => this.mapTreatmentResponse(res.data || {} as any))
        );
      })
    );
  }

  deleteTreatment(patientId: number, id: number): Observable<void> {
    return this.api.deleteTreatmentById(patientId, id);
  }

  // --- Prescriptions Write Methods ---
  addPrescription(request: CreatePrescriptionRequest): Observable<Prescription> {
    const medObs = request.medicines.map(m => {
      const medId$ = m.medicineId ? of(m.medicineId) : this.getOrCreateMedicineId(request.patientId, m.name || '');
      const dosId$ = m.dosageId
        ? of(m.dosageId)
        : (m.dosage?.trim() ? this.getOrCreateDosageId(m.dosage) : of(undefined));
      const instId$ = m.instructionId
        ? of(m.instructionId)
        : (m.instructions?.trim() ? this.getOrCreateInstructionId(m.instructions) : of(undefined));

      return forkJoin({
        medId: medId$,
        dosId: dosId$,
        instId: instId$
      }).pipe(
        map(({ medId, dosId, instId }) => ({
          medicineId: medId,
          ...(dosId != null ? { dosageId: dosId } : {}),
          ...(instId != null ? { instructionId: instId } : {}),
          quantity: m.quantity
        }))
      );
    });

    return forkJoin(medObs).pipe(
      switchMap(mappedMedicines => {
        return this.api.createPrescription(request.patientId, {
          patientId: request.patientId,
          date: request.date,
          details: request.details,
          medicines: mappedMedicines
        }).pipe(
          map(res => this.mapPrescriptionResponse(res.data || {} as any))
        );
      })
    );
  }

  updatePrescription(request: UpdatePrescriptionRequest): Observable<Prescription> {
    const medObs = request.medicines.map(m => {
      const medId$ = m.medicineId ? of(m.medicineId) : this.getOrCreateMedicineId(request.patientId, m.name || '');
      const dosId$ = m.dosageId
        ? of(m.dosageId)
        : (m.dosage?.trim() ? this.getOrCreateDosageId(m.dosage) : of(undefined));
      const instId$ = m.instructionId
        ? of(m.instructionId)
        : (m.instructions?.trim() ? this.getOrCreateInstructionId(m.instructions) : of(undefined));

      return forkJoin({
        medId: medId$,
        dosId: dosId$,
        instId: instId$
      }).pipe(
        map(({ medId, dosId, instId }) => ({
          medicineId: medId,
          ...(dosId != null ? { dosageId: dosId } : {}),
          ...(instId != null ? { instructionId: instId } : {}),
          quantity: m.quantity
        }))
      );
    });

    return forkJoin(medObs).pipe(
      switchMap(mappedMedicines => {
        return this.api.updatePrescriptionById(request.patientId, request.id, {
          date: request.date,
          details: request.details,
          medicines: mappedMedicines
        }).pipe(
          map(res => this.mapPrescriptionResponse(res.data || {} as any))
        );
      })
    );
  }

  deletePrescription(patientId: number, id: number): Observable<void> {
    return this.api.deletePrescriptionById(patientId, id);
  }

  // --- Payments Write Methods ---
  addPayment(request: CreatePaymentRequest): Observable<Payment> {
    return this.api.createPayment(request.patientId, {
      treatmentId: (request as any).treatmentId || 0,
      amount: request.amount,
      method: request.method,
      reference: request.referenceName
    }).pipe(
      map(res => this.mapPaymentResponse(res.data || {} as any, request.patientId))
    );
  }

  updatePayment(request: UpdatePaymentRequest): Observable<Payment> {
    return this.api.updatePaymentById(request.patientId, request.id, {
      amount: request.amount,
      method: request.method,
      reference: request.referenceName,
      treatmentDetails: request.treatmentDetails || '',
      receivedDate: request.receivedDate || '',
    }).pipe(
      map(res => this.mapPaymentResponse(res.data || {} as any, request.patientId))
    );
  }

  deletePayment(patientId: number, id: number): Observable<void> {
    return this.api.deletePaymentById(patientId, id);
  }

  // --- Finances Page ---
  getFinances(
    pageNo: number = 1,
    pageSize: number = 10,
    startDate: string,
    endDate: string,
    doctorId: number,
    paymentMethod?: FinancePaymentMethodFilter
  ): Observable<PaginatedResponseWrapper<FinanceRow>> {
    const pageIndex = Math.max(0, pageNo - 1);
    const queryParams: {
      startDate: string;
      endDate: string;
      doctorId: number;
      paymentMethod?: string;
      pageNo: number;
      pageSize: number;
    } = {
      startDate,
      endDate,
      doctorId,
      pageNo: pageIndex,
      pageSize,
    };
    if (paymentMethod) {
      queryParams.paymentMethod = paymentMethod === 'ALL' ? 'all' : paymentMethod;
    }

    return this.api.getFinances(queryParams).pipe(
      map(res => {
        const items = res.data || [];
        const meta = res.pagination;
        return {
          success: !!res.success,
          message: res.message || '',
          timestamp: res.timestamp || new Date().toISOString(),
          meta: { timestamp: res.timestamp || new Date().toISOString() },
          data: {
            items: items.map(item => ({
              id: item.id ?? 0,
              patientId: item.patientId ?? 0,
              caseNo: item.caseNo || '',
              date: item.date || '',
              patientName: item.patientName || '',
              treatmentDetails: item.treatmentDetails || '',
              amount: item.amount ?? 0,
              method: item.method || '',
              receivedDate: item.receivedDate || '',
              receiptNo: item.receiptNo || '',
            })),
            pageNumber: meta?.page ?? pageIndex,
            pageSize: meta?.pageSize ?? pageSize,
            totalElements: meta?.totalElements ?? items.length,
            totalPages: meta?.totalPages ?? 1,
            isLast: meta?.hasNext === false
          }
        };
      })
    );
  }
}
