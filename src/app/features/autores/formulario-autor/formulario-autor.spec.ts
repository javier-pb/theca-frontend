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

  const mockAutorCreado = {
    id: '3',
    nombre: 'Nuevo Autor'
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
          { path: 'autores', component: DummyComponent },
          { path: 'autores/detalle/1', component: DummyComponent },
          { path: 'autores/detalle/3', component: DummyComponent },
          { path: 'recursos/editar/123', component: DummyComponent },
          { path: 'recursos/nuevo', component: DummyComponent }
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
    autorService.asociarRecursos.calls.reset();
    autorService.desasociarRecursos.calls.reset();
    recursoService.getAll.calls.reset();
    localStorage.clear();
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
      expect(component.recursosDropdownOpen()).toBe(false);
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

    it('should sort recursos alphabetically', () => {
      const recursosOrdenados = component.recursosDisponibles();
      expect(recursosOrdenados[0].titulo).toBe('Cien años de soledad');
      expect(recursosOrdenados[1].titulo).toBe('Don Quijote de la Mancha');
      expect(recursosOrdenados[2].titulo).toBe('El amor en los tiempos del cólera');
    });
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should be in create mode', () => {
      expect(component.esEdicion()).toBe(false);
    });

    it('should show error if nombre is empty', () => {
      component.nombre.set('');
      component.onSubmit();
      expect(component.error()).toBe('El nombre es obligatorio');
      expect(autorService.create).not.toHaveBeenCalled();
    });

    it('should create autor successfully', fakeAsync(() => {
      component.nombre.set('Nuevo Autor');
      component.recursosSeleccionados.set(['1', '2']);

      autorService.getRecursosAsociados.and.returnValue(of([]));
      autorService.create.and.returnValue(of(mockAutorCreado));
      autorService.asociarRecursos.and.returnValue(of({}));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(autorService.create).toHaveBeenCalledWith({ nombre: 'Nuevo Autor' });
      expect(router.navigate).toHaveBeenCalledWith(['/autores/detalle', '3']);
    }));

    it('should asociar recursos after creation', fakeAsync(() => {
      component.nombre.set('Nuevo Autor');
      component.recursosSeleccionados.set(['1', '2']);

      autorService.getRecursosAsociados.and.returnValue(of([]));
      autorService.create.and.returnValue(of(mockAutorCreado));
      autorService.asociarRecursos.and.returnValue(of({}));

      component.onSubmit();
      tick();

      expect(autorService.asociarRecursos).toHaveBeenCalledWith('3', ['1', '2']);
    }));

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
      autorService.getRecursosAsociados.and.returnValue(of(mockRecursosAsociados));
      autorService.desasociarRecursos.and.returnValue(of({}));
      autorService.asociarRecursos.and.returnValue(of({}));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(autorService.update).toHaveBeenCalledWith('1', { nombre: 'Gabriel García Márquez (Actualizado)' });
      expect(router.navigate).toHaveBeenCalledWith(['/autores/detalle', '1']);
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

  describe('Return to Recurso functionality', () => {
    it('should initialize returnToRecurso from localStorage', () => {
      localStorage.setItem('returnToRecurso', 'true');
      localStorage.setItem('recursoId', '123');
      setupCreateMode();

      expect(component.returnToRecurso()).toBe(true);
      expect(component.recursoIdRetorno()).toBe('123');
    });

    it('should navigate back to recurso edit after creating autor', fakeAsync(() => {
      localStorage.setItem('returnToRecurso', 'true');
      localStorage.setItem('recursoId', '123');
      setupCreateMode();

      component.nombre.set('Autor desde recurso');
      autorService.getRecursosAsociados.and.returnValue(of([]));
      autorService.create.and.returnValue(of({ id: '3', nombre: 'Autor desde recurso' }));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/recursos/editar', '123']);
      expect(localStorage.getItem('returnToRecurso')).toBeNull();
      expect(localStorage.getItem('recursoId')).toBeNull();
    }));

    it('should navigate to recursos/nuevo if no recursoId', fakeAsync(() => {
      localStorage.setItem('returnToRecurso', 'true');
      localStorage.removeItem('recursoId');
      setupCreateMode();

      component.nombre.set('Autor desde recurso nuevo');
      autorService.getRecursosAsociados.and.returnValue(of([]));
      autorService.create.and.returnValue(of({ id: '3', nombre: 'Autor desde recurso nuevo' }));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/recursos/nuevo']);
    }));
  });

  describe('toggleRecurso', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should add recurso to seleccionados when not selected', () => {
      component.toggleRecurso('1');
      expect(component.recursosSeleccionados()).toContain('1');
      expect(component.recursosSeleccionadosTexto()).toContain('Cien años de soledad');
    });

    it('should remove recurso from seleccionados when already selected', () => {
      component.recursosSeleccionados.set(['1', '2']);
      component.toggleRecurso('1');
      expect(component.recursosSeleccionados()).not.toContain('1');
      expect(component.recursosSeleccionados()).toEqual(['2']);
    });

    it('should update texto after toggle', () => {
      component.toggleRecurso('1');
      component.toggleRecurso('2');
      expect(component.recursosSeleccionadosTexto()).toBe('Cien años de soledad, El amor en los tiempos del cólera');
    });
  });

  describe('toggleRecursosDropdown', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should open dropdown', () => {
      component.toggleRecursosDropdown();
      expect(component.recursosDropdownOpen()).toBe(true);
    });

    it('should close dropdown', () => {
      component.recursosDropdownOpen.set(true);
      component.toggleRecursosDropdown();
      expect(component.recursosDropdownOpen()).toBe(false);
    });
  });

  describe('onDocumentClick', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should close dropdown when clicking outside', () => {
      component.recursosDropdownOpen.set(true);

      const event = new Event('click');
      Object.defineProperty(event, 'target', { value: document.createElement('div') });

      component.onDocumentClick(event as MouseEvent);

      expect(component.recursosDropdownOpen()).toBe(false);
    });

    it('should not close dropdown when clicking inside', () => {
      component.recursosDropdownOpen.set(true);

      const mockElement = document.createElement('div');
      mockElement.className = 'custom-dropdown';
      const event = new Event('click');
      Object.defineProperty(event, 'target', { value: mockElement });

      component.onDocumentClick(event as MouseEvent);

      expect(component.recursosDropdownOpen()).toBe(true);
    });
  });

  describe('checkDropdownPosition', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should exist and be callable', () => {
      expect(() => component.checkDropdownPosition()).not.toThrow();
    });
  });

  describe('irARecursos', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should navigate to recursos', () => {
      spyOn(router, 'navigate');
      component.irARecursos();
      expect(router.navigate).toHaveBeenCalledWith(['/recursos']);
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

    it('should render dropdown trigger', () => {
      const trigger = fixture.debugElement.nativeElement.querySelector('.dropdown-trigger');
      expect(trigger).toBeTruthy();
    });

    it('should render submit button', () => {
      const submitBtn = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
      expect(submitBtn).toBeTruthy();
    });

    it('should show loading state when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();
      const loading = fixture.debugElement.nativeElement.querySelector('.loading');
      expect(loading).toBeTruthy();
    });

    it('should show error state when error', () => {
      component.error.set('Error de prueba');
      fixture.detectChanges();
      const error = fixture.debugElement.nativeElement.querySelector('.error');
      expect(error).toBeTruthy();
    });
  });

  describe('Edit mode template', () => {
    beforeEach(() => {
      setupEditMode();
    });

    it('should render title for edit mode', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title.textContent).toContain('EDITAR AUTOR');
    });

    it('should show selected recursos text', () => {
      expect(component.recursosSeleccionadosTexto()).toBe('Cien años de soledad');
    });
  });

});
