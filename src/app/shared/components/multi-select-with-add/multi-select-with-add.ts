import { Component, forwardRef, input, output } from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-multi-select-with-add',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatIcon,
    MatIconButton,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectWithAdd),
      multi: true,
    },
  ],
  templateUrl: './multi-select-with-add.html',
  styleUrl: './multi-select-with-add.scss',
})
export class MultiSelectWithAdd implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly addPlaceholder = input<string>('Add new...');
  readonly options = input<string[]>([]);

  readonly optionAdded = output<string>();

  selectedValue: string[] = [];
  disabled = false;

  onChange: (value: string[]) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string[]): void {
    this.selectedValue = value || [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(val: string[]) {
    this.selectedValue = val || [];
    this.onChange(this.selectedValue);
    this.onTouched();
  }

  addNewItem(event: Event, inputVal: string) {
    event.stopPropagation();
    const cleaned = inputVal.trim();
    if (!cleaned) return;

    // Notify parent to add it to available options if needed
    this.optionAdded.emit(cleaned);

    // Auto-select the newly added item
    if (!this.selectedValue.includes(cleaned)) {
      this.selectedValue = [...this.selectedValue, cleaned];
      this.onChange(this.selectedValue);
      this.onTouched();
    }
  }
}
