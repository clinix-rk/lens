import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MultiSelectWithAdd } from './multi-select-with-add';

describe('MultiSelectWithAdd', () => {
  let component: MultiSelectWithAdd;
  let fixture: ComponentFixture<MultiSelectWithAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectWithAdd, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSelectWithAdd);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', ['Option A', 'Option B']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write values correctly via ControlValueAccessor writeValue', () => {
    component.writeValue(['Option A']);
    expect(component.selectedValue).toEqual(['Option A']);
  });

  it('should emit optionAdded and select new item when addNewItem is called', () => {
    let emitted: string | null = null;
    component.optionAdded.subscribe(val => emitted = val);

    const mockEvent = new MouseEvent('click');
    component.addNewItem(mockEvent, 'Option C');

    expect(emitted).toBe('Option C');
    expect(component.selectedValue).toContain('Option C');
  });
});
