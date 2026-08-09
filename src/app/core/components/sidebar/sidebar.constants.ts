import { SidebarMenu } from './sidebar.types';

export const SIDEBAR_MENUS: SidebarMenu[] = [
  { name: "Patients", url: "/patients", icon: "person", tooltip: "Browse Patients" },
  { name: "Doctors", url: "/doctors", icon: "medical_services", tooltip: "Browse Doctors" },
  { name: "Appointments", url: "/appointments", icon: "calendar_month", tooltip: "Book appointments" },
  { name: "Finances", url: "/finances", icon: "payments", tooltip: "Manage your finances" }
];
