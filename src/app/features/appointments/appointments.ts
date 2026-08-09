import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-appointments',
  imports: [MatIcon, MatButton],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss',
})
export class Appointments {
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/patients']);
  }
}
