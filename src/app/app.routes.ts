import { Routes } from '@angular/router';
import { Patients } from './features/patients/patients';
import { Doctors } from './features/doctors/doctors';
import { Appointments } from './features/appointments/appointments';
import { Finances } from './features/finances/finances';
import { Users } from './features/users/users';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/patients',
    pathMatch: 'full'
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search').then(m => m.Search),
    title: "Search | Clinix"
  },
  {
    path: 'patients',
    loadComponent: () => import('./features/patients/patients').then(m => m.Patients),
    title: "Patients | Clinix"
  },
  {
    path: 'patients/:id',
    loadComponent: () => import('./features/patients/patient-detail/patient-detail').then(m => m.PatientDetail),
    title: "Patient Details | Clinix"
  },
  {
    path: 'doctors',
    loadComponent: () => import('./features/doctors/doctors').then(m => m.Doctors),
    title: "Doctors | Clinix"
  },
  {
    path: 'doctors/:id',
    loadComponent: () => import('./features/doctors/doctor-detail/doctor-detail').then(m => m.DoctorDetail),
    title: "Doctor Details | Clinix"
  },
  {
    path: 'appointments',
    loadComponent: () => import('./features/appointments/appointments').then(m => m.Appointments),
    title: "Appointments | Clinix"
  },
  {
    path: 'finances',
    loadComponent: () => import('./features/finances/finances').then(m => m.Finances),
    title: "Finances | Clinix" 
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/users').then(m => m.Users),
    title: "Users | Clinix"
  },
];