import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PatientRecordsService } from '../../patients/patient-records.service';
import { Prescription, Medicine } from '../../patients/patient-records.model';
import { MedicineLibraryService, MedicineCatalogueEntry } from '../../../shared/services/medicine-library.service';
import { DrugDosageService, DrugDosageResponse } from '../drug-dosage.service';
import { InstructionCatalogService, InstructionCatalogResponse } from '../instruction-catalog.service';
import { AddMedicineDialog } from '../add-medicine-dialog/add-medicine-dialog';
import { forkJoin } from 'rxjs';

export interface MedicineRow {
  medicineId: number | null;
  medicineName: string;
  dosageId: number | null;
  dosageDisplay: string;
  instructionId: number | null;
  instructionDisplay: string;
  quantity: number;
}

export interface PrescriptionDialogData {
  patientId: number;
  prescription?: Prescription;
}

@Component({
  selector: 'app-record-dialog-prescription',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatIcon,
    MatAutocompleteModule,
    MatDatepickerModule
  ],
  templateUrl: './record-dialog.html',
  styleUrl: './record-dialog.scss'
})
export class RecordDialogPrescription implements OnInit {
  private dialogRef = inject(MatDialogRef<RecordDialogPrescription>);
  private data = inject<PrescriptionDialogData>(MAT_DIALOG_DATA);
  private dialog = inject(MatDialog);
  private recordsService = inject(PatientRecordsService);
  private medicineLibrary = inject(MedicineLibraryService);
  private dosageService = inject(DrugDosageService);
  private instructionService = inject(InstructionCatalogService);

  // Signals
  isEditMode = signal(false);
  maxDate = signal(new Date());
  prescriptionDate = signal(new Date());
  prescriptionDetails = signal('');
  medicines = signal<MedicineRow[]>([]);

  catalogMedicines = signal<MedicineCatalogueEntry[]>([]);
  catalogDosages = signal<DrugDosageResponse[]>([]);
  catalogInstructions = signal<InstructionCatalogResponse[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.isEditMode.set(!!this.data.prescription);

    // Fetch catalog data concurrently
    forkJoin({
      meds: this.medicineLibrary.getAllMedicines(),
      dosages: this.dosageService.getAllDosages(0, 1000),
      instructions: this.instructionService.getAllInstructions(0, 1000)
    }).subscribe({
      next: ({ meds, dosages, instructions }) => {
        this.catalogMedicines.set(meds || []);
        this.catalogDosages.set(dosages.data?.items || []);
        this.catalogInstructions.set(instructions.data?.items || []);

        const prescription = this.data.prescription;
        if (prescription) {
          this.prescriptionDate.set(new Date(prescription.date));
          this.prescriptionDetails.set(prescription.details || '');
          if (prescription.medicines && prescription.medicines.length > 0) {
            prescription.medicines.forEach(m => this.addMedicineRowFromPrescription(m));
          } else {
            this.addMedicineRow();
          }
        } else {
          this.addMedicineRow();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load catalog data for prescription dialog', err);
        this.addMedicineRow();
        this.isLoading.set(false);
      }
    });
  }

  addMedicineRow() {
    const newRow: MedicineRow = {
      medicineId: null,
      medicineName: '',
      dosageId: null,
      dosageDisplay: '',
      instructionId: null,
      instructionDisplay: '',
      quantity: 1
    };
    this.medicines.update(m => [...m, newRow]);
  }

  private addMedicineRowFromPrescription(m: Medicine) {
    // Resolve medicineId & medicineName
    let medId = m.medicineId ?? null;
    let medName = m.name || '';
    if (medId && !medName) {
      const match = this.catalogMedicines().find(entry => entry.id === medId);
      if (match) medName = match.name;
    } else if (!medId && medName) {
      const match = this.catalogMedicines().find(entry => entry.name.toLowerCase() === medName.toLowerCase().trim());
      if (match) medId = match.id ?? null;
    }

    // Resolve dosageId & dosageDisplay
    let dosId = m.dosageId ?? null;
    let dosDisplay = m.dosage || '';
    if (dosId && !dosDisplay) {
      const match = this.catalogDosages().find(d => d.id === dosId);
      if (match) dosDisplay = match.dosage;
    } else if (!dosId && dosDisplay) {
      const match = this.catalogDosages().find(d => d.dosage.toLowerCase() === dosDisplay.toLowerCase().trim());
      if (match) dosId = match.id ?? null;
    }

    // Resolve instructionId & instructionDisplay
    let instId = m.instructionId ?? null;
    let instDisplay = m.instructions || '';
    if (instId && !instDisplay) {
      const match = this.catalogInstructions().find(i => i.id === instId);
      if (match) instDisplay = match.instruction;
    } else if (!instId && instDisplay) {
      const match = this.catalogInstructions().find(i => i.instruction.toLowerCase() === instDisplay.toLowerCase().trim());
      if (match) instId = match.id ?? null;
    }

    const row: MedicineRow = {
      medicineId: medId,
      medicineName: medName,
      dosageId: dosId,
      dosageDisplay: dosDisplay,
      instructionId: instId,
      instructionDisplay: instDisplay,
      quantity: m.quantity ?? 1
    };

    this.medicines.update(rows => [...rows, row]);
  }

  // --- Medicine Handlers ---
  onMedicineNameInput(index: number, name: string) {
    this.medicines.update(rows => {
      const updated = [...rows];
      const row = { ...updated[index] };
      row.medicineName = name;

      const match = this.catalogMedicines().find(m => m.name.toLowerCase() === name.toLowerCase().trim());
      if (match && match.id) {
        row.medicineId = match.id;
      } else {
        row.medicineId = null;
      }
      updated[index] = row;
      return updated;
    });
  }

  onMedicineSelected(index: number, entry: MedicineCatalogueEntry) {
    this.medicines.update(rows => {
      const updated = [...rows];
      const row = { ...updated[index] };
      row.medicineId = entry.id ?? null;
      row.medicineName = entry.name;
      updated[index] = row;
      return updated;
    });
  }

  openAddMedicineDialog(index: number, typedName?: string) {
    const dialogRef = this.dialog.open(AddMedicineDialog, {
      width: '420px',
      data: { defaultName: typedName || this.medicines()[index]?.medicineName || '' }
    });

    dialogRef.afterClosed().subscribe((created: MedicineCatalogueEntry | null) => {
      if (created && created.id) {
        // Refresh catalog list
        const updatedCatalog = [...this.catalogMedicines()];
        if (!updatedCatalog.some(m => m.id === created.id)) {
          updatedCatalog.push(created);
          this.catalogMedicines.set(updatedCatalog);
        }

        // Select created medicine into current row
        this.medicines.update(rows => {
          const updated = [...rows];
          const row = { ...updated[index] };
          row.medicineId = created.id!;
          row.medicineName = created.name;
          updated[index] = row;
          return updated;
        });
      }
    });
  }

  getFilteredMedicines(index: number): MedicineCatalogueEntry[] {
    const row = this.medicines()[index];
    if (!row) return this.catalogMedicines();
    const query = row.medicineName.toLowerCase().trim();
    if (!query) return this.catalogMedicines();
    return this.catalogMedicines().filter(m => m.name.toLowerCase().includes(query));
  }

  // --- Dosage Handlers ---
  onDosageSelected(index: number, dosageId: number) {
    const match = this.catalogDosages().find(d => d.id === dosageId);
    this.medicines.update(rows => {
      const updated = [...rows];
      const row = { ...updated[index] };
      row.dosageId = dosageId;
      row.dosageDisplay = match ? match.dosage : '';
      updated[index] = row;
      return updated;
    });
  }

  // --- Instruction Handlers ---
  onInstructionInput(index: number, text: string) {
    this.medicines.update(rows => {
      const updated = [...rows];
      const row = { ...updated[index] };
      row.instructionDisplay = text;

      const match = this.catalogInstructions().find(i => i.instruction.toLowerCase() === text.toLowerCase().trim());
      if (match && match.id) {
        row.instructionId = match.id;
      } else {
        row.instructionId = null;
      }
      updated[index] = row;
      return updated;
    });
  }

  onInstructionSelected(index: number, inst: InstructionCatalogResponse) {
    this.medicines.update(rows => {
      const updated = [...rows];
      const row = { ...updated[index] };
      row.instructionId = inst.id ?? null;
      row.instructionDisplay = inst.instruction || '';
      updated[index] = row;
      return updated;
    });
  }

  createAndSelectInstruction(index: number, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.instructionService.createInstruction({ instruction: trimmed }).subscribe({
      next: (res) => {
        const created = res.data;
        if (created && created.id) {
          // Add to catalog instructions
          const updatedCatalog = [...this.catalogInstructions(), created];
          this.catalogInstructions.set(updatedCatalog);

          // Update current row
          this.medicines.update(rows => {
            const updated = [...rows];
            const row = { ...updated[index] };
            row.instructionId = created.id!;
            row.instructionDisplay = created.instruction!;
            updated[index] = row;
            return updated;
          });
        }
      },
      error: (err) => console.error('Failed to create instruction', err)
    });
  }

  getFilteredInstructions(index: number): InstructionCatalogResponse[] {
    const row = this.medicines()[index];
    if (!row) return this.catalogInstructions();
    const query = row.instructionDisplay.toLowerCase().trim();
    if (!query) return this.catalogInstructions();
    return this.catalogInstructions().filter(i => i.instruction.toLowerCase().includes(query));
  }

  hasExactInstructionMatch(index: number): boolean {
    const row = this.medicines()[index];
    if (!row || !row.instructionDisplay.trim()) return true;
    const query = row.instructionDisplay.toLowerCase().trim();
    return this.catalogInstructions().some(i => i.instruction.toLowerCase() === query);
  }

  hasExactMedicineMatch(index: number): boolean {
    const row = this.medicines()[index];
    if (!row || !row.medicineName.trim()) return true;
    const query = row.medicineName.toLowerCase().trim();
    return this.catalogMedicines().some(m => m.name.toLowerCase() === query);
  }

  // --- General Row Handlers ---
  updateQuantity(index: number, qty: number) {
    this.medicines.update(rows => {
      const updated = [...rows];
      updated[index] = { ...updated[index], quantity: qty };
      return updated;
    });
  }

  removeMedicineRow(index: number) {
    if (this.medicines().length > 1) {
      this.medicines.update(m => m.filter((_, i) => i !== index));
    }
  }

  isFormValid(): boolean {
    if (!this.prescriptionDate()) return false;
    return this.medicines().every(m => m.medicineId != null && m.dosageId != null && m.quantity >= 1);
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    const formattedDate = this.formatDate(this.prescriptionDate());

    const payload = {
      patientId: this.data.patientId,
      date: formattedDate,
      details: this.prescriptionDetails(),
      medicines: this.medicines().map(m => ({
        medicineId: m.medicineId!,
        dosageId: m.dosageId!,
        ...(m.instructionId != null ? { instructionId: m.instructionId } : {}),
        name: m.medicineName,
        dosage: m.dosageDisplay,
        instructions: m.instructionDisplay,
        quantity: Number(m.quantity)
      }))
    };

    if (this.isEditMode() && this.data.prescription) {
      this.recordsService.updatePrescription({
        id: this.data.prescription.id,
        ...payload
      }).subscribe(result => {
        this.dialogRef.close(result);
      });
    } else {
      this.recordsService.addPrescription(payload).subscribe(result => {
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
