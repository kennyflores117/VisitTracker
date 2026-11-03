import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Visit } from './visit';
import { VisitService } from './visit.service';

describe('VisitService', () => {
  let service: VisitService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    // No providers entry for VisitService: @Service() should register it automatically.
    service = TestBed.inject(VisitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should GET all visits from the API', () => {
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

    let result: Visit[] | undefined;
    service.getAll().subscribe((v) => (result = v));

    const req = httpMock.expectOne('http://localhost:5212/api/visits');
    expect(req.request.method).toBe('GET');
    req.flush(visits);

    expect(result).toEqual(visits);
  });

  it('should GET one visit by id from the API', () => {
    let result: Visit | undefined;
    service.getById('abc').subscribe((v) => (result = v));

    const req = httpMock.expectOne('http://localhost:5212/api/visits/abc');
    expect(req.request.method).toBe('GET');
    const visit = { id: 'abc' } as Visit;
    req.flush(visit);

    expect(result).toEqual(visit);
  });

  it('should GET the visits missing a clock-in from the API', () => {
    let result: Visit[] | undefined;
    service.getMissingClockIn().subscribe((v) => (result = v));

    const req = httpMock.expectOne('http://localhost:5212/api/visits/missing-clock-in');
    expect(req.request.method).toBe('GET');
    req.flush([]);

    expect(result).toEqual([]);
  });
});
