import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { PatientService } from './patient.service';
import { CreatePatientRequest } from './patient.model';
import { ApiClientService } from '../../core/api/api-client.service';

describe('PatientService', () => {
  let service: PatientService;
  let mockApiClient: Partial<ApiClientService>;

  const mockPatient = {
    id: 2,
    caseNo: 'H12',
    name: 'Elena Rostova',
    phoneNumbers: [{ id: 102, phoneNumber: '+1987654321', type: 'PRIMARY' as const, createdAt: '', updatedAt: '' }],
    medicalConditions: ['Hypothyroidism'],
    drugAllergies: [],
    createdAt: '',
    updatedAt: ''
  };

  beforeEach(() => {
    mockApiClient = {
      searchPatients: (params) => of({
        success: true,
        message: 'Success',
        data: [mockPatient],
        pagination: { page: 0, pageSize: 10, totalElements: 1, totalPages: 1, hasNext: false, hasPrevious: false },
        timestamp: new Date().toISOString()
      }),
      getPatientById: (id) => of({
        success: true,
        message: 'Success',
        data: mockPatient,
        timestamp: new Date().toISOString()
      }),
      addPatient: (req) => of({
        success: true,
        message: 'Saved',
        data: { ...mockPatient, id: 26, caseNo: 'H26', name: req.name },
        timestamp: new Date().toISOString()
      })
    };

    TestBed.configureTestingModule({
      providers: [
        PatientService,
        { provide: ApiClientService, useValue: mockApiClient }
      ]
    });
    service = TestBed.inject(PatientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return paginated patient list via ApiClientService', async () => {
    const res = await firstValueFrom(service.searchPatients(1, 10));
    expect(res.success).toBe(true);
    expect(res.data.items.length).toBe(1);
    expect(res.data.items[0].name).toBe('Elena Rostova');
  });

  it('should fetch patient by ID', async () => {
    const res = await firstValueFrom(service.getPatientById(2));
    expect(res.data.name).toBe('Elena Rostova');
  });

  it('should add a new patient', async () => {
    const newPatient: CreatePatientRequest = {
      doctorId: 1,
      name: 'New Patient',
      dateOfBirth: '1999-12-31',
      gender: 'OTHER',
      phoneNumbers: [{ phoneNumber: '+1999999999', type: 'PRIMARY' }],
      medicalConditions: ['Healthy'],
      drugAllergies: []
    };

    const res = await firstValueFrom(service.addPatient(newPatient));
    expect(res.success).toBe(true);
    expect(res.data.name).toBe('New Patient');
  });
});
