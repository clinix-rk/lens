import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { DoctorDialog } from './doctor-dialog';
import { DoctorService } from '../doctor.service';

describe('DoctorDialog', () => {
  let component: DoctorDialog;
  let fixture: ComponentFixture<DoctorDialog>;
  let mockDoctorService: any;
  let mockDialogRef: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDoctorService = {
      addDoctor: vi.fn().mockReturnValue(of({
        success: true,
        data: { id: 10, name: 'Dr. New Smith', caseNoPrefix: 'NS' }
      })),
      updateDoctorById: vi.fn().mockReturnValue(of({
        success: true,
        data: { id: 1, name: 'Dr. Connor Updated', caseNoPrefix: 'SC' }
      }))
    };

    mockDialogRef = {
      close: vi.fn()
    };
  });

  describe('Add Mode', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [DoctorDialog, NoopAnimationsModule, ReactiveFormsModule],
        providers: [
          { provide: DoctorService, useValue: mockDoctorService },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: null }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(DoctorDialog);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create in add mode', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode()).toBeFalsy();
    });

    it('should submit new doctor when valid', () => {
      component.doctorForm.patchValue({
        name: 'Dr. New Smith',
        caseNoPrefix: 'NS'
      });

      component.onSubmit();
      expect(mockDoctorService.addDoctor).toHaveBeenCalledWith({
        name: 'Dr. New Smith',
        caseNoPrefix: 'NS'
      });
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [DoctorDialog, NoopAnimationsModule, ReactiveFormsModule],
        providers: [
          { provide: DoctorService, useValue: mockDoctorService },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { doctor: { id: 1, name: 'Dr. Connor', caseNoPrefix: 'SC' } } }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(DoctorDialog);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create in edit mode with disabled prefix', () => {
      expect(component).toBeTruthy();
      expect(component.isEditMode()).toBeTruthy();
      expect(component.doctorForm.get('caseNoPrefix')?.disabled).toBeTruthy();
    });

    it('should submit updated name when valid', () => {
      component.doctorForm.patchValue({
        name: 'Dr. Connor Updated'
      });

      component.onSubmit();
      expect(mockDoctorService.updateDoctorById).toHaveBeenCalledWith(1, {
        name: 'Dr. Connor Updated'
      });
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});
