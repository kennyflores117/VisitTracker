import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Visit } from '../visit';
import { VisitDetailPage } from './visit-detail-page';

const visit: Visit = {
  id: '1',
  clientName: 'Jane Doe',
  caregiverName: 'John Smith',
  scheduledStart: '2026-11-02T09:00:00-05:00',
  clockIn: null,
  clockOut: null,
  status: 'Scheduled',
};

describe('VisitDetailPage', () => {
  let fixture: ComponentFixture<VisitDetailPage>;
  let httpMock: HttpTestingController;

  const page = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitDetailPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitDetailPage);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('id', '1');
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should request the visit with the id from the route and show a loading message', () => {
    httpMock.expectOne('http://localhost:5212/api/visits/1');
    expect(page().textContent).toContain('Loading visit');
  });

  it('should show the visit once it arrives', async () => {
    httpMock.expectOne('http://localhost:5212/api/visits/1').flush(visit);
    await fixture.whenStable();

    expect(page().textContent).toContain('Jane Doe');
    expect(page().textContent).toContain('John Smith');
  });

  it('should show a not-found message when the API returns 404', async () => {
    httpMock
      .expectOne('http://localhost:5212/api/visits/1')
      .flush(null, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect(page().textContent).toContain('Visit not found');
  });
});
