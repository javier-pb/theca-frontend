import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';

import { AuthInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth';

// Tests unitarios para el interceptor de autenticación:
describe('AuthInterceptor', () => {

  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthInterceptor,
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    const interceptor = TestBed.inject(AuthInterceptor);
    expect(interceptor).toBeTruthy();
  });

  describe('intercept', () => {
    it('should add Authorization header if token exists', () => {
      const token = 'abc123';
      authService.getToken.and.returnValue(token);

      httpClient.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});
    });

    it('should not add Authorization header if no token', () => {
      authService.getToken.and.returnValue(null);

      httpClient.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.get('Authorization')).toBeNull();
      req.flush({});
    });
  });

});
