import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Bastidores } from './bastidores';

describe('Bastidores', () => {
  let component: Bastidores;
  let fixture: ComponentFixture<Bastidores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bastidores],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
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
