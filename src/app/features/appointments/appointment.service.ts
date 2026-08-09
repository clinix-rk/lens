import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedPayload } from '../../core/models/api.model';

export interface AppointmentResponse {
  id: number;
  patientId: number;
  notes?: string;
  datetime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  patientId: number;
  notes?: string;
  datetime: string;
}

export interface UpdateAppointmentRequest {
  notes?: string;
  datetime: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/appointments`;

  getAllAppointments(pageNo: number = 0, pageSize: number = 10): Observable<ApiResponse<PaginatedPayload<AppointmentResponse>>> {
    return this.http.get<ApiResponse<PaginatedPayload<AppointmentResponse>>>(
      `${this.baseUrl}?pageNo=${pageNo}&pageSize=${pageSize}`
    );
  }

  getAppointmentById(id: number): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.get<ApiResponse<AppointmentResponse>>(`${this.baseUrl}/${id}`);
  }

  createAppointment(req: CreateAppointmentRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.post<ApiResponse<AppointmentResponse>>(this.baseUrl, req);
  }

  updateAppointmentById(id: number, req: UpdateAppointmentRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.put<ApiResponse<AppointmentResponse>>(`${this.baseUrl}/${id}`, req);
  }

  deleteAppointmentById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
