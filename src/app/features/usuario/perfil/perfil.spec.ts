import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { PerfilComponent } from './perfil';
import { AuthService } from '../../../core/services/auth';
import { UsuarioService } from '../../../core/services/usuario';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let usuarioService: jasmine.SpyObj<UsuarioService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockPerfil = {
    id: '123',
    nombre: 'testuser',
    correo: 'test@email.com',
    fechaCreacion: '2026-05-09T10:00:00.000Z'
  };

  beforeEach(async () => {
    usuarioService = jasmine.createSpyObj('UsuarioService', ['getPerfil', 'eliminarCuenta']);
    authService = jasmine.createSpyObj('AuthService', ['logout', 'getUserId', 'getToken']);

    await TestBed.configureTestingModule({
      imports: [
        PerfilComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'login', component: DummyComponent },
          { path: 'cambiar-contrasena', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: UsuarioService, useValue: usuarioService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    usuarioService.getPerfil.calls.reset();
    usuarioService.eliminarCuenta.calls.reset();
    authService.logout.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with loading true', () => {
      expect(component.loading()).toBe(true);
      expect(component.usuario()).toBeNull();
      expect(component.error()).toBe('');
    });
  });

  describe('formatearFecha', () => {
    it('should return "No disponible" when fecha is empty', () => {
      expect(component.formatearFecha('')).toBe('No disponible');
      expect(component.formatearFecha(null as any)).toBe('No disponible');
    });

    it('should format date correctly to DD/MM/YYYY', () => {
      const result = component.formatearFecha('2026-05-09T10:00:00.000Z');
      expect(result).toBe('09/05/2026');
    });
  });

  describe('cargarPerfil', () => {
    it('should load perfil successfully', fakeAsync(() => {
      usuarioService.getPerfil.and.returnValue(of(mockPerfil));

      component.cargarPerfil();
      tick();

      expect(component.loading()).toBe(false);
      expect(component.usuario()).toEqual({
        nombre: 'testuser',
        correo: 'test@email.com',
        fechaCreacion: '09/05/2026'
      });
      expect(component.error()).toBe('');
    }));

    it('should handle error when loading perfil', fakeAsync(() => {
      usuarioService.getPerfil.and.returnValue(throwError(() => new Error('Error')));

      component.cargarPerfil();
      tick();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar el perfil');
      expect(component.usuario()).toBeNull();
    }));
  });

  describe('ngOnInit', () => {
    it('should call cargarPerfil on init', () => {
      spyOn(component, 'cargarPerfil');
      component.ngOnInit();
      expect(component.cargarPerfil).toHaveBeenCalled();
    });
  });

  describe('irCambiarContrasena', () => {
    it('should navigate to cambiar-contrasena', () => {
      spyOn(router, 'navigate');
      component.irCambiarContrasena();
      expect(router.navigate).toHaveBeenCalledWith(['/cambiar-contrasena']);
    });
  });

  describe('Modal de eliminar cuenta', () => {
    describe('abrirModalEliminar', () => {
      it('should open modal and clear fields', () => {
        component.abrirModalEliminar();
        expect(component.mostrarModalEliminar()).toBe(true);
        expect(component.contrasenaConfirmacion()).toBe('');
        expect(component.errorEliminar()).toBe('');
      });
    });

    describe('cerrarModal', () => {
      it('should close modal and clear fields', () => {
        component.mostrarModalEliminar.set(true);
        component.contrasenaConfirmacion.set('123456');
        component.errorEliminar.set('Some error');
        component.cerrarModal();
        expect(component.mostrarModalEliminar()).toBe(false);
        expect(component.contrasenaConfirmacion()).toBe('');
        expect(component.errorEliminar()).toBe('');
      });
    });

    describe('confirmarEliminarCuenta', () => {
      it('should show error if password is empty', () => {
        component.contrasenaConfirmacion.set('');
        component.confirmarEliminarCuenta();
        expect(component.errorEliminar()).toBe('Debes introducir tu contraseña');
        expect(usuarioService.eliminarCuenta).not.toHaveBeenCalled();
      });

      it('should call eliminarCuenta with password', fakeAsync(() => {
        component.contrasenaConfirmacion.set('123456');
        usuarioService.eliminarCuenta.and.returnValue(of('Cuenta eliminada'));
        component.confirmarEliminarCuenta();
        tick();
        expect(usuarioService.eliminarCuenta).toHaveBeenCalledWith('123456');
      }));

      it('should set eliminando to true during deletion', () => {
        component.contrasenaConfirmacion.set('123456');
        usuarioService.eliminarCuenta.and.returnValue(of('Cuenta eliminada'));
        component.confirmarEliminarCuenta();
        expect(component.eliminando()).toBe(true);
      });

      it('should call logout and navigate to login on success', fakeAsync(() => {
        spyOn(router, 'navigate');
        component.contrasenaConfirmacion.set('123456');
        usuarioService.eliminarCuenta.and.returnValue(of('Cuenta eliminada'));
        component.confirmarEliminarCuenta();
        tick();
        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      }));

      it('should handle error when deletion fails', fakeAsync(() => {
        component.contrasenaConfirmacion.set('123456');
        usuarioService.eliminarCuenta.and.returnValue(throwError(() => ({ error: { message: 'Contraseña incorrecta' } })));
        component.confirmarEliminarCuenta();
        tick();
        expect(component.eliminando()).toBe(false);
        expect(component.errorEliminar()).toBe('Contraseña incorrecta');
      }));

      it('should handle error without message', fakeAsync(() => {
        component.contrasenaConfirmacion.set('123456');
        usuarioService.eliminarCuenta.and.returnValue(throwError(() => ({})));
        component.confirmarEliminarCuenta();
        tick();
        expect(component.eliminando()).toBe(false);
        expect(component.errorEliminar()).toBe('Error al eliminar la cuenta. Contraseña incorrecta.');
      }));
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      usuarioService.getPerfil.and.returnValue(of(mockPerfil));
      component.cargarPerfil();
      fixture.detectChanges();
    });

    it('should render the perfil container', () => {
      const container = fixture.debugElement.nativeElement.querySelector('.perfil-container');
      expect(container).toBeTruthy();
    });

    it('should render the perfil content', () => {
      const content = fixture.debugElement.nativeElement.querySelector('.perfil-content');
      expect(content).toBeTruthy();
    });

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('PERFIL');
    });

    it('should render cambiar contraseña button', () => {
      const button = fixture.debugElement.nativeElement.querySelector('.btn-cambiar-password');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('CAMBIAR CONTRASEÑA');
    });

    it('should render eliminar cuenta button', () => {
      const button = fixture.debugElement.nativeElement.querySelector('.btn-eliminar-cuenta');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('ELIMINAR CUENTA');
    });

    it('should display nombre', () => {
      const nombreValue = fixture.debugElement.nativeElement.querySelector('.info-group:first-child .info-value');
      expect(nombreValue).toBeTruthy();
      expect(nombreValue.textContent).toContain('testuser');
    });

    it('should display correo', () => {
      const correoValue = fixture.debugElement.nativeElement.querySelector('.info-group:nth-child(2) .info-value');
      expect(correoValue).toBeTruthy();
      expect(correoValue.textContent).toContain('test@email.com');
    });

    it('should display fechaCreacion', () => {
      const fechaValue = fixture.debugElement.nativeElement.querySelector('.info-group:last-child .info-value');
      expect(fechaValue).toBeTruthy();
      expect(fechaValue.textContent).toContain('09/05/2026');
    });
  });
});
