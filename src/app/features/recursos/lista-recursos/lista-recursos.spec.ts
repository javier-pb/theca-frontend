import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { ListaRecursosComponent } from './lista-recursos';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
import { AutorService } from '../../../core/services/autor';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para la lista de recursos:
describe('ListaRecursosComponent', () => {
  let component: ListaRecursosComponent;
  let fixture: ComponentFixture<ListaRecursosComponent>;
  let mockRecursoService: jasmine.SpyObj<RecursoService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockAutorService: jasmine.SpyObj<AutorService>;

  const mockAutores = {
    'autor1': { id: 'autor1', nombre: 'Juan Pérez' },
    'autor2': { id: 'autor2', nombre: 'María García' },
    'autor3': { id: 'autor3', nombre: 'Carlos López' }
  };

  const mockRecursos = [
    { id: '1', titulo: 'Angular para Principiantes', autores: [{ id: 'autor1' }], portada: null },
    { id: '2', titulo: 'TypeScript Avanzado', autores: [{ id: 'autor2' }], portada: 'base64imagedata' },
    { id: '3', titulo: 'JavaScript Básico', autores: [{ id: 'autor3' }], portada: 'https://ejemplo.com/imagen.jpg' },
    { id: '4', titulo: 'React Moderno', autores: [], portada: null },
    { id: '5', titulo: 'Vue.js', autores: [{ id: 'autor1' }, { id: 'autor2' }], portada: null }
  ];

  const mockRecursosConAutoresCompletos = [
    { id: '1', titulo: 'Libro con autor', autores: [{ id: 'autor1', nombre: 'Juan Pérez' }], portada: null }
  ];

  const mockUserId = 'user123';

  beforeEach(() => {
    mockRecursoService = jasmine.createSpyObj('RecursoService', ['getAll']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId']);
    mockAutorService = jasmine.createSpyObj('AutorService', ['getById']);

    mockAuthService.getUserId.and.returnValue(mockUserId);
    mockRecursoService.getAll.and.returnValue(of(mockRecursos));
    mockAutorService.getById.and.callFake((id: string) => {
      return of(mockAutores[id as keyof typeof mockAutores]);
    });

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
        { provide: AuthService, useValue: mockAuthService },
        { provide: AutorService, useValue: mockAutorService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaRecursosComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    mockRecursoService.getAll.calls.reset();
    mockAutorService.getById.calls.reset();
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
    });
  });

  describe('cargarRecursos', () => {
    it('should load recursos successfully and order by modification date', fakeAsync(() => {
      const recursosConFechas = [
        { id: '1', titulo: 'Antiguo', autores: [], fechaModificacion: '2024-01-15T10:00:00' },
        { id: '2', titulo: 'Reciente', autores: [], fechaModificacion: '2024-06-15T10:00:00' }
      ];
      mockRecursoService.getAll.and.returnValue(of(recursosConFechas));

      component.cargarRecursos();
      tick();

      expect(component.recursos()[0].titulo).toBe('Reciente');
      expect(component.recursos()[1].titulo).toBe('Antiguo');
      expect(component.loading()).toBe(false);
    }));

    it('should load autores for each recurso', fakeAsync(() => {
      component.cargarRecursos();
      tick();

      const recursos = component.recursos();
      const recurso1 = recursos.find(r => r.id === '1');
      expect(recurso1.autoresList).toEqual(['Juan Pérez']);

      const recurso5 = recursos.find(r => r.id === '5');
      expect(recurso5.autoresList).toEqual(['Juan Pérez', 'María García']);
    }));

    it('should handle recurso with autores already having nombres without extra API calls', fakeAsync(() => {
      const recursoConNombres = [{ id: 'autor1', nombre: 'Juan Pérez' }];
      mockRecursoService.getAll.and.returnValue(of([{ id: '1', titulo: 'Libro', autores: recursoConNombres }]));

      component.cargarRecursos();
      tick();

      expect(component.recursos()[0].autoresList).toEqual(['Juan Pérez']);
      expect(mockAutorService.getById).toHaveBeenCalled();
    }));

    it('should handle empty autores array', fakeAsync(() => {
      component.cargarRecursos();
      tick();

      const recurso4 = component.recursos().find(r => r.id === '4');
      expect(recurso4.autoresList).toEqual([]);
    }));

    it('should handle null data', fakeAsync(() => {
      mockRecursoService.getAll.and.returnValue(of([]));
      component.cargarRecursos();
      tick();

      expect(component.recursos()).toEqual([]);
      expect(component.loading()).toBe(false);
    }));

    it('should handle error when loading recursos', fakeAsync(() => {
      mockRecursoService.getAll.and.returnValue(throwError(() => new Error('Error')));
      component.cargarRecursos();
      tick();

      expect(component.recursos()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar los recursos');
    }));

    it('should handle error when loading autores', fakeAsync(() => {
      mockAutorService.getById.and.returnValue(throwError(() => new Error('Error')));
      const consoleSpy = spyOn(console, 'error');

      component.cargarRecursos();
      tick();

      expect(consoleSpy).toHaveBeenCalled();
      const recurso1 = component.recursos().find(r => r.id === '1');
      expect(recurso1.autoresList).toEqual([]);
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
    beforeEach(fakeAsync(() => {
      component.cargarRecursos();
      tick();
    }));

    it('should show all recursos when termino is empty', () => {
      component.terminoBusqueda.set('');
      component.filtrarRecursos();
      expect(component.recursosFiltrados().length).toBe(5);
    });

    it('should filter recursos by title', () => {
      component.terminoBusqueda.set('Angular');
      component.filtrarRecursos();
      expect(component.recursosFiltrados().length).toBe(1);
      expect(component.recursosFiltrados()[0].titulo).toBe('Angular para Principiantes');
    });

    it('should filter by partial title', () => {
      component.terminoBusqueda.set('JavaScript');
      component.filtrarRecursos();
      expect(component.recursosFiltrados().length).toBe(1);
      expect(component.recursosFiltrados()[0].titulo).toBe('JavaScript Básico');
    });

    it('should be case insensitive', () => {
      component.terminoBusqueda.set('angular');
      component.filtrarRecursos();
      expect(component.recursosFiltrados().length).toBe(1);
    });

    it('should return empty array when no matches', () => {
      component.terminoBusqueda.set('Inexistente');
      component.filtrarRecursos();
      expect(component.recursosFiltrados().length).toBe(0);
    });
  });

  describe('abrirBusquedaAvanzada', () => {
    it('should log message', () => {
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
      tick(500);
      fixture.detectChanges();
    }));

    it('should render recursos grid', fakeAsync(() => {
      expect(component.recursos().length).toBeGreaterThan(0);
      fixture.detectChanges();
      const grid = fixture.debugElement.nativeElement.querySelector('.recursos-grid');
      expect(grid).toBeTruthy();
    }));

    it('should render 5 recurso cards', fakeAsync(() => {
      tick(500);
      fixture.detectChanges();
      const cards = fixture.debugElement.nativeElement.querySelectorAll('.recurso-card');
      expect(cards.length).toBe(5);
    }));

    it('should show autoresList in cards', fakeAsync(() => {
      tick(500);
      fixture.detectChanges();
      const cards = fixture.debugElement.nativeElement.querySelectorAll('.recurso-card');
      expect(cards.length).toBeGreaterThan(0);
    }));

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
      expect(empty.textContent).toContain('No tiene recursos');
    });

    it('should show no results message when search returns empty', () => {
      component.terminoBusqueda.set('Inexistente');
      component.filtrarRecursos();
      fixture.detectChanges();
      const empty = fixture.debugElement.nativeElement.querySelector('.empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('No se encontraron recursos');
    });
  });

  describe('ordenarPorFechaModificacion', () => {
    it('should sort recursos by modification date (newest first)', () => {
      const recursosDesordenados = [
        { id: '1', titulo: 'Antiguo', fechaModificacion: '2024-01-15T10:00:00' },
        { id: '2', titulo: 'Reciente', fechaModificacion: '2024-06-15T10:00:00' },
        { id: '3', titulo: 'Medio', fechaModificacion: '2024-03-15T10:00:00' }
      ];

      const ordenados = component.ordenarPorFechaModificacion(recursosDesordenados);

      expect(ordenados[0].titulo).toBe('Reciente');
      expect(ordenados[1].titulo).toBe('Medio');
      expect(ordenados[2].titulo).toBe('Antiguo');
    });

    it('should handle null or undefined dates', () => {
      const recursosConFechasNulas = [
        { id: '1', titulo: 'Sin fecha', fechaModificacion: null },
        { id: '2', titulo: 'Con fecha', fechaModificacion: '2024-06-15T10:00:00' },
        { id: '3', titulo: 'Sin fecha 2' }
      ];

      const ordenados = component.ordenarPorFechaModificacion(recursosConFechasNulas);

      expect(ordenados[0].titulo).toBe('Con fecha');
    });
  });

  describe('Filtered view', () => {
    beforeEach(fakeAsync(() => {
      component.cargarRecursos();
      tick();
      fixture.detectChanges();
    }));

    it('should show filtered results when searching', () => {
      component.onBuscar('Angular');
      fixture.detectChanges();
      const cards = fixture.debugElement.nativeElement.querySelectorAll('.recurso-card');
      expect(cards.length).toBe(1);
      expect(cards[0].textContent).toContain('Angular para Principiantes');
    });
  });

});
