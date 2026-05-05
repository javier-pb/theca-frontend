import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { delay, of, throwError } from 'rxjs';

import { LoginComponent } from './login';
import { AuthService } from '../../../core/services/auth';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el LoginComponent:
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'saveToken', 'getToken', 'isLoggedIn', 'logout']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'recursos', component: DummyComponent }  // ← AÑADE ESTO
        ])
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockAuthService.login.calls.reset();
    mockAuthService.saveToken.calls.reset();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form fields', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
  });

  it('should call authService.login with credentials', fakeAsync(() => {
    component.username = 'testuser';
    component.password = '123456';
    const mockResponse = { token: 'abc123' };
    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();
    tick();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: '123456'
    });
  }));

  it('should set loading to true during login', () => {
    component.username = 'testuser';
    component.password = '123456';
    const mockResponse = { token: 'abc123' };
    mockAuthService.login.and.returnValue(of(mockResponse).pipe(delay(1000)));

    component.onSubmit();

    expect(component.loading).toBe(true);
  });

  it('should set loading to false after successful login', fakeAsync(() => {
    component.username = 'testuser';
    component.password = '123456';
    const mockResponse = { token: 'abc123' };
    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();
    tick();

    expect(component.loading).toBe(false);
  }));

  it('should save token', fakeAsync(() => {
    component.username = 'testuser';
    component.password = '123456';
    const mockResponse = { token: 'abc123' };
    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();
    tick();

    expect(mockAuthService.saveToken).toHaveBeenCalledWith('abc123');
  }));

  it('should navigate to /recursos after successful login', fakeAsync(() => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.username = 'testuser';
    component.password = '123456';
    const mockResponse = { token: 'abc123' };
    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/recursos']);
  }));

  it('should clear error message on successful login', fakeAsync(() => {
    component.username = 'testuser';
    component.password = '123456';
    component.error = 'Error anterior';
    const mockResponse = { token: 'abc123' };
    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();
    tick();

    expect(component.error).toBe('');
  }));

  it('should handle login error', fakeAsync(() => {
    component.username = 'testuser';
    component.password = '123456';
    mockAuthService.login.and.returnValue(throwError(() => new Error('Unauthorized')));

    component.onSubmit();
    tick();

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Credenciales inválidas');
  }));

  it('should not navigate to recursos on error', fakeAsync(() => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.username = 'testuser';
    component.password = '123456';
    mockAuthService.login.and.returnValue(throwError(() => new Error('Error')));

    component.onSubmit();
    tick();

    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should not save token on error', fakeAsync(() => {
    component.username = 'testuser';
    component.password = '123456';
    mockAuthService.login.and.returnValue(throwError(() => new Error('Error')));

    component.onSubmit();
    tick();

    expect(mockAuthService.saveToken).not.toHaveBeenCalled();
  }));

  it('should handle empty username', fakeAsync(() => {
    component.username = '';
    component.password = '123456';
    const mockResponse = { token: 'abc123' };
    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();
    tick();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: '',
      password: '123456'
    });
  }));

  it('should handle empty password', fakeAsync(() => {
    component.username = 'testuser';
    component.password = '';
    const mockResponse = { token: 'abc123' };
    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();
    tick();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: ''
    });
  }));

});
