import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Visit } from '../visit';
import { VisitDetail } from './visit-detail';

const visit: Visit = {
  id: '1',
  clientName: 'Jane Doe',
  caregiverName: 'John Smith',
  scheduledStart: '2026-11-02T09:00:00-05:00',
  clockIn: null,
  clockOut: null,
  status: 'Scheduled',
};

describe('VisitDetail', () => {
  let component: VisitDetail;
  let fixture: ComponentFixture<VisitDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitDetail);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visit', visit);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the caregiver and a not-clocked-in message', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('John Smith');
    expect(text).toContain('Not clocked in');
  });

  it('should emit closed when Close is clicked', () => {
    let emitted = false;
    component.closed.subscribe(() => (emitted = true));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(emitted).toBe(true);
  });
});
