import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Opiniao } from './opiniao';

describe('Opiniao', () => {
  let component: Opiniao;
  let fixture: ComponentFixture<Opiniao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Opiniao],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Opiniao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
