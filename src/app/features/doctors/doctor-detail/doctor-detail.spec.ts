import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { DoctorDetail } from './doctor-detail';
import { DoctorService } from '../doctor.service';

describe('DoctorDetail', () => {
  let component: DoctorDetail;
  let fixture: ComponentFixture<DoctorDetail>;
  let mockDoctorService: any;
  let mockDialog: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDoctorService = {
      getDoctorById: vi.fn().mockReturnValue(of({
        success: true,
        data: {
          id: 1,
          name: 'Dr. Sarah Connor',
          caseNoPrefix: 'SC',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }))
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of({
          id: 1,
          name: 'Dr. Sarah Connor Updated',
          caseNoPrefix: 'SC',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      })
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [DoctorDetail, NoopAnimationsModule],
      providers: [
        { provide: DoctorService, useValue: mockDoctorService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load doctor details on init', () => {
    expect(mockDoctorService.getDoctorById).toHaveBeenCalledWith(1);
    expect(component.doctor()?.name).toBe('Dr. Sarah Connor');
  });

  it('should open edit dialog and update doctor details', () => {
    component.openEditDoctorDialog();
    expect(mockDialog.open).toHaveBeenCalled();
    expect(component.doctor()?.name).toBe('Dr. Sarah Connor Updated');
  });
});
