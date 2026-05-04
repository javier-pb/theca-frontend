import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { AuthService } from './auth';

// Test unitario para el servicio de autenticación:
describe('AuthService', () => {

  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should call register endpoint and return response', () => {
      const user = { username: 'test', password: 'pass' };
      const mockResponse = { token: 'abc123' };

      service.register(user).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(user);
      req.flush(mockResponse);
    });
  });

  describe('login', () => {
    it('should call login endpoint and return response', () => {
      const credentials = { username: 'test', password: 'pass' };
      const mockResponse = { token: 'abc123' };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });
  });

  describe('saveToken', () => {
    it('should save token to localStorage', () => {
      const token = 'abc123';
      const spy = vi.spyOn(Storage.prototype, 'setItem');

      service.saveToken(token);

      expect(spy).toHaveBeenCalledWith('token', token);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const token = 'abc123';
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(token);

      const result = service.getToken();

      expect(result).toBe(token);
      expect(spy).toHaveBeenCalledWith('token');
    });

    it('should return null if no token', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const result = service.getToken();

      expect(result).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if token exists', () => {
      vi.spyOn(service, 'getToken').mockReturnValue('abc123');

      const result = service.isLoggedIn();

      expect(result).toBe(true);
    });

    it('should return false if no token', () => {
      vi.spyOn(service, 'getToken').mockReturnValue(null);

      const result = service.isLoggedIn();

      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('should remove token from localStorage', () => {
      const spy = vi.spyOn(Storage.prototype, 'removeItem');

      service.logout();

      expect(spy).toHaveBeenCalledWith('token');
    });
  });

});
