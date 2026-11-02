import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Visit } from '../visit';

@Component({
  imports: [DatePipe],
  selector: 'app-visit-detail',
  styleUrl: './visit-detail.css',
  templateUrl: './visit-detail.html',
})
export class VisitDetail {
  // Data flows in from the parent...
  readonly visit = input.required<Visit>();

  // ...and events flow back out.
  readonly closed = output<void>();
}
