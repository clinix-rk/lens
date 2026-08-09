import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { PatientRecordsService } from '../../patients/patient-records.service';
import { Prescription, Medicine } from '../../patients/patient-records.model';
import { MedicineLibraryService } from '../../../shared/services/medicine-library.service';
import { DrugDosageService } from '../drug-dosage.service';

export interface MedicineRow {
  name: string;
  dosage: string;
  instructions: string;
  quantity: number;
  isFromCatalogue: boolean;
  defaultDosages: string[];
  availableDosages: string[];
  availableInstructions: string[];
  filteredMedicines: string[];
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
  providers: [provideNativeDateAdapter()],
  templateUrl: './record-dialog.html',
  styleUrl: './record-dialog.scss'
})
export class RecordDialogPrescription implements OnInit {
  private dialogRef = inject(MatDialogRef<RecordDialogPrescription>);
  private data = inject<PrescriptionDialogData>(MAT_DIALOG_DATA);
  private recordsService = inject(PatientRecordsService);
  private medicineLibrary = inject(MedicineLibraryService);
  private dosageService = inject(DrugDosageService);

  // Signals
  isEditMode = signal(false);
  maxDate = signal(new Date());
  prescriptionDate = signal(new Date());
  prescriptionDetails = signal('');
  medicines = signal<MedicineRow[]>([]);
  allMedicineNames = signal<string[]>([]);
  globalDosages = signal<string[]>([]);
  globalInstructions = signal<string[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.isEditMode.set(!!this.data.prescription);

    // Load medicine names
    if (typeof this.medicineLibrary.getNamesObservable === 'function') {
      this.medicineLibrary.getNamesObservable().subscribe(names => {
        this.allMedicineNames.set(names);
      });
    } else {
      this.allMedicineNames.set(this.medicineLibrary.getNames() || []);
    }

    // Load instructions from medicine library
    const libraryEntries = this.medicineLibrary.getAll() || [];
    const instructionsSet = new Set<string>();
    libraryEntries.forEach(entry => {
      if (entry.defaultInstructions) {
        instructionsSet.add(entry.defaultInstructions.trim());
      }
    });
    const standardPresets = [
      'Take after meals',
      'Take before meals',
      'Take once daily',
      'Take twice daily',
      'As directed by Dentist'
    ];
    standardPresets.forEach(p => instructionsSet.add(p));

    const currentInstructions = Array.from(instructionsSet);
    if (this.data.prescription?.medicines) {
      this.data.prescription.medicines.forEach(m => {
        if (m.instructions && !currentInstructions.includes(m.instructions)) {
          currentInstructions.push(m.instructions);
        }
      });
    }
    this.globalInstructions.set(currentInstructions);

    // Load dosages
    this.dosageService.getAllDosages(0, 1000).subscribe({
      next: (res) => {
        const dosages = res.data?.items.map(d => d.dosage) || [];
        if (this.data.prescription?.medicines) {
          this.data.prescription.medicines.forEach(m => {
            if (m.dosage && !dosages.includes(m.dosage)) {
              dosages.push(m.dosage);
            }
          });
        }
        this.globalDosages.set(dosages);
      },
      error: (err) => console.error('Failed to load dosages', err)
    });

    // Set prescription data
    const prescription = this.data.prescription;
    if (prescription) {
      this.prescriptionDate.set(new Date(prescription.date));
      this.prescriptionDetails.set(prescription.details);
      prescription.medicines.forEach(m => this.addMedicineRow(m));
    } else {
      this.addMedicineRow();
    }

    this.isLoading.set(false);
  }

  addMedicineRow(med?: Medicine) {
    const entry = med ? this.medicineLibrary.findByName(med.name) : undefined;
    const isFromCatalogue = !!entry;
    const defaultDosages = entry ? entry.defaultDosages : [];

    const initialDosages = [...this.globalDosages()];
    if (med?.dosage && !initialDosages.includes(med.dosage)) {
      initialDosages.push(med.dosage);
    }
    if (defaultDosages) {
      defaultDosages.forEach(d => {
        if (!initialDosages.includes(d)) initialDosages.push(d);
      });
    }

    const initialInstructions = [...this.globalInstructions()];
    if (med?.instructions && !initialInstructions.includes(med.instructions)) {
      initialInstructions.push(med.instructions);
    }
    if (entry?.defaultInstructions && !initialInstructions.includes(entry.defaultInstructions)) {
      initialInstructions.push(entry.defaultInstructions);
    }

    const newRow: MedicineRow = {
      name: med?.name || '',
      dosage: med?.dosage || '',
      instructions: med?.instructions || '',
      quantity: med?.quantity ?? 1,
      isFromCatalogue,
      defaultDosages,
      availableDosages: initialDosages,
      availableInstructions: initialInstructions,
      filteredMedicines: []
    };

    this.medicines.update(m => [...m, newRow]);
  }

  updateMedicineField(index: number, field: keyof MedicineRow, value: any) {
    this.medicines.update(meds => {
      const updated = [...meds];
      const row = updated[index];

      if (field === 'name') {
        const match = this.medicineLibrary.findByName(value || '');
        row.name = value;
        if (match) {
          row.isFromCatalogue = true;
          row.defaultDosages = match.defaultDosages;
          row.availableDosages = [...this.globalDosages()];
          row.availableInstructions = [...this.globalInstructions()];
        } else {
          row.isFromCatalogue = false;
          row.defaultDosages = [];
          row.availableDosages = [...this.globalDosages()];
          row.availableInstructions = [...this.globalInstructions()];
        }
        // dosage and instructions are intentionally NOT auto-filled
      } else {
        (row[field] as any) = value;
      }

      return updated;
    });
  }

  getFilteredMedicines(index: number): string[] {
    const medicine = this.medicines()[index];
    if (!medicine) return [];
    const filterValue = medicine.name.toLowerCase().trim();
    return this.allMedicineNames().filter(option =>
      option.toLowerCase().includes(filterValue)
    );
  }

  getFilteredInstructions(index: number): string[] {
    const medicine = this.medicines()[index];
    if (!medicine) return [];
    const filterValue = medicine.instructions.toLowerCase().trim();
    return medicine.availableInstructions.filter(option =>
      option.toLowerCase().includes(filterValue)
    );
  }

  removeMedicineRow(index: number) {
    if (this.medicines().length > 1) {
      this.medicines.update(m => m.filter((_, i) => i !== index));
    }
  }

  isFormValid(): boolean {
    if (!this.prescriptionDate()) return false;
    return this.medicines().every(m => m.name && m.dosage && m.quantity > 0);
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    const formattedDate = this.formatDate(this.prescriptionDate());

    // Add custom medicines to library
    this.medicines().forEach(m => {
      if (!m.isFromCatalogue) {
        this.medicineLibrary.addToLibrary({
          name: m.name,
          defaultDosages: [m.dosage],
          defaultInstructions: m.instructions
        });
      }
    });

    const payload = {
      patientId: this.data.patientId,
      date: formattedDate,
      details: this.prescriptionDetails(),
      medicines: this.medicines().map(m => ({
        name: m.name,
        dosage: m.dosage,
        instructions: m.instructions,
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
