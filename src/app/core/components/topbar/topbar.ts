import { Component, output, inject, signal, DestroyRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-topbar',
  imports: [MatIcon, MatIconButton],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  toggleCollapse = output<void>();
  
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  
  pageTitle = signal('Clinical Search');

  constructor() {
    // Dynamically update the header page title on routing changes
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event) => {
      const url = event.urlAfterRedirects;
      if (url.includes('/search')) {
        this.pageTitle.set('Clinical Search');
      } else if (url.includes('/patients')) {
        this.pageTitle.set('Patient Directory');
      } else if (url.includes('/doctors')) {
        this.pageTitle.set('Doctor Directory');
      } else if (url.includes('/appointments')) {
        this.pageTitle.set('Appointment Scheduler');
      } else if (url.includes('/finances')) {
        this.pageTitle.set('Financial Manager');
      } else if (url.includes('/users')) {
        this.pageTitle.set('User Settings');
      } else {
        this.pageTitle.set('Clinix Lens');
      }
    });
  }

  onToggleCollapse() {
    this.toggleCollapse.emit();
  }
}
