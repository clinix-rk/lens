import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Search } from './search';

describe('Search', () => {
  let component: Search;
  let fixture: ComponentFixture<Search>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Search],
      providers: [
        provideAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the search component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with all mock data results', () => {
    fixture.detectChanges();
    expect(component.filteredResults().length).toBe(5);
  });

  it('should filter results by query', () => {
    component.searchQuery.set('Sarah');
    component.onSearch();
    fixture.detectChanges();
    
    const results = component.filteredResults();
    expect(results.length).toBe(1);
    expect(results[0].title).toContain('Sarah');
  });

  it('should filter results by category chip selection', () => {
    component.setFilter('doctors');
    fixture.detectChanges();
    
    const results = component.filteredResults();
    expect(results.every(r => r.type === 'doctor')).toBe(true);
    expect(results.length).toBe(2);
  });
});
