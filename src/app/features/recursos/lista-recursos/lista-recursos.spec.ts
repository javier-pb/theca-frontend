import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
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
    { id: '1', titulo: 'Recurso 1', descripcion: 'Descripción 1', portada: null },
    { id: '2', titulo: 'Recurso 2', descripcion: 'Descripción 2', portada: 'base64imagedata' },
    { id: '3', titulo: 'Recurso 3', descripcion: 'Descripción 3', portada: 'https://ejemplo.com/imagen.jpg' }
  ];

  const mockUserId = 'user123';

  beforeEach(async () => {
    mockRecursoService = jasmine.createSpyObj('RecursoService', ['getAll', 'delete']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId', 'getToken']);

    mockAuthService.getUserId.and.returnValue(mockUserId);

    await TestBed.configureTestingModule({
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

    it('should initialize with empty recursos and loading true', () => {
      expect(component.recursos()).toEqual([]);
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
      expect(component.mostrarModal()).toBe(false);
      expect(component.recursoAEliminar()).toBeNull();
    });
  });

  describe('cargarRecursos', () => {
    it('should load recursos successfully with userId', fakeAsync(() => {
      mockRecursoService.getAll.and.returnValue(of(mockRecursos));

      component.cargarRecursos();
      tick();

      expect(mockRecursoService.getAll).toHaveBeenCalledWith(mockUserId);
      expect(component.recursos()).toEqual(mockRecursos);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    }));

    it('should handle error when loading recursos', fakeAsync(() => {
      mockRecursoService.getAll.and.returnValue(throwError(() => new Error('Error')));

      component.cargarRecursos();
      tick();

      expect(mockRecursoService.getAll).toHaveBeenCalledWith(mockUserId);
      expect(component.recursos()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar los recursos');
    }));

    it('should handle null userId', fakeAsync(() => {
      mockAuthService.getUserId.and.returnValue(null);
      mockRecursoService.getAll.and.returnValue(of(mockRecursos));

      component.cargarRecursos();
      tick();

      expect(mockRecursoService.getAll).toHaveBeenCalledWith(undefined);
      expect(component.recursos()).toEqual(mockRecursos);
    }));
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

  describe('ngOnInit', () => {
    it('should call cargarRecursos on init', () => {
      spyOn(component, 'cargarRecursos');
      component.ngOnInit();
      expect(component.cargarRecursos).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('should set empty message when no recursos', () => {
      component.recursos.set([]);
      component.loading.set(false);
      component.error.set('');

      expect(component.recursos().length).toBe(0);
    });
  });

});
