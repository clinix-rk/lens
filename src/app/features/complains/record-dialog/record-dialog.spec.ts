import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { RecordDialogComplain } from './record-dialog';
import { PatientRecordsService } from '../../patients/patient-records.service';

describe('RecordDialogComplain', () => {
  let component: RecordDialogComplain;
  let fixture: ComponentFixture<RecordDialogComplain>;
  let mockDialogRef: any;
  let mockRecordsService: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };
    mockRecordsService = {
      addComplain: vi.fn().mockReturnValue(of({ id: 1 })),
      updateComplain: vi.fn().mockReturnValue(of({ id: 1 }))
    };

    await TestBed.configureTestingModule({
      imports: [RecordDialogComplain, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { patientId: 1 } },
        { provide: PatientRecordsService, useValue: mockRecordsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDialogComplain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with defaults in add mode', () => {
    expect(component.isEditMode).toBe(false);
    expect(component.complainForm.get('type')?.value).toBe('');
  });

  it('should validate form and save on submit', () => {
    component.complainForm.patchValue({
      date: '2026-06-18',
      type: 'Ear Pain',
      details: 'Hurts a lot'
    });
    expect(component.complainForm.valid).toBe(true);
    component.onSubmit();
    expect(mockRecordsService.addComplain).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
