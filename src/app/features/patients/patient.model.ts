import {
  Gender as ApiGender,
  PhoneType as ApiPhoneType,
  PhoneNumberRequest as ApiPhoneNumberRequest,
  PhoneNumberResponse as ApiPhoneNumberResponse,
  CreatePatientRequest as ApiCreatePatientRequest,
  UpdatePatientRequest as ApiUpdatePatientRequest,
  PatientResponse as ApiPatientResponse
} from '../../core/api/api.types';

export type Gender = ApiGender;
export type PhoneType = ApiPhoneType;
export type PhoneNumberRequest = ApiPhoneNumberRequest;

export interface PhoneNumberResponse extends ApiPhoneNumberResponse {
  id: number;
  phoneNumber: string;
  type: PhoneType;
  createdAt: string;
  updatedAt: string;
}

export type CreatePatientRequest = ApiCreatePatientRequest;
export type UpdatePatientRequest = ApiUpdatePatientRequest;

export interface PatientResponse extends ApiPatientResponse {
  id: number;
  caseNo: string;
  name: string;
  phoneNumbers: PhoneNumberResponse[];
  medicalConditions: string[];
  drugAllergies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PatientResponseWrapper {
  success: boolean;
  message: string;
  data: PatientResponse;
  meta?: {
    timestamp: string;
  };
  timestamp?: string;
}

export interface PaginatedPatientResponse {
  items: PatientResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface PaginatedPatientResponseWrapper {
  success: boolean;
  message: string;
  data: PaginatedPatientResponse;
  meta?: {
    timestamp: string;
  };
  timestamp?: string;
}

export interface ApiValidationError {
  field: string;
  message: string;
  rejectedValue?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: ApiValidationError[];
  meta?: {
    timestamp: string;
  };
  timestamp?: string;
}
