import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { AuthInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth';

// Test unitario para el interceptor de autenticación:
describe('AuthInterceptor', () => {

  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: { getToken: any };

  beforeEach(() => {
    const authServiceSpy = { getToken: vi.fn() };

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
    authService = TestBed.inject(AuthService) as { getToken: any };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const interceptor = TestBed.inject(AuthInterceptor);
    expect(interceptor).toBeTruthy();
  });

  describe('intercept', () => {
    it('should add Authorization header if token exists', () => {
      const token = 'abc123';
      authService.getToken.mockReturnValue(token);

      httpClient.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({});
    });

    it('should not add Authorization header if no token', () => {
      authService.getToken.mockReturnValue(null);

      httpClient.get('/test').subscribe();

      const req = httpMock.expectOne('/test');
      expect(req.request.headers.get('Authorization')).toBeNull();
      req.flush({});
    });
  });

});
