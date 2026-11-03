import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { VisitDetail } from '../visit-detail/visit-detail';
import { VisitService } from '../visit.service';

@Component({
  imports: [RouterLink, VisitDetail],
  selector: 'app-visit-detail-page',
  styleUrl: './visit-detail-page.css',
  templateUrl: './visit-detail-page.html',
})
export class VisitDetailPage {
  private readonly visitService = inject(VisitService);

  // Filled from the :id route parameter by withComponentInputBinding() in app.config.ts.
  readonly id = input.required<string>();

  // undefined = still loading, null = not found (or the request failed), otherwise the visit.
  protected readonly visit = toSignal(
    toObservable(this.id).pipe(
      // switchMap cancels the previous request if the id changes before it finishes.
      // catchError sits inside it so one failed request doesn't end the whole stream.
      switchMap((id) => this.visitService.getById(id).pipe(catchError(() => of(null)))),
    ),
  );
}
