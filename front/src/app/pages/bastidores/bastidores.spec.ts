import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bastidores } from './bastidores';

describe('Bastidores', () => {
  let component: Bastidores;
  let fixture: ComponentFixture<Bastidores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bastidores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bastidores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
