import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Autor {
  id?: string;
  nombre: string;
  fechaModificacion?: string;
  estadoSincronizacion?: string;
  usuarioId?: string;
}

@Injectable({ providedIn: 'root' })
// Servicio para los autores:
export class AutorService {
  private http = inject(HttpClient);
  private apiUrl = '/api/autores';

  getAll(): Observable<Autor[]> {
    return this.http.get<Autor[]>(this.apiUrl);
  }

  getById(id: string): Observable<Autor> {
    return this.http.get<Autor>(`${this.apiUrl}/${id}`);
  }

  create(data: { nombre: string }): Observable<Autor> {
    return this.http.post<Autor>(this.apiUrl, data);
  }

  update(id: string, data: { nombre: string }): Observable<Autor> {
    return this.http.put<Autor>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRecursosAsociados(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/recursos`);
  }

  asociarRecursos(id: string, recursosIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/recursos`, { recursosIds });
  }

  desasociarRecursos(id: string, recursosIds: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/recursos`, { body: { recursosIds } });
  }

}
