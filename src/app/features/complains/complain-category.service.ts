import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../core/api/api-client.service';
import { ApiResponse, PaginatedPayload } from '../../core/models/api.model';
import {
  ComplainCategoryResponse as ApiComplainCategoryResponse,
  CreateComplainCategoryRequest as ApiCreateComplainCategoryRequest
} from '../../core/api/api.types';

export type ComplainCategoryResponse = ApiComplainCategoryResponse & { id: number; name: string };
export type CreateComplainCategoryRequest = ApiCreateComplainCategoryRequest;

@Injectable({
  providedIn: 'root'
})
export class ComplainCategoryService {
  private api = inject(ApiClientService);

  getAllCategories(pageNo: number = 0, pageSize: number = 1000): Observable<ApiResponse<PaginatedPayload<ComplainCategoryResponse>>> {
    return this.api.getAllComplainCategories({ pageNo, pageSize }).pipe(
      map(res => {
        const items = (res.data || []) as ComplainCategoryResponse[];
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

  getCategoryById(id: number): Observable<ApiResponse<ComplainCategoryResponse>> {
    return this.api.getSubCategoriesForId(id).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: ((res.data && res.data[0]) || { id, name: '' }) as ComplainCategoryResponse
      }))
    );
  }

  createCategory(req: CreateComplainCategoryRequest): Observable<ApiResponse<ComplainCategoryResponse>> {
    return this.api.createComplainCategory(req).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as ComplainCategoryResponse
      }))
    );
  }

  updateCategoryById(id: number, req: CreateComplainCategoryRequest): Observable<ApiResponse<ComplainCategoryResponse>> {
    return this.api.updateComplainCategory(id, req).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as ComplainCategoryResponse
      }))
    );
  }

  deleteCategoryById(id: number): Observable<void> {
    return this.api.deleteComplainCategory(id).pipe(
      map(() => undefined)
    );
  }
}
