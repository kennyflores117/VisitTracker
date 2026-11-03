import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { VisitDetail } from '../visit-detail/visit-detail';
import { VisitService } from '../visit.service';

@Component({
  imports: [AsyncPipe, DatePipe, VisitDetail],
  selector: 'app-visit-list',
  styleUrl: './visit-list.css',
  templateUrl: './visit-list.html',
})
export class VisitList {
  private readonly visitService = inject(VisitService);

  // An Observable: nothing is requested until the async pipe subscribes in the template.
  protected readonly visits$ = this.visitService.getAll();

  protected readonly selectedId = signal<string | null>(null);

  protected select(id: string): void {
    this.selectedId.set(this.selectedId() === id ? null : id);
  }
}
