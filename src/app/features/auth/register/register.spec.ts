import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { delay, of, throwError } from 'rxjs';

import { RegisterComponent } from './register';
import { AuthService } from '../../../core/services/auth';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el registro de usuarios:
describe('RegisterComponent', () => {

  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'login', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockAuthService.register.calls.reset();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form fields', () => {
    expect(component.nombre()).toBe('');
    expect(component.correo()).toBe('');
    expect(component.contrasena()).toBe('');
    expect(component.repetirContrasena()).toBe('');
    expect(component.loading()).toBe(false);
    expect(component.errorNombre()).toBe('');
    expect(component.errorEmail()).toBe('');
    expect(component.errorContrasena()).toBe('');
    expect(component.errorPasswordMatch()).toBe('');
    expect(component.errorGeneral()).toBe('');
    expect(component.mensajeExito()).toBe('');
  });

  it('should bind input values to component properties', () => {
    const nombreInput = fixture.debugElement.nativeElement.querySelector('input[name="nombre"]');
    const correoInput = fixture.debugElement.nativeElement.querySelector('input[name="correo"]');
    const contrasenaInput = fixture.debugElement.nativeElement.querySelector('input[name="contrasena"]');
    const repetirInput = fixture.debugElement.nativeElement.querySelector('input[name="repetirContrasena"]');

    nombreInput.value = 'testuser';
    nombreInput.dispatchEvent(new Event('input'));
    correoInput.value = 'test@email.com';
    correoInput.dispatchEvent(new Event('input'));
    contrasenaInput.value = '123456';
    contrasenaInput.dispatchEvent(new Event('input'));
    repetirInput.value = '123456';
    repetirInput.dispatchEvent(new Event('input'));

    expect(component.nombre()).toBe('testuser');
    expect(component.correo()).toBe('test@email.com');
    expect(component.contrasena()).toBe('123456');
    expect(component.repetirContrasena()).toBe('123456');
  });

  it('should call authService.register with user data', fakeAsync(() => {
    component.nombre.set('newuser');
    component.correo.set('new@email.com');
    component.contrasena.set('123456');
    component.repetirContrasena.set('123456');
    mockAuthService.register.and.returnValue(of('¡Usuario registrado con éxito!'));

    component.onSubmit();
    tick();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      nombre: 'newuser',
      correo: 'new@email.com',
      contrasena: '123456'
    });
  }));

  it('should set loading to true during registration', () => {
    component.nombre.set('newuser');
    component.correo.set('new@email.com');
    component.contrasena.set('123456');
    component.repetirContrasena.set('123456');
    mockAuthService.register.and.returnValue(of('Éxito').pipe(delay(1000)));

    component.onSubmit();

    expect(component.loading()).toBe(true);
  });

  it('should set loading to false after successful registration', fakeAsync(() => {
    component.nombre.set('newuser');
    component.correo.set('new@email.com');
    component.contrasena.set('123456');
    component.repetirContrasena.set('123456');
    mockAuthService.register.and.returnValue(of('Éxito'));

    component.onSubmit();
    tick();

    expect(component.loading()).toBe(false);
  }));

  it('should show success message after successful registration', fakeAsync(() => {
    component.nombre.set('newuser');
    component.correo.set('new@email.com');
    component.contrasena.set('123456');
    component.repetirContrasena.set('123456');
    mockAuthService.register.and.returnValue(of('¡Usuario registrado con éxito!'));

    component.onSubmit();
    tick();

    expect(component.mensajeExito()).toBe('¡Usuario registrado con éxito!');
  }));

  it('should navigate to /login after successful registration', fakeAsync(() => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.nombre.set('newuser');
    component.correo.set('new@email.com');
    component.contrasena.set('123456');
    component.repetirContrasena.set('123456');
    mockAuthService.register.and.returnValue(of('Éxito'));

    component.onSubmit();
    tick(2000);

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should show error when nombre is empty', () => {
    component.nombre.set('');
    component.onSubmit();
    expect(component.errorNombre()).toBe('El nombre es obligatorio');
  });

  it('should show error when nombre is too short', () => {
    component.nombre.set('ab');
    component.onSubmit();
    expect(component.errorNombre()).toBe('El nombre debe tener al menos 3 caracteres');
  });

  it('should show error when nombre is too long', () => {
    component.nombre.set('a'.repeat(51));
    component.onSubmit();
    expect(component.errorNombre()).toBe('El nombre no puede superar los 50 caracteres');
  });

  it('should show error when email is empty', () => {
    component.correo.set('');
    component.onSubmit();
    expect(component.errorEmail()).toBe('El correo electrónico es obligatorio');
  });

  it('should show error when email is invalid', () => {
    component.correo.set('correo-invalido');
    component.onSubmit();
    expect(component.errorEmail()).toBe('El correo electrónico debe ser válido');
  });

  it('should show error when password is empty', () => {
    component.contrasena.set('');
    component.onSubmit();
    expect(component.errorContrasena()).toBe('La contraseña es obligatoria');
  });

  it('should show error when password is too short', () => {
    component.contrasena.set('12345');
    component.onSubmit();
    expect(component.errorContrasena()).toBe('La contraseña debe tener al menos 6 caracteres');
  });

  it('should show error when passwords do not match', () => {
    component.contrasena.set('123456');
    component.repetirContrasena.set('654321');
    component.onSubmit();
    expect(component.errorPasswordMatch()).toBe('Las contraseñas introducidas no coinciden');
  });

  it('should handle error when username already exists', fakeAsync(() => {
    component.nombre.set('newuser');
    component.correo.set('new@email.com');
    component.contrasena.set('123456');
    component.repetirContrasena.set('123456');
    const errorResponse = { error: 'El usuario ya existe' };
    mockAuthService.register.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();
    tick();

    expect(component.loading()).toBe(false);
    expect(component.errorGeneral()).toBe('El nombre de usuario no está disponible');
  }));

  it('should handle error when email already exists', fakeAsync(() => {
    component.nombre.set('newuser');
    component.correo.set('new@email.com');
    component.contrasena.set('123456');
    component.repetirContrasena.set('123456');
    const errorResponse = { error: 'correo ya existe' };
    mockAuthService.register.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();
    tick();

    expect(component.loading()).toBe(false);
    expect(component.errorGeneral()).toBe('El correo electrónico ya se encuentra registrado');
  }));

  it('should handle generic error', fakeAsync(() => {
    component.nombre.set('newuser');
    component.correo.set('new@email.com');
    component.contrasena.set('123456');
    component.repetirContrasena.set('123456');
    mockAuthService.register.and.returnValue(throwError(() => new Error('Network error')));

    component.onSubmit();
    tick();

    expect(component.loading()).toBe(false);
    expect(component.errorGeneral()).toBe('Error al registrarse');
  }));

  it('should not call register if validation fails', () => {
    component.nombre.set('');
    component.correo.set('');
    component.contrasena.set('');
    component.repetirContrasena.set('');

    component.onSubmit();

    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

});
