import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./core/components/sidebar/sidebar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  sidebarCollapsed = signal(false);

  toggleSidebar() {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }
}
