import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Patients } from './patients';
import { PatientService } from './patient.service';

describe('Patients', () => {
  let component: Patients;
  let fixture: ComponentFixture<Patients>;
  let mockPatientService: any;
  let mockDialog: any;
  let mockRouter: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockPatientService = {
      searchPatients: vi.fn().mockReturnValue(of({
        success: true,
        data: {
          items: [
            { id: 1, caseNo: 'H11', name: 'John Doe', phoneNumbers: [{ phoneNumber: '+12345', type: 'PRIMARY' }], medicalConditions: [], drugAllergies: [] }
          ],
          pageNumber: 0,
          pageSize: 10,
          totalElements: 15,
          totalPages: 2,
          isLast: false
        }
      }))
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of({ id: 16, name: 'Added Patient' }))
      })
    };

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Patients, NoopAnimationsModule],
      providers: [
        { provide: PatientService, useValue: mockPatientService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Patients);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patients on initialization', () => {
    expect(mockPatientService.searchPatients).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
    expect(component.patients().length).toBe(1);
    expect(component.totalElements()).toBe(15);
    expect(component.totalPages()).toBe(2);
  });

  it('should parse single query and call searchPatients with specific field', () => {
    // 1. Name query
    component.searchQuery.set('Alexander');
    component.onSearchChange();
    expect(mockPatientService.searchPatients).toHaveBeenCalledWith(1, 10, 'Alexander', undefined, undefined);

    // 2. CaseNo query
    component.searchQuery.set('H12');
    component.onSearchChange();
    expect(mockPatientService.searchPatients).toHaveBeenCalledWith(1, 10, undefined, undefined, 'H12');

    // 3. Phone number query
    component.searchQuery.set('+123456');
    component.onSearchChange();
    expect(mockPatientService.searchPatients).toHaveBeenCalledWith(1, 10, undefined, '+123456', undefined);
  });

  it('should change page size and reload data', () => {
    const event = { target: { value: '25' } } as unknown as Event;
    component.onPageSizeChange(event);
    expect(component.pageSize()).toBe(25);
    expect(component.currentPage()).toBe(1);
    expect(mockPatientService.searchPatients).toHaveBeenCalledWith(1, 25, undefined, undefined, undefined);
  });

  it('should handle pagination next/prev navigation', () => {
    component.goToNextPage();
    expect(component.currentPage()).toBe(2);
    expect(mockPatientService.searchPatients).toHaveBeenCalledWith(2, 10, undefined, undefined, undefined);

    component.goToPreviousPage();
    expect(component.currentPage()).toBe(1);
  });

  it('should navigate to detail page when viewing patient details', () => {
    component.viewPatientDetails(42);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/patients', 42]);
  });

  it('should open Add Patient Dialog and reload on success', () => {
    component.openAddPatientDialog();
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockPatientService.searchPatients).toHaveBeenCalledTimes(2); // init + afterClosed success reload
  });
});
