export type VisitStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Missed';

// Mirrors VisitResponse in the API. Dates arrive as ISO-8601 strings in JSON.
export interface Visit {
  id: string;
  clientName: string;
  caregiverName: string;
  scheduledStart: string;
  clockIn: string | null;
  clockOut: string | null;
  status: VisitStatus;
}

// Mirrors CreateVisitRequest in the API; the server sets everything else.
export interface CreateVisitRequest {
  clientName: string;
  caregiverName: string;
  scheduledStart: string;
}
