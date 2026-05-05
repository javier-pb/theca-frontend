import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { AuthService } from '../services/auth';

// Test unitario para el AuthGuard:
describe('AuthGuard', () => {

  let guard: AuthGuard;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  afterEach(() => {
    mockRouter.navigate.calls.reset();
    mockAuthService.isLoggedIn.calls.reset();
  });

  describe('canActivate', () => {
    it('should return true if user is logged in', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);

      const result = guard.canActivate();

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return false and navigate to /login if user is not logged in', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);

      const result = guard.canActivate();

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

});
