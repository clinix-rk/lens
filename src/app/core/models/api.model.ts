import type { ApiError, PaginationMetadata } from '../api/api.types';

export type { ApiError, PaginationMetadata };

export interface ApiResponse<T> {
  success: boolean;
  statusCode?: number;
  message: string;
  data: T;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
  meta?: {
    timestamp: string;
  };
}

export interface PaginatedPayload<T> {
  items: T[];
  pageNumber: number; // 0-based index
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  hasNext?: boolean;
  hasPrevious?: boolean;
}
