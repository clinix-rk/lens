import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { PatientInfoDialog } from './patient-info-dialog';
import { PatientService } from '../../patient.service';
import { PatientResponse } from '../../patient.model';

describe('PatientInfoDialog', () => {
  let component: PatientInfoDialog;
  let fixture: ComponentFixture<PatientInfoDialog>;
  let mockPatientService: any;

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

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockPatientService = {
      updatePatientById: vi.fn().mockReturnValue(of({
        success: true,
        data: { ...mockPatient, name: 'Alexander Graham Updated' }
      })),
      getAvailableMedicalConditions: vi.fn().mockReturnValue(of(['Hypertension', 'Tinnitus'])),
      getAvailableDrugAllergies: vi.fn().mockReturnValue(of(['Penicillin', 'Sulfa Drugs']))
    };

    await TestBed.configureTestingModule({
      imports: [PatientInfoDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockPatient },
        { provide: PatientService, useValue: mockPatientService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientInfoDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with patient data', () => {
    const form = component.patientForm;
    expect(form.get('name')?.value).toBe('Alexander Graham');
    expect(form.get('gender')?.value).toBe('MALE');
    expect(form.get('primaryPhone')?.value).toBe('+1234567890');
    expect(form.get('drugAllergies')?.value).toBe('Penicillin');
  });

  it('should toggle edit mode', () => {
    expect(component.isEditMode()).toBeFalsy();
    component.toggleEditMode();
    expect(component.isEditMode()).toBeTruthy();
    component.toggleEditMode();
    expect(component.isEditMode()).toBeFalsy();
  });

  it('should update patient and switch back to view mode on submit when valid', () => {
    component.toggleEditMode();
    component.patientForm.patchValue({
      name: 'Alexander Graham Updated'
    });
    component.onSubmit();
    
    expect(mockPatientService.updatePatientById).toHaveBeenCalledWith(1, expect.any(Object));
    expect(component.patient().name).toBe('Alexander Graham Updated');
    expect(component.isEditMode()).toBeFalsy();
  });

  it('should allow adding custom conditions dynamically', () => {
    expect(component.availableConditions()).toContain('Hypertension');
    expect(component.availableConditions()).not.toContain('Lactose Intolerance');

    component.onConditionAdded('Lactose Intolerance');
    expect(component.availableConditions()).toContain('Lactose Intolerance');
  });

  it('should allow adding custom drug allergies dynamically', () => {
    expect(component.availableAllergies()).toContain('Penicillin');
    expect(component.availableAllergies()).not.toContain('Lactose Allergy');

    component.onAllergyAdded('Lactose Allergy');
    expect(component.availableAllergies()).toContain('Lactose Allergy');
  });
});
