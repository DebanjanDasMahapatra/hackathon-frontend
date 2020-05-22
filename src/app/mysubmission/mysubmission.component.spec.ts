import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MysubmissionComponent } from './mysubmission.component';

describe('MysubmissionComponent', () => {
  let component: MysubmissionComponent;
  let fixture: ComponentFixture<MysubmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MysubmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MysubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
