import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../core/api/api-client.service';
import { ApiResponse, PaginatedPayload } from '../../core/models/api.model';
import {
  UserResponse as ApiUserResponse,
  CreateUserRequest as ApiCreateUserRequest,
  UpdateUserRequest as ApiUpdateUserRequest,
  UserRole as ApiUserRole
} from '../../core/api/api.types';

export type UserRole = ApiUserRole | 'DOCTOR' | 'STAFF';

export interface UserResponse extends ApiUserResponse {
  id: number;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  password?: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(ApiClientService);

  getAllUsers(pageNo: number = 0, pageSize: number = 10): Observable<ApiResponse<PaginatedPayload<UserResponse>>> {
    return this.api.getAllUsers({ pageNo, pageSize }).pipe(
      map(res => {
        const items = (res.data || []) as UserResponse[];
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

  getUserById(id: number): Observable<ApiResponse<UserResponse>> {
    return this.api.getUserById(id).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as UserResponse
      }))
    );
  }

  createUser(req: CreateUserRequest): Observable<ApiResponse<UserResponse>> {
    return this.api.createUser(req as ApiCreateUserRequest).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as UserResponse
      }))
    );
  }

  updateUserById(id: number, req: CreateUserRequest): Observable<ApiResponse<UserResponse>> {
    return this.api.updateUserById(id, req as ApiUpdateUserRequest).pipe(
      map(res => ({
        success: !!res.success,
        statusCode: res.statusCode,
        message: res.message || '',
        timestamp: res.timestamp,
        data: res.data as UserResponse
      }))
    );
  }

  deleteUserById(id: number): Observable<void> {
    return this.api.deleteUserById(id);
  }
}
