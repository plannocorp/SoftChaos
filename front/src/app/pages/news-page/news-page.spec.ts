import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { NewsPage } from './news-page';

describe('NewsPage', () => {
  let component: NewsPage;
  let fixture: ComponentFixture<NewsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ slug: 'teste' })),
            snapshot: {
              paramMap: convertToParamMap({ slug: 'teste' })
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
