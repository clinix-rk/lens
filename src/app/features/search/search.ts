import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatChipSet, MatChip } from '@angular/material/chips';

interface SearchResult {
  type: 'patient' | 'doctor' | 'appointment';
  title: string;
  subtitle: string;
  meta: string;
  avatarText: string;
  colorClass: string;
}

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    FormsModule,
    MatIcon,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
    MatChipSet,
    MatChip
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  searchQuery = signal('');
  selectedFilter = signal<'all' | 'patients' | 'doctors' | 'appointments'>('all');

  // Static mock data for demo search
  allResults: SearchResult[] = [
    {
      type: 'patient',
      title: 'Alexander Graham',
      subtitle: 'ID: PT-29402 | Male, 45 yrs',
      meta: 'Last Visit: June 12, 2026',
      avatarText: 'AG',
      colorClass: 'bg-primary'
    },
    {
      type: 'doctor',
      title: 'Dr. Sarah Connor',
      subtitle: 'Cardiologist | Dept. A',
      meta: 'On Duty | 12 Appointments Today',
      avatarText: 'SC',
      colorClass: 'bg-secondary'
    },
    {
      type: 'appointment',
      title: 'Dental Checkup - John Doe',
      subtitle: 'Dr. Emily Vance | Cabin 104',
      meta: 'Scheduled: Tomorrow, 10:30 AM',
      avatarText: 'DC',
      colorClass: 'bg-tertiary'
    },
    {
      type: 'patient',
      title: 'Elena Rostova',
      subtitle: 'ID: PT-10492 | Female, 32 yrs',
      meta: 'Last Visit: May 28, 2026',
      avatarText: 'ER',
      colorClass: 'bg-primary'
    },
    {
      type: 'doctor',
      title: 'Dr. Marcus Vance',
      subtitle: 'Neurologist | Dept. C',
      meta: 'On Duty | 8 Appointments Today',
      avatarText: 'MV',
      colorClass: 'bg-secondary'
    }
  ];

  filteredResults = signal<SearchResult[]>(this.allResults);

  onSearch() {
    this.updateFilters();
  }

  setFilter(filter: 'all' | 'patients' | 'doctors' | 'appointments') {
    this.selectedFilter.set(filter);
    this.updateFilters();
  }

  private updateFilters() {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.selectedFilter();

    let results = this.allResults;

    // Apply type filter
    if (filter === 'patients') {
      results = results.filter(r => r.type === 'patient');
    } else if (filter === 'doctors') {
      results = results.filter(r => r.type === 'doctor');
    } else if (filter === 'appointments') {
      results = results.filter(r => r.type === 'appointment');
    }

    // Apply search query filter
    if (query) {
      results = results.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.subtitle.toLowerCase().includes(query) ||
        r.meta.toLowerCase().includes(query)
      );
    }

    this.filteredResults.set(results);
  }
}
