import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedNews } from './featured-news';

describe('FeaturedNews', () => {
  let component: FeaturedNews;
  let fixture: ComponentFixture<FeaturedNews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedNews]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedNews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
