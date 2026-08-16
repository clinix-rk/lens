import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Finances } from './finances';
import { PatientRecordsService } from '../patients/patient-records.service';
import { DoctorService } from '../doctors/doctor.service';
import { PdfService } from '../../core/services/pdf.service';
import { RecordDialogPayment } from '../payments/record-dialog/record-dialog';

describe('Finances', () => {
  let component: Finances;
  let fixture: ComponentFixture<Finances>;
  let mockRecordsService: {
    getFinances: ReturnType<typeof vi.fn>;
  };
  let mockDoctorService: {
    getDoctors: ReturnType<typeof vi.fn>;
  };
  let mockPdfService: {
    openFinanceForm25Pdf: ReturnType<typeof vi.fn>;
    openFinanceForm25SummaryPdf: ReturnType<typeof vi.fn>;
  };
  let mockDialog: {
    open: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockRecordsService = {
      getFinances: vi.fn().mockReturnValue(of({
        success: true,
        message: '',
        meta: { timestamp: '2026-06-19T00:00:00Z' },
        data: {
          items: [
            {
              id: 5,
              patientId: 10,
              caseNo: 'H11',
              date: '2026-06-11',
              patientName: 'Alexander Graham',
              treatmentDetails: 'Consultation',
              amount: 500,
              method: 'CASH',
              receivedDate: '2026-06-12',
              receiptNo: 'R-401',
            }
          ],
          pageNumber: 0,
          pageSize: 10,
          totalElements: 1,
          totalPages: 1,
          isLast: true
        }
      })),
    };

    mockDoctorService = {
      getDoctors: vi.fn().mockReturnValue(of([
        { id: 1, name: 'Dr. Smith' },
        { id: 2, name: 'Dr. Jones' },
      ])),
    };

    mockPdfService = {
      openFinanceForm25Pdf: vi.fn(),
      openFinanceForm25SummaryPdf: vi.fn(),
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(null) }),
    };

    await TestBed.configureTestingModule({
      imports: [Finances, NoopAnimationsModule],
      providers: [
        provideNativeDateAdapter(),
        { provide: PatientRecordsService, useValue: mockRecordsService },
        { provide: DoctorService, useValue: mockDoctorService },
        { provide: PdfService, useValue: mockPdfService },
        { provide: MatDialog, useValue: mockDialog },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Finances);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load doctors on init and not fetch finances until filters are valid', () => {
    expect(mockDoctorService.getDoctors).toHaveBeenCalled();
    expect(mockRecordsService.getFinances).not.toHaveBeenCalled();
    expect(component.rows().length).toBe(0);
  });

  it('should fetch finances when doctor and date range are set', () => {
    component.selectedDoctorId.set(1);
    component.startDate.set(new Date('2026-06-10'));
    component.endDate.set(new Date('2026-06-12'));
    component.onFilterChange();

    expect(mockRecordsService.getFinances).toHaveBeenCalledWith(
      1,
      10,
      '2026-06-10',
      '2026-06-12',
      1,
      'ALL'
    );
    expect(component.rows().length).toBe(1);
    expect(component.rows()[0].patientName).toBe('Alexander Graham');
  });

  it('should include payment method when not ALL', () => {
    component.selectedDoctorId.set(1);
    component.startDate.set(new Date('2026-06-10'));
    component.endDate.set(new Date('2026-06-12'));
    component.selectedMethod.set('CASH');
    component.onFilterChange();

    expect(mockRecordsService.getFinances).toHaveBeenCalledWith(
      1,
      10,
      '2026-06-10',
      '2026-06-12',
      1,
      'CASH'
    );
  });


  it('should not fetch when only doctor is selected', () => {
    component.selectedDoctorId.set(1);
    component.onFilterChange();
    expect(mockRecordsService.getFinances).not.toHaveBeenCalled();
  });

  it('should reset filters without fetching', () => {
    component.selectedDoctorId.set(1);
    component.startDate.set(new Date('2026-06-10'));
    component.endDate.set(new Date('2026-06-12'));
    component.onFilterChange();
    mockRecordsService.getFinances.mockClear();

    component.resetFilters();
    expect(component.selectedDoctorId()).toBeNull();
    expect(component.rows().length).toBe(0);
    expect(mockRecordsService.getFinances).not.toHaveBeenCalled();
  });

  it('should open payment edit dialog from finance row', () => {
    const row = {
      id: 5,
      patientId: 10,
      caseNo: 'H11',
      date: '2026-06-11',
      patientName: 'Alexander Graham',
      treatmentDetails: 'Consultation',
      amount: 500,
      method: 'CASH',
      receivedDate: '2026-06-12',
      receiptNo: 'R-401',
    };
    component.onEdit(row);

    expect(mockDialog.open).toHaveBeenCalledWith(
      RecordDialogPayment,
      expect.objectContaining({
        data: expect.objectContaining({
          patientId: 10,
          payment: expect.objectContaining({
            id: 5,
            treatmentDetails: 'Consultation',
            receivedDate: '2026-06-12',
          }),
        }),
      })
    );
  });

  it('should generate form 25 pdf with current filters', () => {
    component.selectedDoctorId.set(1);
    component.startDate.set(new Date('2026-06-10'));
    component.endDate.set(new Date('2026-06-12'));
    component.selectedMethod.set('CASH');

    component.onGenerateForm25();

    expect(mockPdfService.openFinanceForm25Pdf).toHaveBeenCalledWith({
      startDate: '2026-06-10',
      endDate: '2026-06-12',
      doctorId: 1,
      paymentMethod: 'CASH',
    });
  });

  it('should generate form 25 summary pdf with current filters', () => {
    component.selectedDoctorId.set(2);
    component.startDate.set(new Date('2026-06-01'));
    component.endDate.set(new Date('2026-06-30'));
    component.selectedMethod.set('ALL');

    component.onGenerateSummary();

    expect(mockPdfService.openFinanceForm25SummaryPdf).toHaveBeenCalledWith({
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      doctorId: 2,
      paymentMethod: 'ALL',
    });
  });

  it('should not generate pdfs when filters are incomplete', () => {
    component.selectedDoctorId.set(1);
    component.onGenerateForm25();
    component.onGenerateSummary();

    expect(mockPdfService.openFinanceForm25Pdf).not.toHaveBeenCalled();
    expect(mockPdfService.openFinanceForm25SummaryPdf).not.toHaveBeenCalled();
  });
});
