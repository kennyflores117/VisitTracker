import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError, of } from 'rxjs';
import { VisitStatus } from '../visit';
import { VisitService } from '../visit.service';

type StatusFilter = VisitStatus | 'All' | 'MissingClockIn';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-visit-list',
  styleUrl: './visit-list.css',
  templateUrl: './visit-list.html',
})
export class VisitList {
  private readonly visitService = inject(VisitService);

  protected readonly loadFailed = signal(false);

  // undefined until the response arrives, which is how the template knows it is still loading.
  // On an HTTP error toSignal would rethrow when the signal is read, so catch it here, flag it,
  // and complete without emitting (EMPTY) so visits stays undefined.
  protected readonly visits = toSignal(
    this.visitService.getAll().pipe(
      catchError(() => {
        this.loadFailed.set(true);
        return EMPTY;
      }),
    ),
  );

  protected readonly filters: { value: StatusFilter; label: string }[] = [
    { value: 'All', label: 'All' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'InProgress', label: 'InProgress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Missed', label: 'Missed' },
    { value: 'MissingClockIn', label: 'Missing clock-in' },
  ];
  protected readonly statusFilter = signal<StatusFilter>('All');

  protected readonly filteredVisits = computed(() => {
    const all = this.visits() ?? [];
    const filter = this.statusFilter();

    switch (filter) {
      case 'All':
        return all;
      case 'MissingClockIn': {
        const missingIds = new Set((this.missingClockIn() ?? []).map((v) => v.id));
        return all.filter((v) => missingIds.has(v.id));
      }
      default:
        return all.filter((v) => v.status === filter);
    }
  });

  // The API owns the "missing clock-in" rule, so the UI asks it instead of recomputing it.
  // The count is secondary, so if this call fails the page just leaves it out.
  protected readonly missingClockIn = toSignal(
    this.visitService.getMissingClockIn().pipe(catchError(() => of(undefined))),
  );
}
