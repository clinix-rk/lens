import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { PrintDetailsDialog } from './print-details-dialog';

describe('PrintDetailsDialog', () => {
  let component: PrintDetailsDialog;
  let fixture: ComponentFixture<PrintDetailsDialog>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PrintDetailsDialog],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    }).compileComponents();

    fixture = TestBed.createComponent(PrintDetailsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close with none when proceeding without details', () => {
    component.onProceedWithoutDetails();
    expect(dialogRef.close).toHaveBeenCalledWith({ referralType: 'none' });
  });

  it('should require treatment detail before generate', () => {
    component.onGenerate();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.form.controls.treatmentDetail.touched).toBe(true);
  });

  it('should close with standard referral when generate succeeds', () => {
    component.form.setValue({
      doctorName: 'Dr. Smith',
      treatmentDetail: 'Root canal',
      extendedVersion: false,
    });

    component.onGenerate();

    expect(dialogRef.close).toHaveBeenCalledWith({
      referralType: 'standard',
      doctorName: 'Dr. Smith',
      treatmentDetail: 'Root canal',
    });
  });

  it('should close with extended referral when checkbox is checked', () => {
    component.form.setValue({
      doctorName: 'Dr. Smith',
      treatmentDetail: 'Root canal',
      extendedVersion: true,
    });

    component.onGenerate();

    expect(dialogRef.close).toHaveBeenCalledWith({
      referralType: 'extended',
      doctorName: 'Dr. Smith',
      treatmentDetail: 'Root canal',
    });
  });
});
