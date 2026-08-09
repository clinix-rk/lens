import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../core/api/api-client.service';
import { ApiResponse, PaginatedPayload } from '../../core/models/api.model';
import {
  DrugDosageResponse as ApiDrugDosageResponse,
  CreateDrugDosageRequest as ApiCreateDrugDosageRequest
} from '../../core/api/api.types';

export type DrugDosageResponse = ApiDrugDosageResponse & { id: number; dosage: string };
export type CreateDrugDosageRequest = ApiCreateDrugDosageRequest;

@Injectable({
  providedIn: 'root'
})
export class DrugDosageService {
  private api = inject(ApiClientService);

  getAllDosages(pageNo: number = 0, pageSize: number = 1000): Observable<ApiResponse<PaginatedPayload<DrugDosageResponse>>> {
    return this.api.getAllDrugDosages({ pageNo, pageSize }).pipe(
      map(res => {
        const items = (res.data || []) as DrugDosageResponse[];
        const meta = res.pagination;
        return {
          success: !!res.success,
          statusCode: res.statusCode,
          message: res.message || '',
          timestamp: res.timestamp,
          data: {
            items,
            pageNumber: meta?.page ?? pageNo,
            pageSize: meta?.pageSize ?? pageSize,
            totalElements: meta?.totalElements ?? items.length,
            totalPages: meta?.totalPages ?? 1,
            isLast: meta?.hasNext === false
          }
        };
      })
    );
  }

  getDosageById(id: number): Observable<ApiResponse<DrugDosageResponse>> {
    return this.api.getDrugDosageById(id).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as DrugDosageResponse
      }))
    );
  }

  createDosage(req: CreateDrugDosageRequest): Observable<ApiResponse<DrugDosageResponse>> {
    return this.api.createDrugDosage(req).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as DrugDosageResponse
      }))
    );
  }

  updateDosageById(id: number, req: CreateDrugDosageRequest): Observable<ApiResponse<DrugDosageResponse>> {
    return this.api.updateDrugDosageById(id, req).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as DrugDosageResponse
      }))
    );
  }

  deleteDosageById(id: number): Observable<void> {
    return this.api.deleteDrugDosageById(id);
  }
}
