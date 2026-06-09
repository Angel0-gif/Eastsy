import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  create(tableId: number, items: { menu_item: number; quantity: number }[]): Observable<Order> {
    return this.http.post<Order>(`${this.API}/`, { table: tableId, items });
  }

  getMyOrders(): Observable<PaginatedResponse<Order>> {
    return this.http.get<PaginatedResponse<Order>>(`${this.API}/`);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.API}/${id}/`);
  }

  /** Poll order status every 10 seconds */
  trackOrder(id: number): Observable<Order> {
    return interval(10_000).pipe(
      switchMap(() => this.getById(id))
    );
  }
}
