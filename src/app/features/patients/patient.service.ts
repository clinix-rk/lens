import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../core/api/api-client.service';
import { 
  PatientResponse, 
  PatientResponseWrapper, 
  PaginatedPatientResponseWrapper, 
  CreatePatientRequest, 
  UpdatePatientRequest
} from './patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private api = inject(ApiClientService);

  /**
   * Search / Get patients (Paginated)
   */
  searchPatients(
    pageNo: number = 1,
    pageSize: number = 10,
    name?: string,
    phoneNo?: string,
    caseNo?: string
  ): Observable<PaginatedPatientResponseWrapper> {
    const pageIndex = Math.max(0, pageNo - 1);
    return this.api.searchPatients({
      pageNo: pageIndex,
      pageSize,
      name,
      phoneNo,
      caseNo
    }).pipe(
      map(res => {
        const items = (res.data || []) as PatientResponse[];
        const meta = res.pagination;
        return {
          success: !!res.success,
          message: res.message || '',
          timestamp: res.timestamp,
          data: {
            items,
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

  /**
   * Get patient by ID
   */
  getPatientById(id: number): Observable<PatientResponseWrapper> {
    return this.api.getPatientById(id).pipe(
      map(res => ({
        success: !!res.success,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as PatientResponse
      }))
    );
  }

  /**
   * Get patient by Case Number
   */
  getPatientByCaseNo(caseNo: string): Observable<PatientResponseWrapper> {
    return this.api.getPatientByCaseNo(caseNo).pipe(
      map(res => ({
        success: !!res.success,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as PatientResponse
      }))
    );
  }

  /**
   * Add a new patient
   */
  addPatient(req: CreatePatientRequest): Observable<PatientResponseWrapper> {
    return this.api.addPatient(req).pipe(
      map(res => ({
        success: !!res.success,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as PatientResponse
      }))
    );
  }

  /**
   * Update patient by ID
   */
  updatePatientById(id: number, req: UpdatePatientRequest): Observable<PatientResponseWrapper> {
    return this.api.updatePatientById(id, req).pipe(
      map(res => ({
        success: !!res.success,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as PatientResponse
      }))
    );
  }

  /**
   * Delete patient by ID
   */
  deletePatientById(id: number): Observable<void> {
    return this.api.deletePatientById(id);
  }

  /**
   * Get unique medical conditions across all patients
   */
  getAvailableMedicalConditions(): Observable<string[]> {
    return this.api.getAllMedicalConditions().pipe(
      map(res => res.data || [])
    );
  }

  /**
   * Get unique drug allergies across all patients
   */
  getAvailableDrugAllergies(): Observable<string[]> {
    return this.api.getAllDrugAllergies().pipe(
      map(res => res.data || [])
    );
  }

  /**
   * Get patient file metadata
   */
  getPatientFile(patientId: number): Observable<any> {
    return this.api.getFileByPatientId(patientId);
  }

  /**
   * Upload patient PDF
   */
  uploadPatientFile(patientId: number, file: File): Observable<any> {
    return this.api.uploadFile(patientId, file);
  }

  /**
   * Delete patient file by file ID
   */
  deletePatientFile(fileId: number): Observable<void> {
    return this.api.deleteFileById(fileId);
  }
}
