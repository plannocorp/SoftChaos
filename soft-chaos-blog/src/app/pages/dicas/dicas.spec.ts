import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dicas } from './dicas';

describe('Dicas', () => {
  let component: Dicas;
  let fixture: ComponentFixture<Dicas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dicas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dicas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
