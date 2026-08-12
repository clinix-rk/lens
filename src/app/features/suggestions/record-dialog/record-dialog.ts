import { Component, inject, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { PatientRecordsService } from '../../patients/patient-records.service';
import { Suggestion, SuggestionStatus } from '../../patients/patient-records.model';
import { HierarchicalTypePicker } from '../../../shared/components/hierarchical-type-picker/hierarchical-type-picker';
import { TreatmentCategoryService } from '../../treatments/treatment-category.service';
import { TypeNode } from '../../../shared/components/hierarchical-type-picker/hierarchical-type.model';

export interface SuggestionDialogData {
  patientId: number;
  suggestion?: Suggestion;
}

@Component({
  selector: 'app-record-dialog-suggestion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatPrefix,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
    HierarchicalTypePicker,
    MatDatepickerModule,
  ],
  templateUrl: './record-dialog.html',
  styleUrl: './record-dialog.scss',
})
export class RecordDialogSuggestion implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RecordDialogSuggestion>);
  private data = inject<SuggestionDialogData>(MAT_DIALOG_DATA);
  private recordsService = inject(PatientRecordsService);
  private treatmentCategoryService = inject(TreatmentCategoryService);

  suggestionForm!: FormGroup;
  isEditMode = false;
  suggestionTypes: TypeNode[] = [];
  maxDate = new Date();
  SHOW_TYPE_FIELD = false;

  statuses: SuggestionStatus[] = ['SUGGESTED', 'ACCEPTED', 'DECLINED'];

  ngOnInit() {
    this.isEditMode = !!this.data.suggestion;

    const suggestion = this.data.suggestion;
    this.suggestionForm = this.fb.group({
      date: [suggestion?.date ? new Date(suggestion.date) : new Date(), [Validators.required]],
      type: [suggestion?.type || null],
      details: [suggestion?.details || '', [Validators.required]],
      cost: [
        suggestion?.cost !== undefined ? suggestion.cost : 0,
        [Validators.required, Validators.min(0)],
      ],
      status: [suggestion?.status || 'SUGGESTED', [Validators.required]],
    });

    this.treatmentCategoryService.getAllCategories(0, 1000).subscribe({
      next: (res) => {
        const items = res.data?.items || [];
        this.suggestionTypes = this.buildHierarchy(items);
      },
      error: (err) => {
        console.error('Failed to load treatment categories for suggestions', err);
      }
    });
  }

  private buildHierarchy(flatList: any[]): TypeNode[] {
    const map = new Map<number, any>();
    const roots: any[] = [];

    // Initialize mapping
    flatList.forEach(item => {
      map.set(item.id, { ...item, label: item.name, children: [] });
    });

    // Connect child to parent
    flatList.forEach(item => {
      const mapped = map.get(item.id);
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(mapped);
      } else {
        roots.push(mapped);
      }
    });

    const cleanNode = (node: any): TypeNode => {
      const cleaned: TypeNode = { label: node.label };
      if (node.children && node.children.length > 0) {
        cleaned.children = node.children.map(cleanNode);
      }
      return cleaned;
    };

    return roots.map(cleanNode);
  }

  onSubmit() {
    if (this.suggestionForm.invalid) return;

    const formVal = this.suggestionForm.value;
    const formattedDate = this.formatDate(formVal.date);

    if (this.isEditMode && this.data.suggestion) {
      this.recordsService
        .updateSuggestion({
          id: this.data.suggestion.id,
          patientId: this.data.patientId,
          date: formattedDate,
          type: 'Others',
          details: formVal.details,
          cost: formVal.cost,
          status: formVal.status,
        })
        .subscribe((result) => {
          this.dialogRef.close(result);
        });
    } else {
      this.recordsService
        .addSuggestion({
          patientId: this.data.patientId,
          date: formattedDate,
          type: 'Others',
          details: formVal.details,
          cost: formVal.cost,
          status: formVal.status,
        })
        .subscribe((result) => {
          this.dialogRef.close(result);
        });
    }
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = date instanceof Date ? date : (typeof date.toDate === 'function' ? date.toDate() : new Date(date));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
