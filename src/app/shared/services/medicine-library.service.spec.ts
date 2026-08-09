import { TestBed } from '@angular/core/testing';
import { MedicineLibraryService } from './medicine-library.service';

describe('MedicineLibraryService', () => {
  let service: MedicineLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicineLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find medicine by name case-insensitively', () => {
    const entry = service.findByName('ibuprofen 400mg');
    expect(entry).toBeDefined();
    expect(entry?.name).toBe('Ibuprofen 400mg');
  });

  it('should get all medicine names sorted', () => {
    const names = service.getNames();
    expect(names.length).toBeGreaterThan(0);
    expect(names[0].localeCompare(names[1])).toBeLessThanOrEqual(0);
  });

  it('should add to library if not exists', () => {
    const newEntry = {
      name: 'Aspirin 81mg',
      defaultDosages: ['1 tablet'],
      defaultInstructions: 'Take once daily'
    };
    service.addToLibrary(newEntry);
    const found = service.findByName('aspirin 81mg');
    expect(found).toBeDefined();
    expect(found?.defaultInstructions).toBe('Take once daily');
  });
});
