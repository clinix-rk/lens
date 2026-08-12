import { Component, inject, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { PatientRecordsService } from '../../patients/patient-records.service';
import { Complain } from '../../patients/patient-records.model';
import { HierarchicalTypePicker } from '../../../shared/components/hierarchical-type-picker/hierarchical-type-picker';
import { ComplainCategoryService } from '../complain-category.service';
import { TypeNode } from '../../../shared/components/hierarchical-type-picker/hierarchical-type.model';

export interface ComplainDialogData {
  patientId: number;
  complain?: Complain;
}

@Component({
  selector: 'app-record-dialog-complain',
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
  templateUrl: './record-dialog.html',
  styleUrl: './record-dialog.scss',
})
export class RecordDialogComplain implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RecordDialogComplain>);
  private data = inject<ComplainDialogData>(MAT_DIALOG_DATA);
  private recordsService = inject(PatientRecordsService);
  private complainCategoryService = inject(ComplainCategoryService);

  complainForm!: FormGroup;
  isEditMode = false;
  complainTypes: TypeNode[] = [];
  maxDate = new Date();
  SHOW_TYPE_FIELD = false;

  ngOnInit() {
    this.isEditMode = !!this.data.complain;

    const complain = this.data.complain;
    this.complainForm = this.fb.group({
      date: [complain?.date ? new Date(complain.date) : new Date(), [Validators.required]],
      type: [complain?.type || 'Others', [Validators.required]],
      details: [complain?.details || '', [Validators.required]],
    });

    this.complainCategoryService.getAllCategories(0, 1000).subscribe({
      next: (res) => {
        const items = res.data?.items || [];
        this.complainTypes = this.buildHierarchy(items);
        if (!this.isEditMode) {
          const othersCat = items.find(
            (c: any) =>
              c.name.toLowerCase() === 'others' ||
              c.name.toLowerCase() === 'other' ||
              c.name.toLowerCase().includes('other')
          );
          if (othersCat) {
            this.complainForm.patchValue({ type: othersCat.name });
          } else {
            this.complainForm.patchValue({ type: 'Others' });
          }
        }
      },
      error: (err) => {
        console.error('Failed to load complain categories', err);
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
    if (this.complainForm.invalid) return;

    const formVal = this.complainForm.value;
    const formattedDate = this.formatDate(formVal.date);

    if (this.isEditMode && this.data.complain) {
      this.recordsService
        .updateComplain({
          id: this.data.complain.id,
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
        .addComplain({
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
