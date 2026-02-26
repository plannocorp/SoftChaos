import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Opiniao } from './opiniao';

describe('Opiniao', () => {
  let component: Opiniao;
  let fixture: ComponentFixture<Opiniao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Opiniao]
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
