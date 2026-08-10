import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../core/api/api-client.service';
import { ApiResponse, PaginatedPayload } from '../../core/models/api.model';
import {
  InstructionResponse as ApiInstructionResponse,
  CreateInstructionRequest as ApiCreateInstructionRequest,
  UpdateInstructionRequest as ApiUpdateInstructionRequest
} from '../../core/api/api.types';

export type InstructionCatalogResponse = ApiInstructionResponse & { id: number; instruction: string };
export type CreateInstructionRequest = ApiCreateInstructionRequest;
export type UpdateInstructionRequest = ApiUpdateInstructionRequest;

@Injectable({
  providedIn: 'root'
})
export class InstructionCatalogService {
  private api = inject(ApiClientService);

  getAllInstructions(pageNo: number = 0, pageSize: number = 1000): Observable<ApiResponse<PaginatedPayload<InstructionCatalogResponse>>> {
    return this.api.getAllInstructions({ pageNo, pageSize }).pipe(
      map(res => {
        const items = (res.data || []) as InstructionCatalogResponse[];
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

  getInstructionById(id: number): Observable<ApiResponse<InstructionCatalogResponse>> {
    return this.api.getInstructionById(id).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as InstructionCatalogResponse
      }))
    );
  }

  createInstruction(req: CreateInstructionRequest): Observable<ApiResponse<InstructionCatalogResponse>> {
    return this.api.createInstruction(req).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as InstructionCatalogResponse
      }))
    );
  }

  updateInstructionById(id: number, req: UpdateInstructionRequest): Observable<ApiResponse<InstructionCatalogResponse>> {
    return this.api.updateInstructionById(id, req).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as InstructionCatalogResponse
      }))
    );
  }

  deleteInstructionById(id: number): Observable<void> {
    return this.api.deleteInstructionById(id);
  }
}
