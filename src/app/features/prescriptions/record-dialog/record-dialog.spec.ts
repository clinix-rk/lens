import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { RecordDialogPrescription } from './record-dialog';
import { PatientRecordsService } from '../../patients/patient-records.service';
import { MedicineLibraryService } from '../../../shared/services/medicine-library.service';
import { DrugDosageService } from '../drug-dosage.service';

describe('RecordDialogPrescription', () => {
  let component: RecordDialogPrescription;
  let fixture: ComponentFixture<RecordDialogPrescription>;
  let mockDialogRef: any;
  let mockRecordsService: any;
  let mockMedicineLibrary: any;
  let mockDrugDosageService: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };
    mockRecordsService = {
      addPrescription: vi.fn().mockReturnValue(of({ id: 1 })),
      updatePrescription: vi.fn().mockReturnValue(of({ id: 1 }))
    };

    mockMedicineLibrary = {
      getNames: vi.fn().mockReturnValue(['Paracetamol 500mg']),
      findByName: vi.fn().mockReturnValue({
        name: 'Paracetamol 500mg',
        defaultDosages: ['1 tablet'],
        defaultInstructions: 'Take once daily'
      }),
      addToLibrary: vi.fn(),
      getAll: vi.fn().mockReturnValue([{
        name: 'Paracetamol 500mg',
        defaultDosages: ['1 tablet'],
        defaultInstructions: 'Take once daily'
      }])
    };

    mockDrugDosageService = {
      getAllDosages: vi.fn().mockReturnValue(of({
        success: true,
        data: {
          items: [{ dosage: '1 tablet' }]
        }
      }))
    };

    await TestBed.configureTestingModule({
      imports: [RecordDialogPrescription, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { patientId: 1 } },
        { provide: PatientRecordsService, useValue: mockRecordsService },
        { provide: MedicineLibraryService, useValue: mockMedicineLibrary },
        { provide: DrugDosageService, useValue: mockDrugDosageService }
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
    component.updateMedicineField(0, 'name', 'Paracetamol 500mg');
    component.updateMedicineField(0, 'dosage', '1 tablet');
    component.updateMedicineField(0, 'instructions', 'Take once daily');
    component.updateMedicineField(0, 'quantity', 2);

    const medicine = component.medicines()[0];
    expect(medicine.name).toBe('Paracetamol 500mg');
    expect(medicine.dosage).toBe('1 tablet');
    expect(medicine.instructions).toBe('Take once daily');
    expect(medicine.quantity).toBe(2);
  });

  it('should validate form correctly', () => {
    component.prescriptionDate.set(new Date());
    component.prescriptionDetails.set('Follow for 5 days');
    component.updateMedicineField(0, 'name', 'Paracetamol 500mg');
    component.updateMedicineField(0, 'dosage', '1 tablet');
    component.updateMedicineField(0, 'quantity', 1);

    expect(component.isFormValid()).toBe(true);
  });

  it('should call addPrescription on submit', () => {
    component.prescriptionDate.set(new Date('2026-06-18'));
    component.prescriptionDetails.set('Follow for 5 days');
    component.updateMedicineField(0, 'name', 'Paracetamol 500mg');
    component.updateMedicineField(0, 'dosage', '1 tablet');
    component.updateMedicineField(0, 'quantity', 2);

    component.onSubmit();
    expect(mockRecordsService.addPrescription).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should remove a medicine row', () => {
    component.addMedicineRow();
    expect(component.medicines().length).toBe(2);
    component.removeMedicineRow(0);
    expect(component.medicines().length).toBe(1);
  });
});
