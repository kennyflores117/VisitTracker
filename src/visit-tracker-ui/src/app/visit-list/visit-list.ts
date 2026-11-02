import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Visit } from '../visit';

@Component({
  imports: [DatePipe],
  selector: 'app-visit-list',
  styleUrl: './visit-list.css',
  templateUrl: './visit-list.html',
})
export class VisitList {
  // Hard-coded for now; a service will replace this with data from the API.
  protected readonly visits = signal<Visit[]>([
    {
      id: '1',
      clientName: 'Jane Doe',
      caregiverName: 'John Smith',
      scheduledStart: '2026-11-02T09:00:00-05:00',
      clockIn: '2026-11-02T09:02:00-05:00',
      clockOut: null,
      status: 'InProgress',
    },
    {
      id: '2',
      clientName: 'Robert Lee',
      caregiverName: 'Maria Garcia',
      scheduledStart: '2026-11-02T11:30:00-05:00',
      clockIn: null,
      clockOut: null,
      status: 'Scheduled',
    },
    {
      id: '3',
      clientName: 'Alice Brown',
      caregiverName: 'John Smith',
      scheduledStart: '2026-11-01T14:00:00-05:00',
      clockIn: null,
      clockOut: null,
      status: 'Missed',
    },
  ]);

  protected readonly selectedId = signal<string | null>(null);

  protected select(id: string): void {
    this.selectedId.set(this.selectedId() === id ? null : id);
  }
}
