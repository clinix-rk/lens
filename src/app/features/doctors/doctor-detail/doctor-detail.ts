import { Component, inject, signal, OnInit } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DoctorService } from '../doctor.service';
import { DoctorResponse } from '../doctor.model';
import { DoctorDialog } from '../doctor-dialog/doctor-dialog';

@Component({
  selector: 'app-doctor-detail',
  imports: [RouterLink, MatIcon, MatButton, MatIconButton],
  templateUrl: './doctor-detail.html',
  styleUrl: './doctor-detail.scss',
})
export class DoctorDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private doctorService = inject(DoctorService);
  private dialog = inject(MatDialog);

  doctorId = signal<string | null>(null);
  doctor = signal<DoctorResponse | null>(null);
  isLoading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  // Feature Flag: Set to false in this version to keep metrics disabled/hidden
  showMetrics = signal(false);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.doctorId.set(idParam);

    if (idParam) {
      const numericId = Number(idParam);
      if (!isNaN(numericId)) {
        this.loadDoctorData(numericId);
      } else {
        this.errorMsg.set('Invalid Doctor ID format');
        this.isLoading.set(false);
      }
    } else {
      this.errorMsg.set('Doctor ID not specified');
      this.isLoading.set(false);
    }
  }

  private loadDoctorData(id: number) {
    this.isLoading.set(true);
    this.doctorService.getDoctorById(id).subscribe({
      next: (wrapper) => {
        this.doctor.set(wrapper.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load doctor detail', err);
        this.errorMsg.set('Doctor profile not found or API error.');
        this.isLoading.set(false);
      },
    });
  }

  openEditDoctorDialog() {
    const currentDoctor = this.doctor();
    if (!currentDoctor) return;

    const dialogRef = this.dialog.open(DoctorDialog, {
      width: '500px',
      data: { doctor: currentDoctor },
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((updatedDoctor) => {
      if (updatedDoctor) {
        this.doctor.set(updatedDoctor);
      }
    });
  }
}
