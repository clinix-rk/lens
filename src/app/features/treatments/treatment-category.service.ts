import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../core/api/api-client.service';
import { ApiResponse, PaginatedPayload } from '../../core/models/api.model';
import {
  TreatmentCategoryResponse as ApiTreatmentCategoryResponse,
  CreateTreatmentCategoryRequest as ApiCreateTreatmentCategoryRequest
} from '../../core/api/api.types';

export type TreatmentCategoryResponse = ApiTreatmentCategoryResponse & { id: number; name: string };
export type CreateTreatmentCategoryRequest = ApiCreateTreatmentCategoryRequest;

@Injectable({
  providedIn: 'root'
})
export class TreatmentCategoryService {
  private api = inject(ApiClientService);

  getAllCategories(pageNo: number = 0, pageSize: number = 1000): Observable<ApiResponse<PaginatedPayload<TreatmentCategoryResponse>>> {
    return this.api.getAllTreatmentCategories().pipe(
      map(res => {
        const items = (res.data || []) as TreatmentCategoryResponse[];
        return {
          success: !!res.success,
          statusCode: res.statusCode,
          message: res.message || '',
          timestamp: res.timestamp,
          data: {
            items,
            pageNumber: 0,
            pageSize: items.length || pageSize,
            totalElements: items.length,
            totalPages: 1,
            isLast: true
          }
        };
      })
    );
  }

  getCategoryById(id: number): Observable<ApiResponse<TreatmentCategoryResponse>> {
    return this.getAllCategories().pipe(
      map(res => {
        const found = res.data.items.find(cat => cat.id === id);
        return {
          success: !!found,
          statusCode: res.statusCode,
          message: res.message,
          timestamp: res.timestamp,
          data: found || { id, name: '' }
        };
      })
    );
  }

  createCategory(req: CreateTreatmentCategoryRequest): Observable<ApiResponse<TreatmentCategoryResponse>> {
    return this.api.createTreatmentCategory(req).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as TreatmentCategoryResponse
      }))
    );
  }

  updateCategoryById(id: number, req: CreateTreatmentCategoryRequest): Observable<ApiResponse<TreatmentCategoryResponse>> {
    return this.api.updateTreatmentCategoryById(id, req).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as TreatmentCategoryResponse
      }))
    );
  }

  deleteCategoryById(id: number): Observable<void> {
    return this.api.deleteTreatmentCategory(id).pipe(
      map(() => undefined)
    );
  }
}
