import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Visit } from '../visit';

@Component({
  imports: [DatePipe],
  selector: 'app-visit-detail',
  styleUrl: './visit-detail.css',
  templateUrl: './visit-detail.html',
})
export class VisitDetail {
  // Purely presentational: the parent decides which visit to show.
  readonly visit = input.required<Visit>();
}
