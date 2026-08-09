import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Complains } from './complains';

describe('Complains', () => {
  let component: Complains;
  let fixture: ComponentFixture<Complains>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Complains],
    }).compileComponents();

    fixture = TestBed.createComponent(Complains);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
