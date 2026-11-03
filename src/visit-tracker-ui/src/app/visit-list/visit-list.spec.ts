import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Visit } from '../visit';
import { VisitList } from './visit-list';

const visits: Visit[] = [
  {
    id: '1',
    clientName: 'Jane Doe',
    caregiverName: 'John Smith',
    scheduledStart: '2026-11-02T09:00:00-05:00',
    clockIn: null,
    clockOut: null,
    status: 'Scheduled',
  },
];

describe('VisitList', () => {
  let fixture: ComponentFixture<VisitList>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitList);
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should show a loading message until the visits arrive', () => {
    httpMock.expectOne('http://localhost:5212/api/visits');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading visits');
  });

  it('should render the visits returned by the API', async () => {
    httpMock.expectOne('http://localhost:5212/api/visits').flush(visits);
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Visits (1)');
    expect(text).toContain('Jane Doe');
  });
});
