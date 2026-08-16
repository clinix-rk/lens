import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { RecordDialogPrescription } from './record-dialog';
import { PatientRecordsService } from '../../patients/patient-records.service';
import { MedicineLibraryService } from '../../../shared/services/medicine-library.service';
import { DrugDosageService } from '../drug-dosage.service';
import { InstructionCatalogService } from '../instruction-catalog.service';

import { provideNativeDateAdapter } from '@angular/material/core';

describe('RecordDialogPrescription', () => {
  let component: RecordDialogPrescription;
  let fixture: ComponentFixture<RecordDialogPrescription>;
  let mockDialogRef: any;
  let mockRecordsService: any;
  let mockMedicineLibrary: any;
  let mockDrugDosageService: any;
  let mockInstructionService: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };
    mockRecordsService = {
      addPrescription: vi.fn().mockReturnValue(of({ id: 1 })),
      updatePrescription: vi.fn().mockReturnValue(of({ id: 1 }))
    };

    mockMedicineLibrary = {
      getAllMedicines: vi.fn().mockReturnValue(of([
        { id: 101, name: 'Paracetamol 500mg', type: 'Tablet', defaultInstructions: 'Take once daily' }
      ])),
      getNames: vi.fn().mockReturnValue(['Paracetamol 500mg']),
      findByName: vi.fn().mockReturnValue({
        id: 101,
        name: 'Paracetamol 500mg',
        type: 'Tablet',
        defaultInstructions: 'Take once daily'
      })
    };

    mockDrugDosageService = {
      getAllDosages: vi.fn().mockReturnValue(of({
        success: true,
        data: {
          items: [{ id: 201, dosage: '1 tablet' }]
        }
      }))
    };

    mockInstructionService = {
      getAllInstructions: vi.fn().mockReturnValue(of({
        success: true,
        data: {
          items: [{ id: 301, instruction: 'Take once daily' }]
        }
      })),
      createInstruction: vi.fn().mockReturnValue(of({
        success: true,
        data: { id: 302, instruction: 'New instruction' }
      }))
    };

    await TestBed.configureTestingModule({
      imports: [RecordDialogPrescription, NoopAnimationsModule],
      providers: [
        provideNativeDateAdapter(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { patientId: 1 } },
        { provide: PatientRecordsService, useValue: mockRecordsService },
        { provide: MedicineLibraryService, useValue: mockMedicineLibrary },
        { provide: DrugDosageService, useValue: mockDrugDosageService },
        { provide: InstructionCatalogService, useValue: mockInstructionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDialogPrescription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a medicine row by default', () => {
    expect(component.medicines().length).toBe(1);
  });

  it('should update medicine field correctly', () => {
    component.prescriptionDate.set(new Date('2026-06-18'));
    component.prescriptionDetails.set('Follow for 5 days');
    component.onMedicineSelected(0, { id: 101, name: 'Paracetamol 500mg' });
    component.onDosageSelected(0, 201);
    component.onInstructionSelected(0, { id: 301, instruction: 'Take once daily' });
    component.updateQuantity(0, 2);

    const medicine = component.medicines()[0];
    expect(medicine.medicineId).toBe(101);
    expect(medicine.medicineName).toBe('Paracetamol 500mg');
    expect(medicine.dosageId).toBe(201);
    expect(medicine.dosageDisplay).toBe('1 tablet');
    expect(medicine.instructionId).toBe(301);
    expect(medicine.instructionDisplay).toBe('Take once daily');
    expect(medicine.quantity).toBe(2);
  });

  it('should validate form correctly', () => {
    component.prescriptionDate.set(new Date());
    component.prescriptionDetails.set('Follow for 5 days');
    component.onMedicineSelected(0, { id: 101, name: 'Paracetamol 500mg' });
    component.onDosageSelected(0, 201);
    component.updateQuantity(0, 1);

    expect(component.isFormValid()).toBe(true);
  });

  it('should call addPrescription on submit', () => {
    component.prescriptionDate.set(new Date('2026-06-18'));
    component.prescriptionDetails.set('Follow for 5 days');
    component.onMedicineSelected(0, { id: 101, name: 'Paracetamol 500mg' });
    component.onDosageSelected(0, 201);
    component.updateQuantity(0, 2);

    component.onSubmit();
    expect(mockRecordsService.addPrescription).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should include instructions in addPrescription payload', () => {
    component.prescriptionDate.set(new Date('2026-06-18'));
    component.prescriptionDetails.set('Follow for 5 days');
    component.onMedicineSelected(0, { id: 101, name: 'Paracetamol 500mg' });
    component.onDosageSelected(0, 201);
    component.onInstructionSelected(0, { id: 301, instruction: 'Take once daily' });
    component.updateQuantity(0, 2);

    component.onSubmit();

    expect(mockRecordsService.addPrescription).toHaveBeenCalledWith(expect.objectContaining({
      medicines: [
        expect.objectContaining({
          instructionId: 301,
          instructions: 'Take once daily'
        })
      ]
    }));
  });

  it('should validate form and submit without dosage', () => {
    component.prescriptionDate.set(new Date('2026-06-18'));
    component.prescriptionDetails.set('Follow for 5 days');
    component.onMedicineSelected(0, { id: 101, name: 'Paracetamol 500mg' });
    component.updateQuantity(0, 1);

    expect(component.isFormValid()).toBe(true);

    component.onSubmit();

    expect(mockRecordsService.addPrescription).toHaveBeenCalledWith(expect.objectContaining({
      medicines: [
        expect.objectContaining({
          medicineId: 101,
          quantity: 1
        })
      ]
    }));
    const submittedMedicine = mockRecordsService.addPrescription.mock.calls[0][0].medicines[0];
    expect(submittedMedicine.dosageId).toBeUndefined();
  });

  it('should remove a medicine row', () => {
    component.addMedicineRow();
    expect(component.medicines().length).toBe(2);
    component.removeMedicineRow(0);
    expect(component.medicines().length).toBe(1);
  });
});
