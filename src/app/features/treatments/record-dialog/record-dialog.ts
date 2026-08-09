import { Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { PatientRecordsService } from '../../patients/patient-records.service';
import { Treatment } from '../../patients/patient-records.model';
import { HierarchicalTypePicker } from '../../../shared/components/hierarchical-type-picker/hierarchical-type-picker';
import { TreatmentCategoryService } from '../treatment-category.service';
import { TypeNode } from '../../../shared/components/hierarchical-type-picker/hierarchical-type.model';

export interface TreatmentDialogData {
  patientId: number;
  treatment?: Treatment;
}

@Component({
  selector: 'app-record-dialog-treatment',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatInput,
    MatButton,
    MatIcon,
    HierarchicalTypePicker,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './record-dialog.html',
  styleUrl: './record-dialog.scss',
})
export class RecordDialogTreatment implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RecordDialogTreatment>);
  private data = inject<TreatmentDialogData>(MAT_DIALOG_DATA);
  private recordsService = inject(PatientRecordsService);
  private treatmentCategoryService = inject(TreatmentCategoryService);

  treatmentForm!: FormGroup;
  isEditMode = false;
  treatmentTypes: TypeNode[] = [];
  maxDate = new Date();
  SHOW_TYPE_FIELD = false;

  ngOnInit() {
    this.isEditMode = !!this.data.treatment;

    const treatment = this.data.treatment;
    this.treatmentForm = this.fb.group({
      date: [treatment?.date ? new Date(treatment.date) : new Date(), [Validators.required]],
      type: [treatment?.type || ''],
      details: [treatment?.details || '', [Validators.required]],
    });

    this.treatmentCategoryService.getAllCategories(0, 1000).subscribe({
      next: (res) => {
        const items = res.data?.items || [];
        this.treatmentTypes = this.buildHierarchy(items);
      },
      error: (err) => {
        console.error('Failed to load treatment categories', err);
      },
    });
  }

  private buildHierarchy(flatList: any[]): TypeNode[] {
    const map = new Map<number, any>();
    const roots: any[] = [];

    // Initialize mapping
    flatList.forEach((item) => {
      map.set(item.id, { ...item, label: item.name, children: [] });
    });

    // Connect child to parent
    flatList.forEach((item) => {
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
    if (this.treatmentForm.invalid) return;

    const formVal = this.treatmentForm.value;
    const formattedDate = this.formatDate(formVal.date);

    if (this.isEditMode && this.data.treatment) {
      this.recordsService
        .updateTreatment({
          id: this.data.treatment.id,
          patientId: this.data.patientId,
          date: formattedDate,
          type: 'Others',
          details: formVal.details,
        })
        .subscribe((result) => {
          this.dialogRef.close(result);
        });
    } else {
      this.recordsService
        .addTreatment({
          patientId: this.data.patientId,
          date: formattedDate,
          type: 'Others',
          details: formVal.details,
        })
        .subscribe((result) => {
          this.dialogRef.close(result);
        });
    }
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
