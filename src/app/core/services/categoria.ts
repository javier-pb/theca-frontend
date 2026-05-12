import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id?: string;
  nombre: string;
  categoriaPadreId?: string | null;
  fechaModificacion?: string;
  estadoSincronizacion?: string;
  usuarioId?: string;
}

@Injectable({ providedIn: 'root' })
// Servicio para gestionar categorías:
export class CategoriaService {

  private http = inject(HttpClient);
  private apiUrl = '/api/categorias';

  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  getById(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  create(data: { nombre: string; categoriaPadreId?: string }): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, data);
  }

  update(id: string, data: { nombre?: string; categoriaPadreId?: string }): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
