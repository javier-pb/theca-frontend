import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tipo {
  id?: string;
  nombre: string;
  imagen?: string | null;
  fechaModificacion?: string;
  estadoSincronizacion?: string;
  usuarioId?: string;
  esPredeterminado?: boolean;
}

@Injectable({ providedIn: 'root' })
// Servicio para los tipos:
export class TipoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/tipos';

  getAll(): Observable<Tipo[]> {
    return this.http.get<Tipo[]>(this.apiUrl);
  }

  getById(id: string): Observable<Tipo> {
    return this.http.get<Tipo>(`${this.apiUrl}/${id}`);
  }

  create(data: { nombre: string; imagen?: string }): Observable<Tipo> {
    return this.http.post<Tipo>(this.apiUrl, data);
  }

  update(id: string, data: { nombre?: string; imagen?: string }): Observable<Tipo> {
    return this.http.put<Tipo>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRecursosAsociados(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/recursos`);
  }

}
