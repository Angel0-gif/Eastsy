import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reservation, ReservationRequest, Table, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly API = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  getTables(date?: string, time?: string): Observable<Table[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (time) params = params.set('time', time);
    return this.http.get<Table[]>(`${environment.apiUrl}/tables/`, { params });
  }

  create(data: ReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.API}/`, data);
  }

  getMyReservations(): Observable<PaginatedResponse<Reservation>> {
    return this.http.get<PaginatedResponse<Reservation>>(`${this.API}/`);
  }

  cancel(id: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.API}/${id}/`, { status: 'cancelled' });
  }
}
