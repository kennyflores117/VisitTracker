import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateVisitRequest, Visit } from './visit';

@Service()
export class VisitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5212/api/visits';

  getAll(): Observable<Visit[]> {
    return this.http.get<Visit[]>(this.baseUrl);
  }

  getById(id: string): Observable<Visit> {
    return this.http.get<Visit>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateVisitRequest): Observable<Visit> {
    return this.http.post<Visit>(this.baseUrl, request);
  }

  getMissingClockIn(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.baseUrl}/missing-clock-in`);
  }
}
