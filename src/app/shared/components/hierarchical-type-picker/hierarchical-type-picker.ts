import { Component, forwardRef, ElementRef, HostListener, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { TypeNode } from './hierarchical-type.model';

@Component({
  selector: 'app-hierarchical-type-picker',
  standalone: true,
  imports: [CommonModule, MatIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HierarchicalTypePicker),
      multi: true,
    },
  ],
  templateUrl: './hierarchical-type-picker.html',
  styleUrl: './hierarchical-type-picker.scss',
})
export class HierarchicalTypePicker implements ControlValueAccessor {
  private elementRef = inject(ElementRef);

  readonly tree = input<TypeNode[]>([]);
  readonly label = input<string>('Type');
  readonly placeholder = input<string>('Select a type...');

  selectedValue: string = '';
  disabled: boolean = false;
  isOpen: boolean = false;

  // Track expanded parent nodes by label
  expandedNodes = new Set<string>();

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.selectedValue = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.onTouched();
    }
  }

  selectNode(node: TypeNode, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedValue = node.label;
    this.onChange(this.selectedValue);
    this.isOpen = false;
  }

  toggleExpand(node: TypeNode, event: MouseEvent): void {
    event.stopPropagation();
    if (this.expandedNodes.has(node.label)) {
      this.expandedNodes.delete(node.label);
    } else {
      this.expandedNodes.add(node.label);
    }
  }

  isExpanded(node: TypeNode): boolean {
    return this.expandedNodes.has(node.label);
  }

  hasChildren(node: TypeNode): boolean {
    return !!node.children && node.children.length > 0;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
