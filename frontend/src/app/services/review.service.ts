import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Review, ReviewRequest, ReviewSummary, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly API = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PaginatedResponse<Review>> {
    return this.http.get<PaginatedResponse<Review>>(`${this.API}/`);
  }

  getSummary(): Observable<ReviewSummary> {
    return this.http.get<ReviewSummary>(`${this.API}/summary/`);
  }

  create(data: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.API}/`, data);
  }
}
