import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';

import { AjustesComponent } from './ajustes';
import { AuthService } from '../../../core/services/auth';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el componente de ajustes:
describe('AjustesComponent', () => {
  let component: AjustesComponent;
  let fixture: ComponentFixture<AjustesComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [
        AjustesComponent,
        RouterTestingModule.withRoutes([
          { path: 'perfil', component: DummyComponent },
          { path: 'cambiar-contrasena', component: DummyComponent },
          { path: 'login', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AjustesComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    mockAuthService.logout.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with menu closed', () => {
      expect(component.menuAbierto).toBe(false);
    });
  });

  describe('toggleMenu', () => {
    it('should open menu when closed', () => {
      component.menuAbierto = false;
      component.toggleMenu();
      expect(component.menuAbierto).toBe(true);
    });

    it('should close menu when open', () => {
      component.menuAbierto = true;
      component.toggleMenu();
      expect(component.menuAbierto).toBe(false);
    });
  });

  describe('cerrarMenu', () => {
    it('should close menu', () => {
      component.menuAbierto = true;
      component.cerrarMenu();
      expect(component.menuAbierto).toBe(false);
    });
  });

  describe('irPerfil', () => {
    it('should close menu and navigate to perfil', () => {
      spyOn(router, 'navigate');
      component.menuAbierto = true;

      component.irPerfil();

      expect(component.menuAbierto).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/perfil']);
    });
  });

  describe('irCambiarContrasena', () => {
    it('should close menu and navigate to cambiar-contrasena', () => {
      spyOn(router, 'navigate');
      component.menuAbierto = true;

      component.irCambiarContrasena();

      expect(component.menuAbierto).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/cambiar-contrasena']);
    });
  });

  describe('cerrarSesion', () => {
    beforeEach(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(router, 'navigate');
    });

    it('should close menu', () => {
      component.menuAbierto = true;
      component.cerrarSesion();
      expect(component.menuAbierto).toBe(false);
    });

    it('should show confirmation dialog', () => {
      component.cerrarSesion();
      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres cerrar sesión?');
    });

    it('should call authService.logout when confirmed', () => {
      component.cerrarSesion();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should navigate to login when confirmed', () => {
      component.cerrarSesion();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should not logout if user cancels confirmation', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);

      component.cerrarSesion();

      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('HostListeners', () => {
    let outsideElement: HTMLElement;
    let insideElement: HTMLElement;

    beforeEach(() => {
      outsideElement = document.createElement('div');
      insideElement = document.createElement('button');
      component['elementRef'] = { nativeElement: insideElement } as ElementRef;
    });

    describe('onClickOutside', () => {
      it('should close menu when clicking outside', () => {
        component.menuAbierto = true;
        const event = { target: outsideElement } as any;

        component.onClickOutside(event);

        expect(component.menuAbierto).toBe(false);
      });

      it('should not close menu when clicking inside', () => {
        component.menuAbierto = true;
        const event = { target: insideElement } as any;

        component.onClickOutside(event);

        expect(component.menuAbierto).toBe(true);
      });

      it('should not close menu if already closed', () => {
        component.menuAbierto = false;
        const event = { target: outsideElement } as any;

        component.onClickOutside(event);

        expect(component.menuAbierto).toBe(false);
      });
    });

    describe('onKeyDown', () => {
      it('should close menu when Escape key is pressed and menu is open', () => {
        component.menuAbierto = true;
        const event = new KeyboardEvent('keydown', { key: 'Escape' });

        component.onKeyDown(event);

        expect(component.menuAbierto).toBe(false);
      });

      it('should not close menu when Escape key is pressed and menu is closed', () => {
        component.menuAbierto = false;
        const event = new KeyboardEvent('keydown', { key: 'Escape' });

        component.onKeyDown(event);

        expect(component.menuAbierto).toBe(false);
      });

      it('should not close menu when other key is pressed', () => {
        component.menuAbierto = true;
        const event = new KeyboardEvent('keydown', { key: 'Enter' });

        component.onKeyDown(event);

        expect(component.menuAbierto).toBe(true);
      });
    });
  });

  describe('Template rendering', () => {
    it('should render settings button', () => {
      const button = fixture.debugElement.nativeElement.querySelector('.btn-ajustes');
      expect(button).toBeTruthy();
    });

    it('should render settings icon', () => {
      const icon = fixture.debugElement.nativeElement.querySelector('.icono-ajustes');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('src')).toBe('assets/images/Ajustes.png');
      expect(icon.getAttribute('alt')).toBe('Ajustes');
    });

    it('should not show menu when menuAbierto is false', () => {
      component.menuAbierto = false;
      fixture.detectChanges();

      const menu = fixture.debugElement.nativeElement.querySelector('.menu-contextual');
      expect(menu).toBeFalsy();
    });

    it('should show menu when menuAbierto is true', () => {
      component.menuAbierto = true;
      fixture.detectChanges();

      const menu = fixture.debugElement.nativeElement.querySelector('.menu-contextual');
      expect(menu).toBeTruthy();
    });

    it('should have menu items when menu is open', () => {
      component.menuAbierto = true;
      fixture.detectChanges();

      const menuItems = fixture.debugElement.nativeElement.querySelectorAll('.menu-item');
      expect(menuItems.length).toBe(3);
    });

    it('should have "Perfil" menu item', () => {
      component.menuAbierto = true;
      fixture.detectChanges();

      const menuTexts = fixture.debugElement.nativeElement.querySelectorAll('.menu-item span');
      const texts = Array.from(menuTexts).map((el: any) => el.textContent);

      expect(texts).toContain('Perfil');
      expect(texts).toContain('Cambiar contraseña');
      expect(texts).toContain('Cerrar sesión');
    });

    it('should have logout item with logout class', () => {
      component.menuAbierto = true;
      fixture.detectChanges();

      const logoutItem = fixture.debugElement.nativeElement.querySelector('.menu-item.logout');
      expect(logoutItem).toBeTruthy();
      expect(logoutItem.textContent).toContain('Cerrar sesión');
    });

    it('should call irPerfil when clicking Perfil menu item', () => {
      spyOn(component, 'irPerfil');
      component.menuAbierto = true;
      fixture.detectChanges();

      const perfilItem = fixture.debugElement.queryAll(By.css('.menu-item'))[0];
      perfilItem.triggerEventHandler('click', null);

      expect(component.irPerfil).toHaveBeenCalled();
    });

    it('should call irCambiarContrasena when clicking Cambiar contraseña menu item', () => {
      spyOn(component, 'irCambiarContrasena');
      component.menuAbierto = true;
      fixture.detectChanges();

      const cambiarItem = fixture.debugElement.queryAll(By.css('.menu-item'))[1];
      cambiarItem.triggerEventHandler('click', null);

      expect(component.irCambiarContrasena).toHaveBeenCalled();
    });

    it('should call cerrarSesion when clicking Cerrar sesion menu item', () => {
      spyOn(component, 'cerrarSesion');
      component.menuAbierto = true;
      fixture.detectChanges();

      const logoutItem = fixture.debugElement.queryAll(By.css('.menu-item'))[2];
      logoutItem.triggerEventHandler('click', null);

      expect(component.cerrarSesion).toHaveBeenCalled();
    });
  });

});
