// Aligned TypeScript interfaces derived from OpenAPI v0 spec

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type PhoneType = 'PRIMARY' | 'SECONDARY';
export type PaymentMethod = 'CASH' | 'ONLINE' | 'CHEQUE';
export type UserRole = 'ADMIN' | 'DOCTOR' | 'STAFF';
export type SuggestionStatus = 'SUGGESTED' | 'ACCEPTED' | 'DECLINED';

export interface PrescriptionMedicineRequest {
  medicineId: number;
  dosageId: number;
  quantity: number;
}

export interface UpdatePrescriptionRequest {
  date: string;
  details: string;
  medicines?: PrescriptionMedicineRequest[];
}

export interface ApiError {
  field?: string;
  code?: string;
  message?: string;
}

export interface ApiResponsePrescriptionResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: PrescriptionResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface PaginationMetadata {
  page?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface PrescriptionMedicineResponse {
  id?: number;
  medicineId?: number;
  dosageId?: number;
  quantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrescriptionResponse {
  id?: number;
  patientId?: number;
  date?: string;
  details?: string;
  medicines?: PrescriptionMedicineResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateMedicineRequest {
  name: string;
  type: string;
  instruction: string;
}

export interface ApiResponseMedicineResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: MedicineResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface MedicineResponse {
  id?: number;
  name?: string;
  type?: string;
  instruction?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePaymentRequest {
  amount: number;
  method: 'CASH' | 'ONLINE' | 'CHEQUE';
  reference?: string;
}

export interface ApiResponsePaymentResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: PaymentResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface PaymentResponse {
  id?: number;
  receiptNo?: string;
  treatmentId?: number;
  treatmentDetail?: string;
  amount?: number;
  method?: 'CASH' | 'ONLINE' | 'CHEQUE';
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  username: string;
  password?: string;
  role: UserRole;
}

export interface ApiResponseUserResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: UserResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface UserResponse {
  id?: number;
  username?: string;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateTreatmentRequest {
  details?: string;
  date: string;
  categoryId: number;
}

export interface ApiResponseTreatmentResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: TreatmentResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface TreatmentResponse {
  id?: number;
  details?: string;
  date?: string;
  categoryId?: number;
  categoryDisplay?: string;
  patientId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSuggestionRequest {
  date: string;
  categoryId: number;
  details?: string;
  cost: number;
  status: 'SUGGESTED' | 'ACCEPTED' | 'DECLINED';
}

export interface ApiResponseSuggestionResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: SuggestionResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface SuggestionResponse {
  id?: number;
  date?: string;
  categoryId?: number;
  categoryDisplay?: string;
  details?: string;
  cost?: number;
  status?: 'SUGGESTED' | 'ACCEPTED' | 'DECLINED';
  patientId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateComplainRequest {
  date: string;
  details?: string;
  categoryId: number;
}

export interface ApiResponseComplainResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: ComplainResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ComplainResponse {
  id?: number;
  date?: string;
  details?: string;
  categoryId?: number;
  patientId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PhoneNumberRequest {
  phoneNumber: string;
  type: 'PRIMARY' | 'SECONDARY';
}

export interface UpdatePatientRequest {
  name: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
  referredBy?: string;
  phoneNumbers: PhoneNumberRequest[];
  medicalConditions?: string[];
  drugAllergies?: string[];
}

export interface ApiResponsePatientResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: PatientResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface PatientResponse {
  id?: number;
  caseNo?: string;
  name?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
  referredBy?: string;
  phoneNumbers?: PhoneNumberResponse[];
  medicalConditions?: string[];
  drugAllergies?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PhoneNumberResponse {
  id?: number;
  phoneNumber?: string;
  type?: 'PRIMARY' | 'SECONDARY';
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateFileRequest {
  name: string;
  location: string;
}

export interface ApiResponseFileResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: FileResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface FileResponse {
  id?: number;
  patientId?: number;
  name?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateDoctorRequest {
  name?: string;
}

export interface ApiResponseDoctorResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: DoctorResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface DoctorResponse {
  id?: number;
  name?: string;
  caseNoPrefix?: string;
  totalPatients?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateTreatmentCategoryRequest {
  name: string;
  parentId?: number;
}

export interface ApiResponseTreatmentCategoryResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: TreatmentCategoryResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface TreatmentCategoryResponse {
  id?: number;
  name?: string;
  parentId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateComplainCategoryRequest {
  name: string;
  parentId?: number;
}

export interface ApiResponseComplainCategoryResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: ComplainCategoryResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ComplainCategoryResponse {
  id?: number;
  name?: string;
  parentId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateDrugDosageRequest {
  dosage: string;
}

export interface ApiResponseDrugDosageResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: DrugDosageResponse;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface DrugDosageResponse {
  id?: number;
  dosage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePrescriptionRequest {
  patientId: number;
  date: string;
  details: string;
  medicines?: PrescriptionMedicineRequest[];
}

export interface CreateMedicineRequest {
  name: string;
  type: string;
}

export interface CreatePaymentRequest {
  treatmentId: number;
  amount: number;
  method: 'CASH' | 'ONLINE' | 'CHEQUE';
  reference?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: 'ADMIN';
}

export interface CreateTreatmentRequest {
  details?: string;
  date: string;
  categoryId: number;
  patientId: number;
}

export interface CreateSuggestionRequest {
  date: string;
  categoryId: number;
  details?: string;
  cost: number;
  patientId: number;
  status?: 'SUGGESTED' | 'ACCEPTED' | 'DECLINED';
}

export interface CreatePatientRequest {
  doctorId: number;
  name: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
  referredBy?: string;
  phoneNumbers: PhoneNumberRequest[];
  medicalConditions?: string[];
  drugAllergies?: string[];
}

export interface CreateComplainRequest {
  date: string;
  details?: string;
  categoryId: number;
  patientId: number;
}

export interface CreateFileRequest {
  patientId: number;
  name: string;
  location: string;
}

export interface CreateDoctorRequest {
  name?: string;
  caseNoPrefix: string;
}

export interface CreateTreatmentCategoryRequest {
  name: string;
  parentId?: number;
}

export interface CreateComplainCategoryRequest {
  name: string;
  parentId?: number;
}

export interface CreateDrugDosageRequest {
  dosage: string;
}

export interface ApiResponseListPrescriptionResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: PrescriptionResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListMedicineResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: MedicineResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListPaymentResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: PaymentResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListUserResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: UserResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListTreatmentResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: TreatmentResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListSuggestionResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: SuggestionResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListPatientResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: PatientResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListComplainResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: ComplainResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListString {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: string[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListFileResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: FileResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListDoctorResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: DoctorResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListTreatmentCategoryResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: TreatmentCategoryResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListComplainCategoryResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: ComplainCategoryResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseListDrugDosageResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: DrugDosageResponse[];
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}

export interface ApiResponseBoolean {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: boolean;
  errors?: ApiError[];
  pagination?: PaginationMetadata;
  timestamp?: string;
}
