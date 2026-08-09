import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../core/api/api-client.service';
import {
  DoctorResponse,
  DoctorResponseWrapper,
  PaginatedDoctorResponseWrapper,
  CreateDoctorRequest,
  UpdateDoctorRequest
} from './doctor.model';

export type Doctor = DoctorResponse;

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private api = inject(ApiClientService);

  /**
   * Get all doctors (unpaginated) for dropdowns and selectors.
   * Fetches the first 1000 doctors.
   */
  getDoctors(): Observable<DoctorResponse[]> {
    return this.api.getDoctors({ pageNo: 0, pageSize: 1000 }).pipe(
      map(response => (response.data || []) as DoctorResponse[])
    );
  }

  /**
   * Search / Get doctors (Paginated)
   * Integrates backend name search API if a query is provided.
   */
  searchDoctors(
    pageNo: number = 1,
    pageSize: number = 10,
    query?: string
  ): Observable<PaginatedDoctorResponseWrapper> {
    if (query) {
      return this.api.searchDoctors(query).pipe(
        map(response => {
          const items = (response.data || []) as DoctorResponse[];
          return {
            success: !!response.success,
            message: response.message || '',
            timestamp: response.timestamp,
            data: {
              items: items.slice((pageNo - 1) * pageSize, pageNo * pageSize),
              pageNumber: pageNo - 1,
              pageSize: pageSize,
              totalElements: items.length,
              totalPages: Math.ceil(items.length / pageSize),
              isLast: pageNo * pageSize >= items.length
            }
          };
        })
      );
    }
    const pageIndex = Math.max(0, pageNo - 1);
    return this.api.getDoctors({ pageNo: pageIndex, pageSize }).pipe(
      map(response => {
        const items = (response.data || []) as DoctorResponse[];
        const meta = response.pagination;
        return {
          success: !!response.success,
          message: response.message || '',
          timestamp: response.timestamp,
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
   * Get doctor by ID
   */
  getDoctorById(id: number): Observable<DoctorResponseWrapper> {
    return this.api.getDoctorById(id).pipe(
      map(res => ({
        success: !!res.success,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as DoctorResponse
      }))
    );
  }

  /**
   * Add a new doctor profile
   */
  addDoctor(req: CreateDoctorRequest): Observable<DoctorResponseWrapper> {
    return this.api.addDoctor(req).pipe(
      map(res => ({
        success: !!res.success,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as DoctorResponse
      }))
    );
  }

  /**
   * Update an existing doctor profile
   */
  updateDoctorById(id: number, req: UpdateDoctorRequest): Observable<DoctorResponseWrapper> {
    return this.api.updateDoctorById(id, req).pipe(
      map(res => ({
        success: !!res.success,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as DoctorResponse
      }))
    );
  }
}
