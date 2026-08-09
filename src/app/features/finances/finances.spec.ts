import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Finances } from './finances';
import { PatientRecordsService } from '../patients/patient-records.service';
import { ConfirmationService } from '../../core/services/confirmation.service';

describe('Finances', () => {
  let component: Finances;
  let fixture: ComponentFixture<Finances>;
  let mockRecordsService: any;
  let mockDialog: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockRecordsService = {
      getAllPayments: vi.fn().mockReturnValue(of({
        success: true,
        data: {
          items: [
            {
              id: 401,
              patientId: 1,
              amount: 500,
              method: 'CASH',
              referenceName: 'Initial Consultation Fee',
              date: '2026-06-11',
              createdAt: '2026-06-19T00:00:00Z',
              updatedAt: '2026-06-19T00:00:00Z',
              patientName: 'Alexander Graham',
              patientCaseNo: 'H11'
            }
          ],
          pageNumber: 0,
          pageSize: 10,
          totalElements: 1,
          totalPages: 1,
          isLast: true
        }
      })),
      deletePayment: vi.fn().mockReturnValue(of(undefined))
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of(true))
      })
    };

    const mockConfirmationService = {
      confirm: vi.fn().mockReturnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [Finances, NoopAnimationsModule],
      providers: [
        { provide: PatientRecordsService, useValue: mockRecordsService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Finances);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load payments on init', () => {
    expect(mockRecordsService.getAllPayments).toHaveBeenCalledWith(1, 10, '', 'ALL', undefined, undefined);
    expect(component.payments().length).toBe(1);
    expect(component.payments()[0].patientName).toBe('Alexander Graham');
  });

  it('should filter payments when query changes', () => {
    component.searchQuery.set('Alexander');
    component.onFilterChange();
    expect(mockRecordsService.getAllPayments).toHaveBeenCalledWith(1, 10, 'Alexander', 'ALL', undefined, undefined);
  });

  it('should filter payments when method changes', () => {
    component.selectedMethod.set('CASH');
    component.onFilterChange();
    expect(mockRecordsService.getAllPayments).toHaveBeenCalledWith(1, 10, '', 'CASH', undefined, undefined);
  });

  it('should filter payments when date range changes', () => {
    component.startDate.set(new Date('2026-06-10'));
    component.endDate.set(new Date('2026-06-12'));
    component.onFilterChange();
    expect(mockRecordsService.getAllPayments).toHaveBeenCalledWith(1, 10, '', 'ALL', '2026-06-10', '2026-06-12');
  });

  it('should open edit dialog and reload on success', () => {
    const payment = component.payments()[0];
    component.onEdit(payment);
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockRecordsService.getAllPayments).toHaveBeenCalledTimes(2);
  });

  it('should confirm and delete payment', () => {
    const payment = component.payments()[0];
    component.onDelete(payment);
    expect(mockRecordsService.deletePayment).toHaveBeenCalledWith(payment.id);
  });
});
