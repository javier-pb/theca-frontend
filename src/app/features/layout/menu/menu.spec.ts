import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuComponent } from './menu';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el menú:
describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MenuComponent,
        RouterTestingModule.withRoutes([
          { path: 'recursos', component: DummyComponent },
          { path: 'categorias', component: DummyComponent },
          { path: 'etiquetas', component: DummyComponent },
          { path: 'autores', component: DummyComponent },
          { path: 'tipos', component: DummyComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Menu Rendering', () => {
    it('should render the bottom navigation bar', () => {
      const bottomNav = fixture.debugElement.nativeElement.querySelector('.bottom-nav');
      expect(bottomNav).toBeTruthy();
    });

    it('should have 5 navigation items', () => {
      const navItems = fixture.debugElement.nativeElement.querySelectorAll('.nav-item');
      expect(navItems.length).toBe(5);
    });

    it('should have navigation links for each section', () => {
      const links = fixture.debugElement.nativeElement.querySelectorAll('a.nav-item');
      const hrefs: string[] = [];
      links.forEach((link: Element) => {
        const href = link.getAttribute('href');
        if (href) hrefs.push(href);
      });

      expect(hrefs).toContain('/recursos');
      expect(hrefs).toContain('/categorias');
      expect(hrefs).toContain('/etiquetas');
      expect(hrefs).toContain('/autores');
      expect(hrefs).toContain('/tipos');
    });
  });

  describe('isActive method', () => {
    it('should return true when current URL matches the route', fakeAsync(() => {
      router.navigate(['/recursos']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/recursos')).toBe(true);
    }));

    it('should return false when current URL does not match the route', fakeAsync(() => {
      router.navigate(['/recursos']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/categorias')).toBe(false);
    }));
  });

  describe('Image rendering', () => {
    it('should display icons', () => {
      const images = fixture.debugElement.nativeElement.querySelectorAll('.nav-icon');
      expect(images.length).toBe(5);
    });

    it('should have alt text for each icon', () => {
      const images = fixture.debugElement.nativeElement.querySelectorAll('.nav-icon');
      const altTexts: string[] = [];
      images.forEach((img: Element) => {
        const alt = img.getAttribute('alt');
        if (alt) altTexts.push(alt);
      });

      expect(altTexts).toContain('Recursos');
      expect(altTexts).toContain('Categorías');
      expect(altTexts).toContain('Etiquetas');
      expect(altTexts).toContain('Autores');
      expect(altTexts).toContain('Tipos');
    });
  });

});
