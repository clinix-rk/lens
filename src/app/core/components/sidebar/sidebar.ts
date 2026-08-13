import { Component, signal, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { SIDEBAR_MENUS } from './sidebar.constants';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIcon, MatIconButton, MatTooltip],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  // Signal inputs (v17.1+)
  collapsed = input<boolean>(true);

  // Signal outputs (v17.3+)
  toggleCollapse = output<void>();

  menus = signal(SIDEBAR_MENUS);

  onToggleCollapse() {
    this.toggleCollapse.emit();
  }
}
