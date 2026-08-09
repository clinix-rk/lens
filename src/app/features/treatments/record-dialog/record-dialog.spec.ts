import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { RecordDialogTreatment } from './record-dialog';
import { PatientRecordsService } from '../../patients/patient-records.service';

describe('RecordDialogTreatment', () => {
  let component: RecordDialogTreatment;
  let fixture: ComponentFixture<RecordDialogTreatment>;
  let mockDialogRef: any;
  let mockRecordsService: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };
    mockRecordsService = {
      addTreatment: vi.fn().mockReturnValue(of({ id: 1 })),
      updateTreatment: vi.fn().mockReturnValue(of({ id: 1 }))
    };

    await TestBed.configureTestingModule({
      imports: [RecordDialogTreatment, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { patientId: 1 } },
        { provide: PatientRecordsService, useValue: mockRecordsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDialogTreatment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form and save on submit', () => {
    component.treatmentForm.patchValue({
      date: '2026-06-18',
      type: 'Cerumen Irrigation',
      details: 'Ear wax cleared successfully'
    });
    expect(component.treatmentForm.valid).toBe(true);
    component.onSubmit();
    expect(mockRecordsService.addTreatment).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
