import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportComplaintComponent } from './report-complaint.component';

describe('ReportComplaintComponent', () => {
  let component: ReportComplaintComponent;
  let fixture: ComponentFixture<ReportComplaintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportComplaintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
