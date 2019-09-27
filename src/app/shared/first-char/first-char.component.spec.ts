import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstCharComponent } from './first-char.component';

describe('FirstCharComponent', () => {
  let component: FirstCharComponent;
  let fixture: ComponentFixture<FirstCharComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstCharComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstCharComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
