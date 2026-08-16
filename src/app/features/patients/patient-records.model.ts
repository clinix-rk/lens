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
  id?: number;
  medicineId?: number;
  dosageId?: number;
  instructionId?: number;
  name: string;
  dosage?: string;
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
export type FinancePaymentMethodFilter = PaymentMethod | 'ALL';

export interface Payment {
  id: number;
  patientId: number;
  receiptId?: number;
  treatmentId?: number;
  treatmentDetails?: string;
  amount: number;
  method: PaymentMethod;
  referenceName: string;
  date: string; // YYYY-MM-DD
  receivedDate?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedPayment extends Payment {
  receiptId: number;
  treatmentId: number;
  patientName: string;
  patientCaseNo: string;
}

/** View model for the Finances page (`GET /finances`). */
export interface FinanceRow {
  id: number;
  patientId: number;
  caseNo: string;
  date: string;
  patientName: string;
  treatmentDetails: string;
  amount: number;
  method: PaymentMethod | string;
  receivedDate: string;
  receiptNo: string;
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
  medicines: {
    medicineId?: number;
    dosageId?: number;
    instructionId?: number;
    name?: string;
    dosage?: string;
    instructions?: string;
    quantity: number;
  }[];
}
export interface UpdatePrescriptionRequest extends CreatePrescriptionRequest { id: number; }

export interface CreatePaymentRequest {
  patientId: number;
  date: string;
  amount: number;
  method: PaymentMethod;
  referenceName: string;
  treatmentDetails?: string;
  receivedDate?: string;
}
export interface UpdatePaymentRequest extends CreatePaymentRequest { id: number; }

