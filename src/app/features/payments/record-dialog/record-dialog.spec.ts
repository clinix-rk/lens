import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { RecordDialogPayment } from './record-dialog';
import { PatientRecordsService } from '../../patients/patient-records.service';

describe('RecordDialogPayment', () => {
  let component: RecordDialogPayment;
  let fixture: ComponentFixture<RecordDialogPayment>;
  let mockDialogRef: any;
  let mockRecordsService: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };
    mockRecordsService = {
      addPayment: vi.fn().mockReturnValue(of({ id: 1 })),
      updatePayment: vi.fn().mockReturnValue(of({ id: 1 }))
    };

    await TestBed.configureTestingModule({
      imports: [RecordDialogPayment, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { patientId: 1 } },
        { provide: PatientRecordsService, useValue: mockRecordsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDialogPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form and save on submit', () => {
    component.paymentForm.patchValue({
      amount: 500,
      method: 'ONLINE',
      referenceName: 'Google Pay'
    });
    expect(component.paymentForm.valid).toBe(true);
    component.onSubmit();
    expect(mockRecordsService.addPayment).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
