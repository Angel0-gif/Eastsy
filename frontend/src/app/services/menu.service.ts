import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem, MenuCategory, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly API = `${environment.apiUrl}/menu`;

  constructor(private http: HttpClient) {}

  getAll(category?: MenuCategory, search?: string): Observable<PaginatedResponse<MenuItem>> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (search)   params = params.set('search', search);
    return this.http.get<PaginatedResponse<MenuItem>>(`${this.API}/items/`, { params });
  }

  getById(id: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.API}/items/${id}/`);
  }

  getCategories(): Observable<{ value: MenuCategory; label: string }[]> {
    return this.http.get<{ value: MenuCategory; label: string }[]>(`${this.API}/categories/`);
  }
}
