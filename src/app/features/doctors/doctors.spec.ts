import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Doctors } from './doctors';
import { DoctorService } from './doctor.service';

describe('Doctors', () => {
  let component: Doctors;
  let fixture: ComponentFixture<Doctors>;
  let mockDoctorService: any;
  let mockDialog: any;
  let mockRouter: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDoctorService = {
      searchDoctors: vi.fn().mockReturnValue(of({
        success: true,
        data: {
          items: [
            { id: 1, caseNoPrefix: 'SC', name: 'Dr. Sarah Connor', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ],
          pageNumber: 0,
          pageSize: 10,
          totalElements: 5,
          totalPages: 1,
          isLast: true
        }
      }))
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of({ id: 5, name: 'Dr. John Doe', caseNoPrefix: 'JD' }))
      })
    };

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Doctors, NoopAnimationsModule],
      providers: [
        { provide: DoctorService, useValue: mockDoctorService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Doctors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load doctors on initialization', () => {
    expect(mockDoctorService.searchDoctors).toHaveBeenCalledWith(1, 10, undefined);
    expect(component.doctors().length).toBe(1);
    expect(component.totalElements()).toBe(5);
  });

  it('should search for doctors by name', () => {
    component.searchQuery.set('Sarah');
    component.onSearchChange();
    expect(mockDoctorService.searchDoctors).toHaveBeenCalledWith(1, 10, 'Sarah');
  });

  it('should change page size and reload', () => {
    const event = { target: { value: '25' } } as unknown as Event;
    component.onPageSizeChange(event);
    expect(component.pageSize()).toBe(25);
    expect(mockDoctorService.searchDoctors).toHaveBeenCalledWith(1, 25, undefined);
  });

  it('should navigate to detail page when viewing doctor details', () => {
    component.viewDoctorDetails(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/doctors', 1]);
  });

  it('should open Add Doctor Dialog and reload list on close', () => {
    component.openAddDoctorDialog();
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockDoctorService.searchDoctors).toHaveBeenCalledTimes(2); // init + success reload
  });
});
