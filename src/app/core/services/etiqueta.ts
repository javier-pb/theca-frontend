import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Etiqueta {
  id?: string;
  nombre: string;
  fechaModificacion?: string;
  estadoSincronizacion?: string;
  usuarioId?: string;
}

@Injectable({ providedIn: 'root' })
// Servicio para las etiquetas:
export class EtiquetaService {
  private http = inject(HttpClient);
  private apiUrl = '/api/etiquetas';

  getAll(): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(this.apiUrl);
  }

  getById(id: string): Observable<Etiqueta> {
    return this.http.get<Etiqueta>(`${this.apiUrl}/${id}`);
  }

  create(data: { nombre: string }): Observable<Etiqueta> {
    return this.http.post<Etiqueta>(this.apiUrl, data);
  }

  update(id: string, data: { nombre: string }): Observable<Etiqueta> {
    return this.http.put<Etiqueta>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRecursosAsociados(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/recursos`);
  }

}
