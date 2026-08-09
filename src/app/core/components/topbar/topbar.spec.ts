import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Topbar } from './topbar';

describe('Topbar', () => {
  let component: Topbar;
  let fixture: ComponentFixture<Topbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topbar],
      providers: [
        provideRouter([]),
        provideAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Topbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the topbar component', () => {
    expect(component).toBeTruthy();
  });
});
