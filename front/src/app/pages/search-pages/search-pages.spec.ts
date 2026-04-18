import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPages } from './search-pages';

describe('SearchPages', () => {
  let component: SearchPages;
  let fixture: ComponentFixture<SearchPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPages]
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
