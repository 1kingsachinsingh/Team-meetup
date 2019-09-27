import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCoverComponent } from './my-cover.component';

describe('MyCoverComponent', () => {
  let component: MyCoverComponent;
  let fixture: ComponentFixture<MyCoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyCoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
