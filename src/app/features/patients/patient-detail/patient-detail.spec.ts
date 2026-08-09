import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PatientDetail } from './patient-detail';
import { PatientService } from '../patient.service';
import { PatientResponse } from '../patient.model';

describe('PatientDetail', () => {
  let component: PatientDetail;
  let fixture: ComponentFixture<PatientDetail>;
  
  const mockPatient: PatientResponse = {
    id: 1,
    caseNo: 'H11',
    name: 'Alexander Graham',
    dateOfBirth: '1981-06-12',
    gender: 'MALE',
    phoneNumbers: [
      { id: 101, phoneNumber: '+1234567890', type: 'PRIMARY', createdAt: '', updatedAt: '' }
    ],
    medicalConditions: ['Hypertension'],
    drugAllergies: ['Penicillin'],
    createdAt: '',
    updatedAt: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'id') return '1';
                  return null;
                }
              }
            }
          }
        },
        {
          provide: PatientService,
          useValue: {
            getPatientById: (id: number) => of({
              success: true,
              message: 'Success',
              data: mockPatient,
              meta: { timestamp: '' }
            }),
            getPatientFile: (id: number) => of({
              success: true,
              message: 'Success',
              data: null,
              meta: { timestamp: '' }
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract the patient ID and fetch details to render in the template', () => {
    expect(component.patientId()).toBe('1');
    expect(component.patient()?.name).toBe('Alexander Graham');
    
    const compiled = fixture.nativeElement as HTMLElement;
    const nameEl = compiled.querySelector('.patient-name');
    expect(nameEl?.textContent?.trim()).toBe('Alexander Graham');
  });
});

