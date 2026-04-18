import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Novidades } from './novidades';

describe('Novidades', () => {
  let component: Novidades;
  let fixture: ComponentFixture<Novidades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Novidades]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Novidades);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
