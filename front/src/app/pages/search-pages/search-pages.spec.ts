import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { SearchPages } from './search-pages';

describe('SearchPages', () => {
  let component: SearchPages;
  let fixture: ComponentFixture<SearchPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPages],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ q: '' }),
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchPages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
