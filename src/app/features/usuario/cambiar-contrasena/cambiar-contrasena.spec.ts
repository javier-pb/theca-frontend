import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { delay, of, throwError } from 'rxjs';

import { CambiarContrasenaComponent } from './cambiar-contrasena';
import { AuthService } from '../../../core/services/auth';
import { UsuarioService } from '../../../core/services/usuario';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

describe('CambiarContrasenaComponent', () => {
  let component: CambiarContrasenaComponent;
  let fixture: ComponentFixture<CambiarContrasenaComponent>;
  let usuarioService: jasmine.SpyObj<UsuarioService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    usuarioService = jasmine.createSpyObj('UsuarioService', ['cambiarContrasena']);
    authService = jasmine.createSpyObj('AuthService', ['getUserId', 'getToken']);

    await TestBed.configureTestingModule({
      imports: [
        CambiarContrasenaComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'perfil', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: UsuarioService, useValue: usuarioService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CambiarContrasenaComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    usuarioService.cambiarContrasena.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty form fields', () => {
      expect(component.contrasenaActual()).toBe('');
      expect(component.nuevaContrasena()).toBe('');
      expect(component.repetirContrasena()).toBe('');
      expect(component.loading()).toBe(false);
      expect(component.mensajeExito()).toBe('');
      expect(component.errorGeneral()).toBe('');
    });
  });

  describe('Validations', () => {
    it('should validate current password is required', () => {
      component.contrasenaActual.set('');
      component.nuevaContrasena.set('123456');
      component.repetirContrasena.set('123456');

      expect(component.validarCampos()).toBe(false);
      expect(component.errorContrasenaActual()).toBe('La contraseña actual es obligatoria');
    });

    it('should validate new password is required', () => {
      component.contrasenaActual.set('123456');
      component.nuevaContrasena.set('');
      component.repetirContrasena.set('');

      expect(component.validarCampos()).toBe(false);
      expect(component.errorNuevaContrasena()).toBe('La nueva contraseña es obligatoria');
    });

    it('should validate new password minimum length of 6 characters', () => {
      component.contrasenaActual.set('123456');
      component.nuevaContrasena.set('12345');
      component.repetirContrasena.set('12345');

      expect(component.validarCampos()).toBe(false);
      expect(component.errorNuevaContrasena()).toBe('La nueva contraseña debe tener al menos 6 caracteres');
    });

    it('should validate passwords match', () => {
      component.contrasenaActual.set('123456');
      component.nuevaContrasena.set('1234567');
      component.repetirContrasena.set('1234568');

      expect(component.validarCampos()).toBe(false);
      expect(component.errorRepetirContrasena()).toBe('Las contraseñas no coinciden');
    });

    it('should validate new password is different from current', () => {
      component.contrasenaActual.set('123456');
      component.nuevaContrasena.set('123456');
      component.repetirContrasena.set('123456');

      expect(component.validarCampos()).toBe(false);
      expect(component.errorNuevaContrasena()).toBe('La nueva contraseña debe ser diferente a la actual');
    });

    it('should accept valid passwords', () => {
      component.contrasenaActual.set('123456');
      component.nuevaContrasena.set('654321');
      component.repetirContrasena.set('654321');

      expect(component.validarCampos()).toBe(true);
      expect(component.errorContrasenaActual()).toBe('');
      expect(component.errorNuevaContrasena()).toBe('');
      expect(component.errorRepetirContrasena()).toBe('');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.contrasenaActual.set('123456');
      component.nuevaContrasena.set('654321');
      component.repetirContrasena.set('654321');
    });

    it('should call usuarioService.cambiarContrasena on valid submission', fakeAsync(() => {
      usuarioService.cambiarContrasena.and.returnValue(of('Contraseña cambiada exitosamente'));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(usuarioService.cambiarContrasena).toHaveBeenCalledWith({
        contrasenaActual: '123456',
        nuevaContrasena: '654321'
      });
    }));

    it('should set loading to true during submission', fakeAsync(() => {
      component.contrasenaActual.set('123456');
      component.nuevaContrasena.set('654321');
      component.repetirContrasena.set('654321');

      usuarioService.cambiarContrasena.and.returnValue(of('Success').pipe(delay(100)));

      component.onSubmit();

      expect(component.loading()).toBe(true);

      tick(100);
    }));

    it('should set loading to false after successful submission', fakeAsync(() => {
      usuarioService.cambiarContrasena.and.returnValue(of('Contraseña cambiada exitosamente'));

      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
    }));

    it('should show success message on successful submission', fakeAsync(() => {
      usuarioService.cambiarContrasena.and.returnValue(of('Contraseña cambiada exitosamente'));

      component.onSubmit();
      tick();

      expect(component.mensajeExito()).toBe('Contraseña cambiada exitosamente');
    }));

    it('should clear form fields on successful submission', fakeAsync(() => {
      usuarioService.cambiarContrasena.and.returnValue(of('Success'));

      component.onSubmit();
      tick();

      expect(component.contrasenaActual()).toBe('');
      expect(component.nuevaContrasena()).toBe('');
      expect(component.repetirContrasena()).toBe('');
    }));

    it('should navigate to perfil after 2 seconds on success', fakeAsync(() => {
      usuarioService.cambiarContrasena.and.returnValue(of('Success'));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick(2000);

      expect(router.navigate).toHaveBeenCalledWith(['/perfil']);
    }));

    it('should handle error with string error message', fakeAsync(() => {
      usuarioService.cambiarContrasena.and.returnValue(throwError(() => ({ error: 'Error del servidor' })));

      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
      expect(component.errorGeneral()).toBe('Error del servidor');
    }));

    it('should handle error with status 400', fakeAsync(() => {
      usuarioService.cambiarContrasena.and.returnValue(throwError(() => ({ status: 400 })));

      component.onSubmit();
      tick();

      expect(component.errorGeneral()).toBe('Contraseña actual incorrecta');
    }));

    it('should handle generic error', fakeAsync(() => {
      usuarioService.cambiarContrasena.and.returnValue(throwError(() => ({ status: 500 })));

      component.onSubmit();
      tick();

      expect(component.errorGeneral()).toBe('Error al cambiar la contraseña');
    }));

    it('should not submit if validation fails', () => {
      component.contrasenaActual.set('');
      component.onSubmit();

      expect(usuarioService.cambiarContrasena).not.toHaveBeenCalled();
      expect(component.errorContrasenaActual()).toBe('La contraseña actual es obligatoria');
    });
  });

  describe('Template rendering', () => {
    it('should render the container', () => {
      const container = fixture.debugElement.nativeElement.querySelector('.cambiar-contrasena-container');
      expect(container).toBeTruthy();
    });

    it('should render the content wrapper', () => {
      const content = fixture.debugElement.nativeElement.querySelector('.cambiar-contrasena-content');
      expect(content).toBeTruthy();
    });

    it('should render title in uppercase', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('CAMBIAR CONTRASEÑA');
    });

    it('should render 3 password input fields', () => {
      const inputs = fixture.debugElement.nativeElement.querySelectorAll('input');
      expect(inputs.length).toBe(3);
      inputs.forEach((input: HTMLInputElement) => {
        expect(input.getAttribute('type')).toBe('password');
      });
    });

    it('should render submit button', () => {
      const button = fixture.debugElement.nativeElement.querySelector('.btn-cambiar');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Cambiar');
    });

    it('should show loading text on button when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector('.btn-cambiar');
      expect(button.textContent).toContain('Cambiando...');
    });

    it('should show error message when errorGeneral is set', () => {
      component.errorGeneral.set('Error de prueba');
      fixture.detectChanges();

      const errorEl = fixture.debugElement.nativeElement.querySelector('.error-general');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent).toContain('Error de prueba');
    });

    it('should show success message when mensajeExito is set', () => {
      component.mensajeExito.set('Contraseña cambiada');
      fixture.detectChanges();

      const successEl = fixture.debugElement.nativeElement.querySelector('.success-message');
      expect(successEl).toBeTruthy();
      expect(successEl.textContent).toContain('Contraseña cambiada');
    });

    it('should show field error messages', () => {
      component.errorContrasenaActual.set('Error actual');
      component.errorNuevaContrasena.set('Error nueva');
      component.errorRepetirContrasena.set('Error repetir');
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.nativeElement.querySelectorAll('.error-message');
      expect(errorMessages.length).toBe(3);
    });
  });

});
