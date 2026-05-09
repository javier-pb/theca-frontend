import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
// Servicio para manejar las operaciones CRUD y búsqueda de recursos:
export class RecursoService {

  private apiUrl = '/api/recursos';

  constructor(private http: HttpClient) {}

  getAll(usuarioId?: string): Observable<any[]> {
    const params = usuarioId ? `?usuarioId=${usuarioId}` : '';
    return this.http.get<any[]>(`${this.apiUrl}${params}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(recurso: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, recurso);
  }

  update(id: string, recurso: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, recurso);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  search(filtros: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/buscar`, filtros);
  }

}
