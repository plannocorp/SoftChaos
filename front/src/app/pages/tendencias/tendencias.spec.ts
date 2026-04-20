import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Tendencias } from './tendencias';

describe('Tendencias', () => {
  let component: Tendencias;
  let fixture: ComponentFixture<Tendencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tendencias],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tendencias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
