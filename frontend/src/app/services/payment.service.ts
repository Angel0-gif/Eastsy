import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentRequest, PaymentResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly API = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  initiate(data: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.API}/initiate/`, data);
  }

  getStatus(id: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.API}/${id}/`);
  }
}
