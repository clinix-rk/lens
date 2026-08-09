import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AddPatientDialog } from './add-patient-dialog';
import { PatientService } from '../patient.service';
import { DoctorService } from '../../doctors/doctor.service';


describe('AddPatientDialog', () => {
  let component: AddPatientDialog;
  let fixture: ComponentFixture<AddPatientDialog>;
  let mockPatientService: any;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockPatientService = {
      addPatient: vi.fn().mockReturnValue(of({
        success: true,
        data: { id: 99, name: 'New Patient', caseNo: 'H99' }
      })),
      getAvailableMedicalConditions: vi.fn().mockReturnValue(of(['Hypertension', 'Asthma'])),
      getAvailableDrugAllergies: vi.fn().mockReturnValue(of(['Penicillin']))
    };

    const mockDoctorService = {
      getDoctors: vi.fn().mockReturnValue(of([
        { id: 1, name: 'Dr. Sarah Connor', specialty: 'Cardiologist' }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [AddPatientDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: PatientService, useValue: mockPatientService },
        { provide: DoctorService, useValue: mockDoctorService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddPatientDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an invalid form', () => {
    expect(component.patientForm.valid).toBeFalsy();
  });

  it('should validate name, date of birth, gender, primary phone, and doctor selection as required', () => {
    const form = component.patientForm;
    expect(form.get('doctorId')?.valid).toBeFalsy();
    expect(form.get('name')?.valid).toBeFalsy();
    expect(form.get('dateOfBirth')?.valid).toBeFalsy();
    expect(form.get('gender')?.valid).toBeFalsy();
    expect(form.get('primaryPhone')?.valid).toBeFalsy();

    form.patchValue({
      doctorId: '1',
      name: 'Test Patient',
      dateOfBirth: '2000-01-01',
      gender: 'MALE',
      primaryPhone: '+1234567890'
    });

    expect(form.valid).toBeTruthy();
  });

  it('should close the dialog with patient data on submit when form is valid', () => {
    component.patientForm.patchValue({
      doctorId: '1',
      name: 'Test Patient',
      dateOfBirth: '2000-01-01',
      gender: 'MALE',
      primaryPhone: '+1234567890'
    });

    component.onSubmit();

    expect(mockPatientService.addPatient).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ id: 99, name: 'New Patient', caseNo: 'H99' });
  });

  it('should not submit and should mark all as touched if form is invalid', () => {
    component.onSubmit();
    expect(mockPatientService.addPatient).not.toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
    expect(component.patientForm.touched).toBeTruthy();
  });
});
