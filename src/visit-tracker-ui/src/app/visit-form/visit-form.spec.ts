import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { VisitForm } from './visit-form';

const url = 'http://localhost:5212/api/visits';

describe('VisitForm', () => {
  let fixture: ComponentFixture<VisitForm>;
  let httpMock: HttpTestingController;

  const page = () => fixture.nativeElement as HTMLElement;

  function type(id: string, value: string): void {
    const input = page().querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function submit(): Promise<void> {
    page().querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  function fillValidForm(): void {
    type('clientName', 'Jane Doe');
    type('caregiverName', 'John Smith');
    type('scheduledStart', '2026-11-05T09:00');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitForm],
      providers: [
        provideRouter([{ path: 'visits/:id', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitForm);
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should not call the API and should show errors when the form is empty', async () => {
    await submit();

    httpMock.expectNone(url);
    expect(page().textContent).toContain("Enter the client's name");
    expect(page().textContent).toContain("Enter the caregiver's name");
    expect(page().textContent).toContain('Choose a date and time');
  });

  it('should reject a blank client name', async () => {
    fillValidForm();
    type('clientName', '   ');
    await submit();

    httpMock.expectNone(url);
    expect(page().textContent).toContain("Enter the client's name");
  });

  it('should POST the visit and navigate to its detail page', async () => {
    fillValidForm();
    await submit();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      clientName: 'Jane Doe',
      caregiverName: 'John Smith',
      scheduledStart: new Date('2026-11-05T09:00').toISOString(),
    });
    req.flush({ id: 'new-id' });
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/visits/new-id');
  });

  it('should show an error message and re-enable the button when saving fails', async () => {
    fillValidForm();
    await submit();

    httpMock.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(page().textContent).toContain('Could not save the visit');
    expect(page().querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
  });
});
