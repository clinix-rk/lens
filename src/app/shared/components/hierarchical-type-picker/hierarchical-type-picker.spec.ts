import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HierarchicalTypePicker } from './hierarchical-type-picker';
import { TypeNode } from './hierarchical-type.model';

describe('HierarchicalTypePicker', () => {
  let component: HierarchicalTypePicker;
  let fixture: ComponentFixture<HierarchicalTypePicker>;

  const mockTree: TypeNode[] = [
    {
      label: 'Ear Symptoms',
      children: [
        { label: 'Ear Pain' },
        { label: 'Hearing Loss' }
      ]
    },
    { label: 'Throat Symptoms' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HierarchicalTypePicker]
    }).compileComponents();

    fixture = TestBed.createComponent(HierarchicalTypePicker);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tree', mockTree);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write value and update selectedValue', () => {
    component.writeValue('Ear Pain');
    expect(component.selectedValue).toBe('Ear Pain');
  });

  it('should toggle dropdown open and close', () => {
    expect(component.isOpen).toBe(false);
    component.toggleDropdown();
    expect(component.isOpen).toBe(true);
    component.toggleDropdown();
    expect(component.isOpen).toBe(false);
  });

  it('should track expanded nodes', () => {
    const parentNode = mockTree[0];
    const event = new MouseEvent('click');
    component.toggleExpand(parentNode, event);
    expect(component.isExpanded(parentNode)).toBe(true);
    component.toggleExpand(parentNode, event);
    expect(component.isExpanded(parentNode)).toBe(false);
  });
});
