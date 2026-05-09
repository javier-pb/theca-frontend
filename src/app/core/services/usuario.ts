import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
// Servicio para el usuario:
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = '/api/usuarios';
  static getPerfil: any;

  // Obtener el perfil del usuario autenticado:
  getPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  // Eliminar la cuenta verificando contraseña:
  eliminarCuenta(contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/eliminar`, { contrasena }, {
      responseType: 'text'
    });
  }

  cambiarContrasena(data: { contrasenaActual: string; nuevaContrasena: string }): Observable<string> {
    return this.http.post(`${this.apiUrl}/cambiar-contrasena`, data, {
      responseType: 'text'
    });
  }

}
