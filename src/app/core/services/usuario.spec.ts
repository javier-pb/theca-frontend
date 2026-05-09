import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UsuarioService } from './usuario';

// Test unitario para el servicio de usuario:
describe('UsuarioService', () => {

  let service: UsuarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuarioService]
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPerfil', () => {
    it('should call GET /api/usuarios/perfil and return user profile', () => {
      const mockPerfil = {
        id: '123',
        nombre: 'testuser',
        correo: 'test@email.com',
        fechaCreacion: '2026-05-09T10:00:00'
      };

      service.getPerfil().subscribe(perfil => {
        expect(perfil).toEqual(mockPerfil);
        expect(perfil.nombre).toBe('testuser');
        expect(perfil.correo).toBe('test@email.com');
      });

      const req = httpMock.expectOne('/api/usuarios/perfil');
      expect(req.request.method).toBe('GET');
      req.flush(mockPerfil);
    });

    it('should handle error when getPerfil fails', () => {
      service.getPerfil().subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('/api/usuarios/perfil');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('eliminarCuenta', () => {
    it('should call POST /api/usuarios/eliminar with password and return text response', () => {
      const contrasena = '123456';
      const mockResponse = 'Cuenta eliminada exitosamente';

      service.eliminarCuenta(contrasena).subscribe(response => {
        expect(response).toBe(mockResponse);
      });

      const req = httpMock.expectOne('/api/usuarios/eliminar');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ contrasena });
      expect(req.request.responseType).toBe('text');
      req.flush(mockResponse);
    });

    it('should handle error when password is incorrect', () => {
      const contrasena = 'wrongpassword';

      service.eliminarCuenta(contrasena).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe('Contraseña incorrecta');
        }
      });

      const req = httpMock.expectOne('/api/usuarios/eliminar');
      req.flush('Contraseña incorrecta', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('cambiarContrasena', () => {
    it('should call POST /api/usuarios/cambiar-contrasena with passwords and return text response', () => {
      const data = {
        contrasenaActual: '123456',
        nuevaContrasena: '654321'
      };
      const mockResponse = 'Contraseña cambiada exitosamente';

      service.cambiarContrasena(data).subscribe(response => {
        expect(response).toBe(mockResponse);
      });

      const req = httpMock.expectOne('/api/usuarios/cambiar-contrasena');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      expect(req.request.responseType).toBe('text');
      req.flush(mockResponse);
    });

    it('should handle error when current password is incorrect', () => {
      const data = {
        contrasenaActual: 'wrongpassword',
        nuevaContrasena: '654321'
      };

      service.cambiarContrasena(data).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe('Contraseña actual incorrecta');
        }
      });

      const req = httpMock.expectOne('/api/usuarios/cambiar-contrasena');
      req.flush('Contraseña actual incorrecta', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle error when new password is same as current', () => {
      const data = {
        contrasenaActual: '123456',
        nuevaContrasena: '123456'
      };

      service.cambiarContrasena(data).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe('La nueva contraseña debe ser diferente a la actual');
        }
      });

      const req = httpMock.expectOne('/api/usuarios/cambiar-contrasena');
      req.flush('La nueva contraseña debe ser diferente a la actual', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server error', () => {
      const data = {
        contrasenaActual: '123456',
        nuevaContrasena: '654321'
      };

      service.cambiarContrasena(data).subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/usuarios/cambiar-contrasena');
      req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
    });
  });

});
