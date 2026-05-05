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

// Test unitario para el RegisterComponent:
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
    expect(component.nombre).toBe('');
    expect(component.correo).toBe('');
    expect(component.contrasena).toBe('');
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should bind input values to component properties', () => {
    const nombreInput = fixture.debugElement.nativeElement.querySelector('input[name="nombre"]');
    const correoInput = fixture.debugElement.nativeElement.querySelector('input[name="correo"]');
    const contrasenaInput = fixture.debugElement.nativeElement.querySelector('input[name="contrasena"]');

    nombreInput.value = 'testuser';
    nombreInput.dispatchEvent(new Event('input'));
    correoInput.value = 'test@email.com';
    correoInput.dispatchEvent(new Event('input'));
    contrasenaInput.value = '123456';
    contrasenaInput.dispatchEvent(new Event('input'));

    expect(component.nombre).toBe('testuser');
    expect(component.correo).toBe('test@email.com');
    expect(component.contrasena).toBe('123456');
  });

  it('should call authService.register with user data', fakeAsync(() => {
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    mockAuthService.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      nombre: 'newuser',
      correo: 'new@email.com',
      contrasena: '123456'
    });
  }));

  it('should set loading to true during registration', () => {
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    mockAuthService.register.and.returnValue(of({}).pipe(delay(1000)));

    component.onSubmit();

    expect(component.loading).toBe(true);
  });

  it('should set loading to false after successful registration', fakeAsync(() => {
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    mockAuthService.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(component.loading).toBe(false);
  }));

  it('should navigate to /login after successful registration', fakeAsync(() => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    mockAuthService.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should clear error message on successful registration', fakeAsync(() => {
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    component.error = 'Error anterior';
    mockAuthService.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(component.error).toBe('');
  }));

  it('should handle error response with message string', fakeAsync(() => {
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    const errorResponse = { error: 'El usuario ya existe' };
    mockAuthService.register.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();
    tick();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('El usuario ya existe');
  }));

  it('should handle error response without message (uses default)', fakeAsync(() => {
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    const errorResponse = { error: undefined };
    mockAuthService.register.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();
    tick();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Error al registrarse');
  }));

  it('should handle error response with null error (uses default)', fakeAsync(() => {
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    const errorResponse = { error: null };
    mockAuthService.register.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();
    tick();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Error al registrarse');
  }));

  it('should handle generic error (no error property)', fakeAsync(() => {
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    mockAuthService.register.and.returnValue(throwError(() => new Error('Network error')));

    component.onSubmit();
    tick();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Error al registrarse');
  }));

  it('should handle generic error', fakeAsync(() => {
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    mockAuthService.register.and.returnValue(throwError(() => new Error('Network error')));

    component.onSubmit();
    tick();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Error al registrarse');
  }));

  it('should not navigate to login on error', fakeAsync(() => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.nombre = 'newuser';
    component.correo = 'new@email.com';
    component.contrasena = '123456';
    mockAuthService.register.and.returnValue(throwError(() => new Error('Error')));

    component.onSubmit();
    tick();

    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should handle empty nombre', fakeAsync(() => {
    component.nombre = '';
    component.correo = 'test@email.com';
    component.contrasena = '123456';
    mockAuthService.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      nombre: '',
      correo: 'test@email.com',
      contrasena: '123456'
    });
  }));

  it('should handle empty email', fakeAsync(() => {
    component.nombre = 'testuser';
    component.correo = '';
    component.contrasena = '123456';
    mockAuthService.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      nombre: 'testuser',
      correo: '',
      contrasena: '123456'
    });
  }));

  it('should handle empty password', fakeAsync(() => {
    component.nombre = 'testuser';
    component.correo = 'test@email.com';
    component.contrasena = '';
    mockAuthService.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      nombre: 'testuser',
      correo: 'test@email.com',
      contrasena: ''
    });
  }));

});
