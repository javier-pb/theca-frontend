import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { ListaRecursosComponent } from './lista-recursos';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para la lista de recursos:
describe('ListaRecursosComponent', () => {
  let component: ListaRecursosComponent;
  let fixture: ComponentFixture<ListaRecursosComponent>;
  let mockRecursoService: jasmine.SpyObj<RecursoService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockRecursos = [
    { id: '1', titulo: 'Angular para Principiantes', autor: 'Juan Pérez', portada: null },
    { id: '2', titulo: 'TypeScript Avanzado', autor: 'María García', portada: 'base64imagedata' },
    { id: '3', titulo: 'JavaScript Básico', autor: 'Carlos López', portada: 'https://ejemplo.com/imagen.jpg' },
    { id: '4', titulo: 'React Moderno', autor: 'Ana Martínez', portada: null }
  ];

  const mockUserId = 'user123';

  beforeEach(() => {
    mockRecursoService = jasmine.createSpyObj('RecursoService', ['getAll', 'delete']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId', 'getToken']);
    mockAuthService.getUserId.and.returnValue(mockUserId);
    mockRecursoService.getAll.and.returnValue(of(mockRecursos));

    TestBed.configureTestingModule({
      imports: [
        ListaRecursosComponent,
        RouterTestingModule.withRoutes([
          { path: 'recursos/nuevo', component: DummyComponent },
          { path: 'recursos/editar/:id', component: DummyComponent },
          { path: 'recursos/detalle/:id', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: RecursoService, useValue: mockRecursoService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaRecursosComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    mockRecursoService.getAll.calls.reset();
    mockRecursoService.delete.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty resources and loading true', () => {
      expect(component.recursos()).toEqual([]);
      expect(component.recursosFiltrados()).toEqual([]);
      expect(component.terminoBusqueda()).toBe('');
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
      expect(component.mostrarModal()).toBe(false);
      expect(component.recursoAEliminar()).toBeNull();
    });
  });

  describe('cargarRecursos', () => {
    it('should load recursos successfully with userId', fakeAsync(() => {
      component.cargarRecursos();
      tick();

      expect(mockRecursoService.getAll).toHaveBeenCalledWith(mockUserId);
      expect(component.recursos().length).toBe(4);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    }));

    it('should handle error when loading recursos', fakeAsync(() => {
      mockRecursoService.getAll.and.returnValue(throwError(() => new Error('Error')));

      component.cargarRecursos();
      tick();

      expect(component.recursos()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar los recursos');
    }));

    it('should handle null userId', fakeAsync(() => {
      mockAuthService.getUserId.and.returnValue(null);
      component.cargarRecursos();
      tick();

      expect(mockRecursoService.getAll).toHaveBeenCalledWith(undefined);
    }));
  });

  describe('ngOnInit', () => {
    it('should call cargarRecursos on init', () => {
      spyOn(component, 'cargarRecursos');
      component.ngOnInit();
      expect(component.cargarRecursos).toHaveBeenCalled();
    });
  });

  describe('onBuscar', () => {
    it('should update terminoBusqueda and call filtrarRecursos', () => {
      spyOn(component, 'filtrarRecursos');

      component.onBuscar('Angular');

      expect(component.terminoBusqueda()).toBe('Angular');
      expect(component.filtrarRecursos).toHaveBeenCalled();
    });
  });

  describe('filtrarRecursos', () => {
    beforeEach(() => {
      component.recursos.set(mockRecursos);
    });

    it('should show all recursos when termino is empty', () => {
      component.terminoBusqueda.set('');
      component.filtrarRecursos();

      expect(component.recursosFiltrados().length).toBe(4);
    });

    it('should filter recursos by title', () => {
      component.terminoBusqueda.set('Angular');
      component.filtrarRecursos();

      expect(component.recursosFiltrados().length).toBe(1);
      expect(component.recursosFiltrados()[0].titulo).toBe('Angular para Principiantes');
    });

    it('should filter recursos by author', () => {
      component.terminoBusqueda.set('María');
      component.filtrarRecursos();

      expect(component.recursosFiltrados().length).toBe(1);
      expect(component.recursosFiltrados()[0].autor).toBe('María García');
    });

    it('should filter recursos by partial title', () => {
      component.terminoBusqueda.set('JavaScript');
      component.filtrarRecursos();

      expect(component.recursosFiltrados().length).toBe(1);
      expect(component.recursosFiltrados()[0].titulo).toBe('JavaScript Básico');
    });

    it('should be case insensitive', () => {
      component.terminoBusqueda.set('angular');
      component.filtrarRecursos();

      expect(component.recursosFiltrados().length).toBe(1);
      expect(component.recursosFiltrados()[0].titulo).toBe('Angular para Principiantes');
    });

    it('should return empty array when no matches', () => {
      component.terminoBusqueda.set('Inexistente');
      component.filtrarRecursos();

      expect(component.recursosFiltrados().length).toBe(0);
    });
  });

  describe('abrirBusquedaAvanzada', () => {
    it('should log message (pending implementation)', () => {
      const consoleSpy = spyOn(console, 'log');
      component.abrirBusquedaAvanzada();
      expect(consoleSpy).toHaveBeenCalledWith('Búsqueda avanzada - Pendiente');
    });
  });

  describe('getPortadaUrl', () => {
    it('should return empty string when portada is null or undefined', () => {
      expect(component.getPortadaUrl('')).toBe('');
      expect(component.getPortadaUrl(null as any)).toBe('');
    });

    it('should return unchanged URL when portada starts with http', () => {
      const url = 'https://ejemplo.com/imagen.jpg';
      expect(component.getPortadaUrl(url)).toBe(url);
    });

    it('should add base64 prefix when portada is base64 string', () => {
      const base64 = 'abc123def456';
      expect(component.getPortadaUrl(base64)).toBe('data:image/jpeg;base64,' + base64);
    });
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      component.cargarRecursos();
      tick();
      fixture.detectChanges();
    }));

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('RECURSOS');
    });

    it('should render add button', () => {
      const addButton = fixture.debugElement.nativeElement.querySelector('.btn-anadir');
      expect(addButton).toBeTruthy();
    });

    it('should render busqueda component', () => {
      const busquedaComponent = fixture.debugElement.query(By.css('app-busqueda'));
      expect(busquedaComponent).toBeTruthy();
    });

    it('should render recursos grid', () => {
      const grid = fixture.debugElement.nativeElement.querySelector('.recursos-grid');
      expect(grid).toBeTruthy();
    });

    it('should render 4 recurso cards', () => {
      const cards = fixture.debugElement.nativeElement.querySelectorAll('.recurso-card');
      expect(cards.length).toBe(4);
    });

    it('should show loading state when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const loading = fixture.debugElement.nativeElement.querySelector('.loading');
      expect(loading).toBeTruthy();
    });

    it('should show error state when error', () => {
      component.loading.set(false);
      component.error.set('Error de prueba');
      fixture.detectChanges();

      const error = fixture.debugElement.nativeElement.querySelector('.error');
      expect(error).toBeTruthy();
    });

    it('should show empty state when no resources', () => {
      component.recursos.set([]);
      component.recursosFiltrados.set([]);
      component.loading.set(false);
      component.error.set('');
      fixture.detectChanges();

      const empty = fixture.debugElement.nativeElement.querySelector('.empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('No tienes recursos');
    });
  });

});
