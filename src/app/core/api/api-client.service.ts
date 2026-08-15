import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiRequestOptions, ApiRoute } from './api-url-builder';
import * as T from './api.types';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly routes = {
    searchPatients: new ApiRoute('GET', '/patients', 'searchPatients'),
    addPatient: new ApiRoute('POST', '/patients', 'addPatient'),
    getPatientById: new ApiRoute('GET', '/patients/{id}', 'getPatientById'),
    updatePatientById: new ApiRoute('PUT', '/patients/{id}', 'updatePatientById'),
    deletePatientById: new ApiRoute('DELETE', '/patients/{id}', 'deletePatientById'),
    getPatientByCaseNo: new ApiRoute('GET', '/patients/case-no/{caseNo}', 'getPatientByCaseNo'),
    getAllMedicalConditions: new ApiRoute(
      'GET',
      '/patients/medical-conditions',
      'getAllMedicalConditions',
    ),
    getAllDrugAllergies: new ApiRoute('GET', '/patients/drug-allergies', 'getAllDrugAllergies'),

    getDoctors: new ApiRoute('GET', '/doctors', 'getDoctors'),
    addDoctor: new ApiRoute('POST', '/doctors', 'addDoctor'),
    getDoctorById: new ApiRoute('GET', '/doctors/{id}', 'getDoctorById'),
    updateDoctorById: new ApiRoute('PUT', '/doctors/{id}', 'updateDoctorById'),
    deleteDoctorById: new ApiRoute('DELETE', '/doctors/{id}', 'deleteDoctorById'),
    searchDoctors: new ApiRoute('GET', '/doctors/search', 'searchDoctors'),

    getAllPrescriptions: new ApiRoute('GET', '/{patientId}/prescriptions', 'getAllPrescriptions'),
    createPrescription: new ApiRoute('POST', '/{patientId}/prescriptions', 'createPrescription'),
    getPrescriptionById: new ApiRoute(
      'GET',
      '/{patientId}/prescriptions/{id}',
      'getPrescriptionById',
    ),
    updatePrescriptionById: new ApiRoute(
      'PUT',
      '/{patientId}/prescriptions/{id}',
      'updatePrescriptionById',
    ),
    deletePrescriptionById: new ApiRoute(
      'DELETE',
      '/{patientId}/prescriptions/{id}',
      'deletePrescriptionById',
    ),
    getPrescriptionPdf: new ApiRoute(
      'GET',
      '/{patientId}/prescriptions/{id}/pdf',
      'getPrescriptionPdf',
    ),

    getAllMedicines: new ApiRoute('GET', '/catalog/medicines', 'getAllMedicines'),
    createMedicine: new ApiRoute('POST', '/catalog/medicines', 'createMedicine'),
    getMedicineById: new ApiRoute('GET', '/catalog/medicines/{id}', 'getMedicineById'),
    updateMedicineById: new ApiRoute('PUT', '/catalog/medicines/{id}', 'updateMedicineById'),
    deleteMedicineById: new ApiRoute('DELETE', '/catalog/medicines/{id}', 'deleteMedicineById'),

    getAllComplains: new ApiRoute('GET', '/patients/{patientId}/complains', 'getAllComplains'),
    createComplain: new ApiRoute('POST', '/patients/{patientId}/complains', 'createComplain'),
    getComplainById: new ApiRoute('GET', '/patients/{patientId}/complains/{id}', 'getComplainById'),
    updateComplainById: new ApiRoute(
      'PUT',
      '/patients/{patientId}/complains/{id}',
      'updateComplainById',
    ),
    deleteComplainById: new ApiRoute(
      'DELETE',
      '/patients/{patientId}/complains/{id}',
      'deleteComplainById',
    ),

    getAllComplainCategories: new ApiRoute(
      'GET',
      '/categories/complains',
      'getAllComplainCategories',
    ),
    createComplainCategory: new ApiRoute('POST', '/categories/complains', 'createComplainCategory'),
    getSubCategoriesForId: new ApiRoute(
      'GET',
      '/categories/complains/{id}',
      'getSubCategoriesForId',
    ),
    updateComplainCategory: new ApiRoute(
      'PUT',
      '/categories/complains/{id}',
      'updateComplainCategory',
    ),
    deleteComplainCategory: new ApiRoute(
      'DELETE',
      '/categories/complains/{id}',
      'deleteComplainCategory',
    ),

    getAllTreatments: new ApiRoute('GET', '/patients/{patientId}/treatments', 'getAllTreatments'),
    createTreatment: new ApiRoute('POST', '/patients/{patientId}/treatments', 'createTreatment'),
    getTreatmentById: new ApiRoute(
      'GET',
      '/patients/{patientId}/treatments/{id}',
      'getTreatmentById',
    ),
    updateTreatmentById: new ApiRoute(
      'PUT',
      '/patients/{patientId}/treatments/{id}',
      'updateTreatmentById',
    ),
    deleteTreatmentById: new ApiRoute(
      'DELETE',
      '/patients/{patientId}/treatments/{id}',
      'deleteTreatmentById',
    ),

    getAllTreatmentCategories: new ApiRoute(
      'GET',
      '/categories/treatments',
      'getAllTreatmentCategories',
    ),
    createTreatmentCategory: new ApiRoute(
      'POST',
      '/categories/treatments',
      'createTreatmentCategory',
    ),
    updateTreatmentCategoryById: new ApiRoute(
      'PUT',
      '/categories/treatments/{id}',
      'updateTreatmentCategoryById',
    ),
    deleteTreatmentCategory: new ApiRoute(
      'DELETE',
      '/categories/treatments/{id}',
      'deleteTreatmentCategory',
    ),

    getAllSuggestions: new ApiRoute(
      'GET',
      '/patients/{patientId}/suggestions',
      'getAllSuggestions',
    ),
    createSuggestion: new ApiRoute('POST', '/patients/{patientId}/suggestions', 'createSuggestion'),
    getSuggestionById: new ApiRoute(
      'GET',
      '/patients/{patientId}/suggestions/{id}',
      'getSuggestionById',
    ),
    updateSuggestionById: new ApiRoute(
      'PUT',
      '/patients/{patientId}/suggestions/{id}',
      'updateSuggestionById',
    ),
    deleteSuggestionById: new ApiRoute(
      'DELETE',
      '/patients/{patientId}/suggestions/{id}',
      'deleteSuggestionById',
    ),

    getAllPayments: new ApiRoute('GET', '/{patientId}/finance/payments', 'getAllPayments'),
    createPayment: new ApiRoute('POST', '/{patientId}/finance/payments', 'createPayment'),
    getPaymentById: new ApiRoute('GET', '/{patientId}/finance/payments/{id}', 'getPaymentById'),
    updatePaymentById: new ApiRoute(
      'PUT',
      '/{patientId}/finance/payments/{id}',
      'updatePaymentById',
    ),
    deletePaymentById: new ApiRoute(
      'DELETE',
      '/{patientId}/finance/payments/{id}',
      'deletePaymentById',
    ),

    getAllDrugDosages: new ApiRoute('GET', '/catalog/dosages', 'getAllDrugDosages'),
    createDrugDosage: new ApiRoute('POST', '/catalog/dosages', 'createDrugDosage'),
    getDrugDosageById: new ApiRoute('GET', '/catalog/dosages/{id}', 'getDrugDosageById'),
    updateDrugDosageById: new ApiRoute(
      'PUT',
      '/catalog/dosages/{id}',
      'updateDrugDosageById',
    ),
    deleteDrugDosageById: new ApiRoute(
      'DELETE',
      '/catalog/dosages/{id}',
      'deleteDrugDosageById',
    ),

    getAllInstruction: new ApiRoute('GET', '/catalog/instructions', 'getAllInstruction'),
    createInstruction: new ApiRoute('POST', '/catalog/instructions', 'createInstruction'),
    getInstructionById: new ApiRoute('GET', '/catalog/instructions/{id}', 'getInstructionById'),
    updateInstructionById: new ApiRoute(
      'PUT',
      '/catalog/instructions/{id}',
      'updateInstructionById',
    ),
    deleteInstructionById: new ApiRoute(
      'DELETE',
      '/catalog/instructions/{id}',
      'deleteInstructionById',
    ),

    getAllUsers: new ApiRoute('GET', '/users', 'getAllUsers'),
    createUser: new ApiRoute('POST', '/users', 'createUser'),
    getUserById: new ApiRoute('GET', '/users/{id}', 'getUserById'),
    updateUserById: new ApiRoute('PUT', '/users/{id}', 'updateUserById'),
    deleteUserById: new ApiRoute('DELETE', '/users/{id}', 'deleteUserById'),

    getAllFiles: new ApiRoute('GET', '/files', 'getAllFiles'),
    createFile: new ApiRoute('POST', '/files', 'createFile'),
    getFileById: new ApiRoute('GET', '/files/{id}', 'getFileById'),
    updateFileById: new ApiRoute('PUT', '/files/{id}', 'updateFileById'),
    deleteFileById: new ApiRoute('DELETE', '/files/{id}', 'deleteFileById'),
    uploadFile: new ApiRoute('POST', '/files/upload', 'uploadFile'),
    getFileByPatientId: new ApiRoute('GET', '/files/patient/{patientId}', 'getFileByPatientId'),
    downloadPdf: new ApiRoute('GET', '/files/patient/{patientId}/pdf', 'downloadPdf'),

    getReceiptPdf: new ApiRoute('GET', '/finance/receipts/{id}/pdf', 'getReceiptPdf'),
    getPatientPdf: new ApiRoute('GET', '/files/patient/{patientId}/pdf', 'getPatientPdf'),
    getForm3CPdf: new ApiRoute('GET', '/finance/form3c/pdf', 'getForm3CPdf'),
  };

  private request<T>(route: ApiRoute, options: ApiRequestOptions = {}): Observable<T> {
    const url = route.buildUrl(this.baseUrl, options.pathParams, options.queryParams);
    const requestOptions: any = {
      observe: 'body',
    };

    if (options.body !== undefined) {
      requestOptions.body = options.body;
    }

    if (options.headers) {
      requestOptions.headers = new HttpHeaders(options.headers);
    }

    if (options.responseType) {
      requestOptions.responseType = options.responseType === 'blob' ? 'blob' : 'json';
    }

    return this.http.request<T>(route.method, url, requestOptions) as Observable<T>;
  }

  searchPatients(queryParams?: {
    pageNo?: number;
    pageSize?: number;
    name?: string;
    phoneNo?: string;
    caseNo?: string;
  }): Observable<T.ApiResponseListPatientResponse> {
    return this.request<T.ApiResponseListPatientResponse>(this.routes.searchPatients, {
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  addPatient(req: T.CreatePatientRequest): Observable<T.ApiResponsePatientResponse> {
    return this.request<T.ApiResponsePatientResponse>(this.routes.addPatient, { body: req });
  }

  getPatientById(id: number): Observable<T.ApiResponsePatientResponse> {
    return this.request<T.ApiResponsePatientResponse>(this.routes.getPatientById, {
      pathParams: { id },
    });
  }

  updatePatientById(
    id: number,
    req: T.UpdatePatientRequest,
  ): Observable<T.ApiResponsePatientResponse> {
    return this.request<T.ApiResponsePatientResponse>(this.routes.updatePatientById, {
      pathParams: { id },
      body: req,
    });
  }

  deletePatientById(id: number): Observable<void> {
    return this.request<void>(this.routes.deletePatientById, { pathParams: { id } });
  }

  getPatientByCaseNo(caseNo: string): Observable<T.ApiResponsePatientResponse> {
    return this.request<T.ApiResponsePatientResponse>(this.routes.getPatientByCaseNo, {
      pathParams: { caseNo },
    });
  }

  getAllMedicalConditions(): Observable<T.ApiResponseListString> {
    return this.request<T.ApiResponseListString>(this.routes.getAllMedicalConditions);
  }

  getAllDrugAllergies(): Observable<T.ApiResponseListString> {
    return this.request<T.ApiResponseListString>(this.routes.getAllDrugAllergies);
  }

  getDoctors(queryParams?: {
    pageNo?: number;
    pageSize?: number;
  }): Observable<T.ApiResponseListDoctorResponse> {
    return this.request<T.ApiResponseListDoctorResponse>(this.routes.getDoctors, {
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  addDoctor(req: T.CreateDoctorRequest): Observable<T.ApiResponseDoctorResponse> {
    return this.request<T.ApiResponseDoctorResponse>(this.routes.addDoctor, { body: req });
  }

  getDoctorById(id: number): Observable<T.ApiResponseDoctorResponse> {
    return this.request<T.ApiResponseDoctorResponse>(this.routes.getDoctorById, {
      pathParams: { id },
    });
  }

  updateDoctorById(
    id: number,
    req: T.UpdateDoctorRequest,
  ): Observable<T.ApiResponseDoctorResponse> {
    return this.request<T.ApiResponseDoctorResponse>(this.routes.updateDoctorById, {
      pathParams: { id },
      body: req,
    });
  }

  deleteDoctorById(id: number): Observable<void> {
    return this.request<void>(this.routes.deleteDoctorById, { pathParams: { id } });
  }

  searchDoctors(name: string): Observable<T.ApiResponseListDoctorResponse> {
    return this.request<T.ApiResponseListDoctorResponse>(this.routes.searchDoctors, {
      queryParams: { name },
    });
  }

  getAllPrescriptions(
    patientId: number,
    queryParams?: { pageNo?: number; pageSize?: number },
  ): Observable<T.ApiResponseListPrescriptionResponse> {
    return this.request<T.ApiResponseListPrescriptionResponse>(this.routes.getAllPrescriptions, {
      pathParams: { patientId },
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  createPrescription(
    patientId: number,
    req: T.CreatePrescriptionRequest,
  ): Observable<T.ApiResponsePrescriptionResponse> {
    return this.request<T.ApiResponsePrescriptionResponse>(this.routes.createPrescription, {
      pathParams: { patientId },
      body: req,
    });
  }

  getPrescriptionById(
    patientId: number,
    id: number,
  ): Observable<T.ApiResponsePrescriptionResponse> {
    return this.request<T.ApiResponsePrescriptionResponse>(this.routes.getPrescriptionById, {
      pathParams: { patientId, id },
    });
  }

  updatePrescriptionById(
    patientId: number,
    id: number,
    req: T.UpdatePrescriptionRequest,
  ): Observable<T.ApiResponsePrescriptionResponse> {
    return this.request<T.ApiResponsePrescriptionResponse>(this.routes.updatePrescriptionById, {
      pathParams: { patientId, id },
      body: req,
    });
  }

  deletePrescriptionById(patientId: number, id: number): Observable<void> {
    return this.request<void>(this.routes.deletePrescriptionById, {
      pathParams: { patientId, id },
    });
  }

  getPrescriptionPdf(patientId: number, id: number): Observable<Blob> {
    return this.request<Blob>(this.routes.getPrescriptionPdf, {
      pathParams: { patientId, id },
      responseType: 'blob',
    });
  }

  getPrescriptionPdfUrl(patientId: number, id: number): string {
    return this.routes.getPrescriptionPdf.buildUrl(this.baseUrl, { patientId, id });
  }

  getAllMedicines(
    queryParams?: { pageNo?: number; pageSize?: number },
  ): Observable<T.ApiResponseListMedicineResponse> {
    return this.request<T.ApiResponseListMedicineResponse>(this.routes.getAllMedicines, {
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  createMedicine(
    req: T.CreateMedicineRequest,
  ): Observable<T.ApiResponseMedicineResponse> {
    return this.request<T.ApiResponseMedicineResponse>(this.routes.createMedicine, { body: req });
  }

  getMedicineById(id: number): Observable<T.ApiResponseMedicineResponse> {
    return this.request<T.ApiResponseMedicineResponse>(this.routes.getMedicineById, {
      pathParams: { id },
    });
  }

  updateMedicineById(
    id: number,
    req: T.UpdateMedicineRequest,
  ): Observable<T.ApiResponseMedicineResponse> {
    return this.request<T.ApiResponseMedicineResponse>(this.routes.updateMedicineById, {
      pathParams: { id },
      body: req,
    });
  }

  deleteMedicineById(id: number): Observable<void> {
    return this.request<void>(this.routes.deleteMedicineById, { pathParams: { id } });
  }

  getAllComplains(
    patientId: number,
    queryParams?: { pageNo?: number; pageSize?: number },
  ): Observable<T.ApiResponseListComplainResponse> {
    return this.request<T.ApiResponseListComplainResponse>(this.routes.getAllComplains, {
      pathParams: { patientId },
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  createComplain(
    patientId: number,
    req: T.CreateComplainRequest,
  ): Observable<T.ApiResponseComplainResponse> {
    return this.request<T.ApiResponseComplainResponse>(this.routes.createComplain, {
      pathParams: { patientId },
      body: req,
    });
  }

  getComplainById(patientId: number, id: number): Observable<T.ApiResponseComplainResponse> {
    return this.request<T.ApiResponseComplainResponse>(this.routes.getComplainById, {
      pathParams: { patientId, id },
    });
  }

  updateComplainById(
    patientId: number,
    id: number,
    req: T.UpdateComplainRequest,
  ): Observable<T.ApiResponseComplainResponse> {
    return this.request<T.ApiResponseComplainResponse>(this.routes.updateComplainById, {
      pathParams: { patientId, id },
      body: req,
    });
  }

  deleteComplainById(patientId: number, id: number): Observable<void> {
    return this.request<void>(this.routes.deleteComplainById, { pathParams: { patientId, id } });
  }

  getAllComplainCategories(queryParams?: {
    pageNo?: number;
    pageSize?: number;
  }): Observable<T.ApiResponseListComplainCategoryResponse> {
    return this.request<T.ApiResponseListComplainCategoryResponse>(
      this.routes.getAllComplainCategories,
      { queryParams: queryParams as Record<string, string | number | boolean | undefined | null> },
    );
  }

  createComplainCategory(
    req: T.CreateComplainCategoryRequest,
  ): Observable<T.ApiResponseComplainCategoryResponse> {
    return this.request<T.ApiResponseComplainCategoryResponse>(this.routes.createComplainCategory, {
      body: req,
    });
  }

  getSubCategoriesForId(
    id: number,
    queryParams?: { pageNo?: number; pageSize?: number },
  ): Observable<T.ApiResponseListComplainCategoryResponse> {
    return this.request<T.ApiResponseListComplainCategoryResponse>(
      this.routes.getSubCategoriesForId,
      {
        pathParams: { id },
        queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
      },
    );
  }

  updateComplainCategory(
    id: number,
    req: T.UpdateComplainCategoryRequest,
  ): Observable<T.ApiResponseComplainCategoryResponse> {
    return this.request<T.ApiResponseComplainCategoryResponse>(this.routes.updateComplainCategory, {
      pathParams: { id },
      body: req,
    });
  }

  deleteComplainCategory(id: number): Observable<T.ApiResponseBoolean> {
    return this.request<T.ApiResponseBoolean>(this.routes.deleteComplainCategory, {
      pathParams: { id },
    });
  }

  getAllTreatments(
    pathParams?: {
      patientId?: number;
    },
    queryParams?: {
      pageNo?: number;
      pageSize?: number;
    },
  ): Observable<T.ApiResponseListTreatmentResponse> {
    return this.request<T.ApiResponseListTreatmentResponse>(this.routes.getAllTreatments, {
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
      pathParams: pathParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  createTreatment(req: T.CreateTreatmentRequest): Observable<T.ApiResponseTreatmentResponse> {
    return this.request<T.ApiResponseTreatmentResponse>(this.routes.createTreatment, {
      pathParams: { patientId: req.patientId },
      body: req,
    });
  }

  getTreatmentById(patientId: number, id: number): Observable<T.ApiResponseTreatmentResponse> {
    return this.request<T.ApiResponseTreatmentResponse>(this.routes.getTreatmentById, {
      pathParams: { patientId, id },
    });
  }

  updateTreatmentById(
    patientId: number,
    id: number,
    req: T.UpdateTreatmentRequest,
  ): Observable<T.ApiResponseTreatmentResponse> {
    return this.request<T.ApiResponseTreatmentResponse>(this.routes.updateTreatmentById, {
      pathParams: { patientId, id },
      body: req,
    });
  }

  deleteTreatmentById(patientId: number, id: number): Observable<void> {
    return this.request<void>(this.routes.deleteTreatmentById, { pathParams: { patientId, id } });
  }

  getAllTreatmentCategories(): Observable<T.ApiResponseListTreatmentCategoryResponse> {
    return this.request<T.ApiResponseListTreatmentCategoryResponse>(
      this.routes.getAllTreatmentCategories,
    );
  }

  createTreatmentCategory(
    req: T.CreateTreatmentCategoryRequest,
  ): Observable<T.ApiResponseTreatmentCategoryResponse> {
    return this.request<T.ApiResponseTreatmentCategoryResponse>(
      this.routes.createTreatmentCategory,
      { body: req },
    );
  }

  updateTreatmentCategoryById(
    id: number,
    req: T.UpdateTreatmentCategoryRequest,
  ): Observable<T.ApiResponseTreatmentCategoryResponse> {
    return this.request<T.ApiResponseTreatmentCategoryResponse>(
      this.routes.updateTreatmentCategoryById,
      { pathParams: { id }, body: req },
    );
  }

  deleteTreatmentCategory(id: number): Observable<T.ApiResponseBoolean> {
    return this.request<T.ApiResponseBoolean>(this.routes.deleteTreatmentCategory, {
      pathParams: { id },
    });
  }

  getAllSuggestions(
    queryParams?: {
      pageNo?: number;
      pageSize?: number;
    },
    pathParams?: { patientId: number },
  ): Observable<T.ApiResponseListSuggestionResponse> {
    return this.request<T.ApiResponseListSuggestionResponse>(this.routes.getAllSuggestions, {
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
      pathParams: pathParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  createSuggestion(
    patientId: number,
    req: T.CreateSuggestionRequest,
  ): Observable<T.ApiResponseSuggestionResponse> {
    return this.request<T.ApiResponseSuggestionResponse>(this.routes.createSuggestion, {
      body: req,
      pathParams: { patientId },
    });
  }

  getSuggestionById(patientId: number, id: number): Observable<T.ApiResponseSuggestionResponse> {
    return this.request<T.ApiResponseSuggestionResponse>(this.routes.getSuggestionById, {
      pathParams: { patientId, id },
    });
  }

  updateSuggestionById(
    patientId: number,
    id: number,
    req: T.UpdateSuggestionRequest,
  ): Observable<T.ApiResponseSuggestionResponse> {
    return this.request<T.ApiResponseSuggestionResponse>(this.routes.updateSuggestionById, {
      pathParams: { patientId, id },
      body: req,
    });
  }

  deleteSuggestionById(patientId: number, id: number): Observable<void> {
    return this.request<void>(this.routes.deleteSuggestionById, { pathParams: { patientId, id } });
  }

  getAllPayments(
    patientId: number,
    queryParams?: { pageNo?: number; pageSize?: number },
  ): Observable<T.ApiResponseListPaymentResponse> {
    return this.request<T.ApiResponseListPaymentResponse>(this.routes.getAllPayments, {
      pathParams: { patientId },
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  createPayment(
    patientId: number,
    req: T.CreatePaymentRequest,
  ): Observable<T.ApiResponsePaymentResponse> {
    return this.request<T.ApiResponsePaymentResponse>(this.routes.createPayment, {
      pathParams: { patientId },
      body: req,
    });
  }

  getPaymentById(patientId: number, id: number): Observable<T.ApiResponsePaymentResponse> {
    return this.request<T.ApiResponsePaymentResponse>(this.routes.getPaymentById, {
      pathParams: { patientId, id },
    });
  }

  updatePaymentById(
    patientId: number,
    id: number,
    req: T.UpdatePaymentRequest,
  ): Observable<T.ApiResponsePaymentResponse> {
    return this.request<T.ApiResponsePaymentResponse>(this.routes.updatePaymentById, {
      pathParams: { patientId, id },
      body: req,
    });
  }

  deletePaymentById(patientId: number, id: number): Observable<void> {
    return this.request<void>(this.routes.deletePaymentById, { pathParams: { patientId, id } });
  }

  getAllDrugDosages(queryParams?: {
    pageNo?: number;
    pageSize?: number;
  }): Observable<T.ApiResponseListDrugDosageResponse> {
    return this.request<T.ApiResponseListDrugDosageResponse>(this.routes.getAllDrugDosages, {
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  createDrugDosage(req: T.CreateDrugDosageRequest): Observable<T.ApiResponseDrugDosageResponse> {
    return this.request<T.ApiResponseDrugDosageResponse>(this.routes.createDrugDosage, {
      body: req,
    });
  }

  getDrugDosageById(id: number): Observable<T.ApiResponseDrugDosageResponse> {
    return this.request<T.ApiResponseDrugDosageResponse>(this.routes.getDrugDosageById, {
      pathParams: { id },
    });
  }

  updateDrugDosageById(
    id: number,
    req: T.UpdateDrugDosageRequest,
  ): Observable<T.ApiResponseDrugDosageResponse> {
    return this.request<T.ApiResponseDrugDosageResponse>(this.routes.updateDrugDosageById, {
      pathParams: { id },
      body: req,
    });
  }

  deleteDrugDosageById(id: number): Observable<void> {
    return this.request<void>(this.routes.deleteDrugDosageById, { pathParams: { id } });
  }

  getAllInstructions(queryParams?: {
    pageNo?: number;
    pageSize?: number;
  }): Observable<T.ApiResponseListInstructionResponse> {
    return this.request<T.ApiResponseListInstructionResponse>(this.routes.getAllInstruction, {
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  createInstruction(
    req: T.CreateInstructionRequest,
  ): Observable<T.ApiResponseInstructionResponse> {
    return this.request<T.ApiResponseInstructionResponse>(this.routes.createInstruction, {
      body: req,
    });
  }

  getInstructionById(id: number): Observable<T.ApiResponseInstructionResponse> {
    return this.request<T.ApiResponseInstructionResponse>(this.routes.getInstructionById, {
      pathParams: { id },
    });
  }

  updateInstructionById(
    id: number,
    req: T.UpdateInstructionRequest,
  ): Observable<T.ApiResponseInstructionResponse> {
    return this.request<T.ApiResponseInstructionResponse>(this.routes.updateInstructionById, {
      pathParams: { id },
      body: req,
    });
  }

  deleteInstructionById(id: number): Observable<void> {
    return this.request<void>(this.routes.deleteInstructionById, { pathParams: { id } });
  }

  getAllUsers(queryParams?: {
    pageNo?: number;
    pageSize?: number;
  }): Observable<T.ApiResponseListUserResponse> {
    return this.request<T.ApiResponseListUserResponse>(this.routes.getAllUsers, {
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  createUser(req: T.CreateUserRequest): Observable<T.ApiResponseUserResponse> {
    return this.request<T.ApiResponseUserResponse>(this.routes.createUser, { body: req });
  }

  getUserById(id: number): Observable<T.ApiResponseUserResponse> {
    return this.request<T.ApiResponseUserResponse>(this.routes.getUserById, { pathParams: { id } });
  }

  updateUserById(id: number, req: T.UpdateUserRequest): Observable<T.ApiResponseUserResponse> {
    return this.request<T.ApiResponseUserResponse>(this.routes.updateUserById, {
      pathParams: { id },
      body: req,
    });
  }

  deleteUserById(id: number): Observable<void> {
    return this.request<void>(this.routes.deleteUserById, { pathParams: { id } });
  }

  getAllFiles(queryParams?: {
    pageNo?: number;
    pageSize?: number;
  }): Observable<T.ApiResponseListFileResponse> {
    return this.request<T.ApiResponseListFileResponse>(this.routes.getAllFiles, {
      queryParams: queryParams as Record<string, string | number | boolean | undefined | null>,
    });
  }

  createFile(req: T.CreateFileRequest): Observable<T.ApiResponseFileResponse> {
    return this.request<T.ApiResponseFileResponse>(this.routes.createFile, { body: req });
  }

  getFileById(id: number): Observable<T.ApiResponseFileResponse> {
    return this.request<T.ApiResponseFileResponse>(this.routes.getFileById, { pathParams: { id } });
  }

  updateFileById(id: number, req: T.UpdateFileRequest): Observable<T.ApiResponseFileResponse> {
    return this.request<T.ApiResponseFileResponse>(this.routes.updateFileById, {
      pathParams: { id },
      body: req,
    });
  }

  deleteFileById(id: number): Observable<void> {
    return this.request<void>(this.routes.deleteFileById, { pathParams: { id } });
  }

  uploadFile(patientId: number, file: File): Observable<T.ApiResponseFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<T.ApiResponseFileResponse>(this.routes.uploadFile, {
      pathParams: {},
      queryParams: { patientId },
      body: formData,
    });
  }

  getFileByPatientId(patientId: number): Observable<T.ApiResponseFileResponse> {
    return this.request<T.ApiResponseFileResponse>(this.routes.getFileByPatientId, {
      pathParams: { patientId },
    });
  }

  downloadPdf(patientId: number): Observable<Blob> {
    return this.request<Blob>(this.routes.downloadPdf, {
      pathParams: { patientId },
      responseType: 'blob',
    });
  }

  getReceiptPdfUrl(id: number): string {
    return this.routes.getReceiptPdf.buildUrl(this.baseUrl, { id });
  }

  getPatientPdfUrl(patientId: number): string {
    return this.routes.getPatientPdf.buildUrl(this.baseUrl, { patientId });
  }

  getForm3CPdfUrl(fromDate: string, toDate: string, doctorId?: number): string {
    const queryParams =
      doctorId !== undefined ? { fromDate, toDate, doctorId } : { fromDate, toDate };
    return this.routes.getForm3CPdf.buildUrl(this.baseUrl, undefined, queryParams);
  }
}
