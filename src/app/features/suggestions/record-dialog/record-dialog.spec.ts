import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { RecordDialogSuggestion } from './record-dialog';
import { PatientRecordsService } from '../../patients/patient-records.service';

describe('RecordDialogSuggestion', () => {
  let component: RecordDialogSuggestion;
  let fixture: ComponentFixture<RecordDialogSuggestion>;
  let mockDialogRef: any;
  let mockRecordsService: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };
    mockRecordsService = {
      addSuggestion: vi.fn().mockReturnValue(of({ id: 1 })),
      updateSuggestion: vi.fn().mockReturnValue(of({ id: 1 }))
    };

    await TestBed.configureTestingModule({
      imports: [RecordDialogSuggestion, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { patientId: 1 } },
        { provide: PatientRecordsService, useValue: mockRecordsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDialogSuggestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form and save on submit', () => {
    component.suggestionForm.patchValue({
      date: '2026-06-18',
      type: 'Avoid Water Exposure',
      details: 'Keep ear dry',
      cost: 0,
      status: 'ACTIVE'
    });
    expect(component.suggestionForm.valid).toBe(true);
    component.onSubmit();
    expect(mockRecordsService.addSuggestion).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
