import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuLateralComponent } from './menu-lateral';
import { AuthService } from '../../../core/services/auth';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el menú lateral:
describe('MenuLateralComponent', () => {

  let component: MenuLateralComponent;
  let fixture: ComponentFixture<MenuLateralComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [
        MenuLateralComponent,
        RouterTestingModule.withRoutes([
          { path: 'login', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuLateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockAuthService.logout.calls.reset();
  });

  describe('Inicialización', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Logout', () => {
    it('should call authService.logout', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should navigate to /login after logout', fakeAsync(() => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      component.logout();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });

  describe('Renderizado del menú', () => {
    it('should render the sidebar', () => {
      const sidebar = fixture.debugElement.nativeElement.querySelector('.sidebar');
      expect(sidebar).toBeTruthy();
    });

    it('should contain navigation links', () => {
      const links = fixture.debugElement.nativeElement.querySelectorAll('nav a');
      expect(links.length).toBe(4);
    });

    it('should have logout button', () => {
      const logoutBtn = fixture.debugElement.nativeElement.querySelector('.logout-btn');
      expect(logoutBtn).toBeTruthy();
    });
  });

});
