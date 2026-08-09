import {
  DoctorResponse as ApiDoctorResponse,
  CreateDoctorRequest as ApiCreateDoctorRequest,
  UpdateDoctorRequest as ApiUpdateDoctorRequest,
  ApiResponseDoctorResponse,
  ApiResponseListDoctorResponse,
  PaginationMetadata
} from '../../core/api/api.types';

export type CreateDoctorRequest = ApiCreateDoctorRequest;
export type UpdateDoctorRequest = ApiUpdateDoctorRequest;

export interface DoctorResponse extends ApiDoctorResponse {
  id: number;
  name: string;
  caseNoPrefix: string;
  specialty?: string;
}

export interface DoctorResponseWrapper {
  success: boolean;
  message: string;
  data: DoctorResponse;
  meta?: {
    timestamp: string;
  };
  timestamp?: string;
}

export interface PaginatedDoctorResponse {
  items: DoctorResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface PaginatedDoctorResponseWrapper {
  success: boolean;
  message: string;
  data: PaginatedDoctorResponse;
  meta?: {
    timestamp: string;
  };
  timestamp?: string;
}
