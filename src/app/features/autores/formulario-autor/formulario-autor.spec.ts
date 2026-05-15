import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { FormularioAutorComponent } from './formulario-autor';
import { AutorService } from '../../../core/services/autor';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el formulario de autores:
describe('FormularioAutorComponent', () => {

  let component: FormularioAutorComponent;
  let fixture: ComponentFixture<FormularioAutorComponent>;
  let autorService: jasmine.SpyObj<AutorService>;
  let recursoService: jasmine.SpyObj<RecursoService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockRecursos = [
    { id: '1', titulo: 'Cien años de soledad' },
    { id: '2', titulo: 'El amor en los tiempos del cólera' },
    { id: '3', titulo: 'Don Quijote de la Mancha' }
  ];

  const mockAutor = {
    id: '1',
    nombre: 'Gabriel García Márquez'
  };

  const mockRecursosAsociados = [
    { id: '1', titulo: 'Cien años de soledad' }
  ];

  const mockUserId = 'user123';

  const setupCreateMode = () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

    fixture = TestBed.createComponent(FormularioAutorComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();

    return { component, fixture };
  };

  const setupEditMode = () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

    autorService.getById.and.returnValue(of(mockAutor));
    autorService.getRecursosAsociados.and.returnValue(of(mockRecursosAsociados));

    fixture = TestBed.createComponent(FormularioAutorComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();

    return { component, fixture };
  };

  beforeEach(() => {
    autorService = jasmine.createSpyObj('AutorService', [
      'getById', 'getRecursosAsociados', 'create', 'update', 'asociarRecursos', 'desasociarRecursos'
    ]);
    recursoService = jasmine.createSpyObj('RecursoService', ['getAll', 'search']);
    authService = jasmine.createSpyObj('AuthService', ['getUserId', 'getToken']);

    authService.getUserId.and.returnValue(mockUserId);
    recursoService.getAll.and.returnValue(of(mockRecursos));

    TestBed.configureTestingModule({
      imports: [
        FormularioAutorComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'autores', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: AutorService, useValue: autorService },
        { provide: RecursoService, useValue: recursoService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    autorService.create.calls.reset();
    autorService.update.calls.reset();
    autorService.getById.calls.reset();
    autorService.getRecursosAsociados.calls.reset();
    recursoService.getAll.calls.reset();
    recursoService.search.calls.reset();
  });

  describe('Component Creation', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.esEdicion()).toBe(false);
      expect(component.autorId()).toBeNull();
      expect(component.nombre()).toBe('');
      expect(component.recursosSeleccionados()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    });
  });

  describe('cargarRecursosDisponibles', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should load recursos disponibles successfully', () => {
      expect(recursoService.getAll).toHaveBeenCalledWith(mockUserId);
      expect(component.recursosDisponibles().length).toBe(3);
    });
  });

  describe('buscarRecursos', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should search recursos by titulo', fakeAsync(() => {
      const filtrados = [mockRecursos[0]];
      recursoService.search.and.returnValue(of(filtrados));
      component.terminoBusquedaRecursos.set('Cien años');

      component.buscarRecursos();
      tick();

      expect(recursoService.search).toHaveBeenCalledWith({ titulo: 'Cien años' });
      expect(component.recursosDisponibles().length).toBe(1);
      expect(component.buscando()).toBe(false);
    }));

    it('should reload all recursos when termino is empty', () => {
      component.terminoBusquedaRecursos.set('');
      recursoService.search.calls.reset();

      component.buscarRecursos();

      expect(recursoService.getAll).toHaveBeenCalled();
    });
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should be in create mode', () => {
      expect(component.esEdicion()).toBe(false);
    });

    it('should create autor successfully', fakeAsync(() => {
      component.nombre.set('Nuevo Autor');
      component.recursosSeleccionados.set(['1', '2']);

      autorService.getRecursosAsociados.and.returnValue(of([]));
      autorService.create.and.returnValue(of({ id: '3', nombre: 'Nuevo Autor' }));
      autorService.asociarRecursos.and.returnValue(of({}));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(autorService.create).toHaveBeenCalledWith({ nombre: 'Nuevo Autor' });
      expect(router.navigate).toHaveBeenCalledWith(['/autores']);
    }));

    it('should show error if nombre is empty', () => {
      component.nombre.set('');

      component.onSubmit();

      expect(component.error()).toBe('El nombre es obligatorio');
      expect(autorService.create).not.toHaveBeenCalled();
    });

    it('should handle creation error', fakeAsync(() => {
      component.nombre.set('Nuevo Autor');
      autorService.create.and.returnValue(throwError(() => ({ status: 500 })));

      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
      expect(component.error()).toContain('Error al crear');
    }));
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      setupEditMode();
    });

    it('should be in edit mode', () => {
      expect(component.esEdicion()).toBe(true);
      expect(component.autorId()).toBe('1');
    });

    it('should load autor data', () => {
      expect(component.nombre()).toBe('Gabriel García Márquez');
      expect(component.recursosSeleccionados()).toEqual(['1']);
    });

    it('should update autor successfully', fakeAsync(() => {
      component.nombre.set('Gabriel García Márquez (Actualizado)');
      component.recursosSeleccionados.set(['1', '2']);
      autorService.update.and.returnValue(of({ id: '1', nombre: 'Actualizado' }));
      autorService.getRecursosAsociados.and.returnValue(of([]));
      autorService.desasociarRecursos.and.returnValue(of({}));
      autorService.asociarRecursos.and.returnValue(of({}));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(autorService.update).toHaveBeenCalledWith('1', { nombre: 'Gabriel García Márquez (Actualizado)' });
      expect(router.navigate).toHaveBeenCalledWith(['/autores']);
    }));

    it('should handle update error', fakeAsync(() => {
      component.nombre.set('Actualizado');
      autorService.update.and.returnValue(throwError(() => ({ status: 500 })));

      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
      expect(component.error()).toContain('Error al actualizar');
    }));
  });

  describe('toggleRecurso', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should add recurso to seleccionados when not selected', () => {
      component.toggleRecurso('1');
      expect(component.recursosSeleccionados()).toContain('1');
    });

    it('should remove recurso from seleccionados when already selected', () => {
      component.recursosSeleccionados.set(['1', '2']);
      component.toggleRecurso('1');
      expect(component.recursosSeleccionados()).not.toContain('1');
      expect(component.recursosSeleccionados()).toEqual(['2']);
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should render title for create mode', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title.textContent).toContain('AÑADIR AUTOR');
    });

    it('should render nombre input', () => {
      const input = fixture.debugElement.nativeElement.querySelector('input[name="nombre"]');
      expect(input).toBeTruthy();
    });

    it('should render search input', () => {
      const searchInput = fixture.debugElement.nativeElement.querySelector('.search-input');
      expect(searchInput).toBeTruthy();
    });

    it('should render search button', () => {
      const searchBtn = fixture.debugElement.nativeElement.querySelector('.btn-buscar');
      expect(searchBtn).toBeTruthy();
    });

    it('should render recursos list', () => {
      const recursosList = fixture.debugElement.nativeElement.querySelectorAll('.recurso-item');
      expect(recursosList.length).toBeGreaterThan(0);
    });

    it('should render submit button', () => {
      const submitBtn = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
      expect(submitBtn).toBeTruthy();
    });
  });

});
