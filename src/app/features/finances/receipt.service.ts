import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedPayload } from '../../core/models/api.model';

export interface ReceiptResponse {
  id: number;
  doctorIdentityCharacter: string;
  financialYear: string;
  serial: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReceiptRequest {
  doctorIdentityCharacter: string;
  financialYear: string;
  serial: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/finance/receipts`;

  getAllReceipts(pageNo: number = 0, pageSize: number = 10): Observable<ApiResponse<PaginatedPayload<ReceiptResponse>>> {
    return this.http.get<ApiResponse<PaginatedPayload<ReceiptResponse>>>(
      `${this.baseUrl}?pageNo=${pageNo}&pageSize=${pageSize}`
    );
  }

  getReceiptById(id: number): Observable<ApiResponse<ReceiptResponse>> {
    return this.http.get<ApiResponse<ReceiptResponse>>(`${this.baseUrl}/${id}`);
  }

  createReceipt(req: CreateReceiptRequest): Observable<ApiResponse<ReceiptResponse>> {
    return this.http.post<ApiResponse<ReceiptResponse>>(this.baseUrl, req);
  }

  updateReceiptById(id: number, req: CreateReceiptRequest): Observable<ApiResponse<ReceiptResponse>> {
    return this.http.put<ApiResponse<ReceiptResponse>>(`${this.baseUrl}/${id}`, req);
  }

  deleteReceiptById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
