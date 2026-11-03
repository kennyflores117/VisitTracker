import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
  {
    id: '2',
    clientName: 'Alice Brown',
    caregiverName: 'John Smith',
    scheduledStart: '2026-11-01T14:00:00-05:00',
    clockIn: null,
    clockOut: null,
    status: 'Missed',
  },
];

describe('VisitList', () => {
  let fixture: ComponentFixture<VisitList>;
  let httpMock: HttpTestingController;

  const page = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitList);
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  async function loadVisits(): Promise<void> {
    httpMock.expectOne('http://localhost:5212/api/visits').flush(visits);
    httpMock.expectOne('http://localhost:5212/api/visits/missing-clock-in').flush([visits[1]]);
    await fixture.whenStable();
  }

  it('should show a loading message until the visits arrive', () => {
    httpMock.expectOne('http://localhost:5212/api/visits');
    httpMock.expectOne('http://localhost:5212/api/visits/missing-clock-in');
    expect(page().textContent).toContain('Loading visits');
  });

  it('should render the visits returned by the API with the missing clock-in count', async () => {
    await loadVisits();

    expect(page().textContent).toContain('Visits (2 of 2)');
    expect(page().textContent).toContain('Jane Doe');
    expect(page().textContent).toContain('Alice Brown');
    expect(page().textContent).toContain('Missing clock-in: 1');
  });

  it('should link each visit to its detail page', async () => {
    await loadVisits();

    const hrefs = Array.from(page().querySelectorAll<HTMLAnchorElement>('a.visit')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(['/visits/1', '/visits/2']);
  });

  it('should only show visits matching the selected status filter', async () => {
    await loadVisits();

    const missedButton = Array.from(page().querySelectorAll<HTMLButtonElement>('.filters button')).find(
      (b) => b.textContent?.trim() === 'Missed',
    )!;
    missedButton.click();
    await fixture.whenStable();

    expect(page().textContent).toContain('Visits (1 of 2)');
    expect(page().textContent).toContain('Alice Brown');
    expect(page().textContent).not.toContain('Jane Doe');
  });

  it('should show the visits the API reports as missing a clock-in', async () => {
    await loadVisits();

    const button = Array.from(page().querySelectorAll<HTMLButtonElement>('.filters button')).find(
      (b) => b.textContent?.trim() === 'Missing clock-in',
    )!;
    button.click();
    await fixture.whenStable();

    expect(page().textContent).toContain('Visits (1 of 2)');
    expect(page().textContent).toContain('Alice Brown');
    expect(page().textContent).not.toContain('Jane Doe');
  });
});
