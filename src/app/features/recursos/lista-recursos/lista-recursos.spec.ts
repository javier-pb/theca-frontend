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
    { id: '1', titulo: 'Recurso 1', descripcion: 'Descripción 1', tipo: 'libro' },
    { id: '2', titulo: 'Recurso 2', descripcion: 'Descripción 2', tipo: 'artículo' }
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

  it('should call cargarRecursos on init', () => {
    spyOn(component, 'cargarRecursos');
    component.ngOnInit();
    expect(component.cargarRecursos).toHaveBeenCalled();
  });

  describe('confirmarEliminar', () => {
    it('should open modal with the recurso to delete', () => {
      const recurso = mockRecursos[0];

      component.confirmarEliminar(recurso);

      expect(component.mostrarModal()).toBe(true);
      expect(component.recursoAEliminar()).toEqual(recurso);
    });
  });

  describe('cerrarModal', () => {
    it('should close modal and clear recursoAEliminar', () => {
      component.mostrarModal.set(true);
      component.recursoAEliminar.set(mockRecursos[0]);

      expect(component.mostrarModal()).toBe(true);
      expect(component.recursoAEliminar()).toEqual(mockRecursos[0]);

      component.cerrarModal();

      expect(component.mostrarModal()).toBe(false);
      expect(component.recursoAEliminar()).toBeNull();
    });
  });

  describe('eliminar', () => {
    beforeEach(() => {
      component.recursoAEliminar.set(mockRecursos[0]);
      expect(component.recursoAEliminar()).toEqual(mockRecursos[0]);
    });

    it('should delete recurso successfully', fakeAsync(() => {
      mockRecursoService.delete.and.returnValue(of(null));
      spyOn(component, 'cargarRecursos');

      component.eliminar();
      tick();

      expect(mockRecursoService.delete).toHaveBeenCalledWith('1');
      expect(component.cargarRecursos).toHaveBeenCalled();
      expect(component.mostrarModal()).toBe(false);
      expect(component.recursoAEliminar()).toBeNull();
    }));

    it('should handle error when deleting recurso', fakeAsync(() => {
      mockRecursoService.delete.and.returnValue(throwError(() => new Error('Error')));
      spyOn(component, 'cargarRecursos');

      component.eliminar();
      tick();

      expect(mockRecursoService.delete).toHaveBeenCalledWith('1');
      expect(component.error()).toBe('Error al eliminar el recurso');
      expect(component.mostrarModal()).toBe(false);
      expect(component.recursoAEliminar()).toBeNull();
    }));
  });

  it('should set empty message when no recursos', () => {
    component.recursos.set([]);
    component.loading.set(false);
    component.error.set('');

    expect(component.recursos().length).toBe(0);
  });

});
