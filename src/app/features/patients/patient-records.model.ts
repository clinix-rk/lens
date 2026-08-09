export interface Complain {
  id: number;
  patientId: number;
  date: string; // YYYY-MM-DD
  type: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

export type SuggestionStatus = 'SUGGESTED' | 'ACCEPTED' | 'DECLINED';

export interface Suggestion {
  id: number;
  patientId: number;
  date: string; // YYYY-MM-DD
  type: string;
  details: string;
  cost: number;
  status: SuggestionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: number;
  patientId: number;
  date: string; // YYYY-MM-DD
  type: string;
  categoryDisplay: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  instructions: string;
  quantity: number;
}

export interface Prescription {
  id: number;
  patientId: number;
  date: string; // YYYY-MM-DD
  details: string;
  medicines: Medicine[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'CASH' | 'ONLINE' | 'CHEQUE';

export interface Payment {
  id: number;
  patientId: number;
  reciptId?: number;
  treatmentId?: number;
  treatmentDetail?: string;
  amount: number;
  method: PaymentMethod;
  referenceName: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedPayment extends Payment {
  reciptId: number;
  treatmentId: number;
  patientName: string;
  patientCaseNo: string;
}

// Reusable Paginated Wrapper following the API structure of the application
export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number; // 0-based in backend/responses, 1-based on display
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface PaginatedResponseWrapper<T> {
  success: boolean;
  message: string;
  data: PaginatedResponse<T>;
  meta: {
    timestamp: string;
  };
}

// Create/Update request interfaces
export interface CreateComplainRequest {
  patientId: number;
  date: string;
  type: string;
  details: string;
}
export interface UpdateComplainRequest extends CreateComplainRequest { id: number; }

export interface CreateSuggestionRequest {
  patientId: number;
  date: string;
  type: string;
  details: string;
  cost: number;
  status: SuggestionStatus;
}
export interface UpdateSuggestionRequest extends CreateSuggestionRequest { id: number; }

export interface CreateTreatmentRequest {
  patientId: number;
  date: string;
  type: string;
  details: string;
}
export interface UpdateTreatmentRequest extends CreateTreatmentRequest { id: number; }

export interface MedicineInput {
  name: string;
  dosage: string;
  instructions: string;
  isNew: boolean;
}

export interface CreatePrescriptionRequest {
  patientId: number;
  date: string;
  details: string;
  medicines: { name: string; dosage: string; instructions: string; quantity: number; }[];
}
export interface UpdatePrescriptionRequest extends CreatePrescriptionRequest { id: number; }

export interface CreatePaymentRequest {
  patientId: number;
  date: string;
  amount: number;
  method: PaymentMethod;
  referenceName: string;
}
export interface UpdatePaymentRequest extends CreatePaymentRequest { id: number; }

