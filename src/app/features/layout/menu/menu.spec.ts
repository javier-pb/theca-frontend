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

  const routes = [
    { path: 'recursos', component: DummyComponent },
    { path: 'recursos/nuevo', component: DummyComponent },
    { path: 'recursos/detalle/1', component: DummyComponent },
    { path: 'recursos/editar/1', component: DummyComponent },
    { path: 'categorias', component: DummyComponent },
    { path: 'categorias/nuevo', component: DummyComponent },
    { path: 'categorias/detalle/1', component: DummyComponent },
    { path: 'etiquetas', component: DummyComponent },
    { path: 'etiquetas/detalle/1', component: DummyComponent },
    { path: 'autores', component: DummyComponent },
    { path: 'autores/nuevo', component: DummyComponent },
    { path: 'autores/detalle/1', component: DummyComponent },
    { path: 'tipos', component: DummyComponent },
    { path: 'tipos/nuevo', component: DummyComponent },
    { path: 'tipos/detalle/1', component: DummyComponent }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MenuComponent,
        RouterTestingModule.withRoutes(routes)
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

  describe('isActive method - rutas exactas', () => {
    it('should return true when current URL matches the route exactly', fakeAsync(() => {
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

  describe('isActive method - rutas hijas', () => {
    it('should return true for /recursos/nuevo when route is /recursos', fakeAsync(() => {
      router.navigate(['/recursos/nuevo']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/recursos')).toBe(true);
    }));

    it('should return true for /recursos/detalle/1 when route is /recursos', fakeAsync(() => {
      router.navigate(['/recursos/detalle/1']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/recursos')).toBe(true);
    }));

    it('should return true for /recursos/editar/1 when route is /recursos', fakeAsync(() => {
      router.navigate(['/recursos/editar/1']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/recursos')).toBe(true);
    }));

    it('should return true for /categorias/nuevo when route is /categorias', fakeAsync(() => {
      router.navigate(['/categorias/nuevo']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/categorias')).toBe(true);
    }));

    it('should return true for /categorias/detalle/1 when route is /categorias', fakeAsync(() => {
      router.navigate(['/categorias/detalle/1']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/categorias')).toBe(true);
    }));

    it('should return true for /etiquetas/detalle/1 when route is /etiquetas', fakeAsync(() => {
      router.navigate(['/etiquetas/detalle/1']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/etiquetas')).toBe(true);
    }));

    it('should return true for /autores/nuevo when route is /autores', fakeAsync(() => {
      router.navigate(['/autores/nuevo']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/autores')).toBe(true);
    }));

    it('should return true for /autores/detalle/1 when route is /autores', fakeAsync(() => {
      router.navigate(['/autores/detalle/1']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/autores')).toBe(true);
    }));

    it('should return true for /tipos/nuevo when route is /tipos', fakeAsync(() => {
      router.navigate(['/tipos/nuevo']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/tipos')).toBe(true);
    }));

    it('should return true for /tipos/detalle/1 when route is /tipos', fakeAsync(() => {
      router.navigate(['/tipos/detalle/1']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/tipos')).toBe(true);
    }));
  });

  describe('isActive method - secciones no relacionadas', () => {
    it('should return false for /recursos/nuevo when route is /categorias', fakeAsync(() => {
      router.navigate(['/recursos/nuevo']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/categorias')).toBe(false);
    }));

    it('should return false for /autores/detalle/1 when route is /tipos', fakeAsync(() => {
      router.navigate(['/autores/detalle/1']);
      tick();
      fixture.detectChanges();

      expect(component.isActive('/tipos')).toBe(false);
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
