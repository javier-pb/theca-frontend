import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { DetalleAutorComponent } from './detalle-autor';
import { AutorService, Autor } from '../../../core/services/autor';
import { RecursoService } from '../../../core/services/recurso';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el detalle de un autor:
describe('DetalleAutorComponent', () => {

  let component: DetalleAutorComponent;
  let fixture: ComponentFixture<DetalleAutorComponent>;
  let autorService: jasmine.SpyObj<AutorService>;
  let recursoService: jasmine.SpyObj<RecursoService>;
  let router: Router;

  const mockAutor: Autor = {
    id: '1',
    nombre: 'Gabriel García Márquez',
    fechaModificacion: '2026-05-14T10:00:00',
    estadoSincronizacion: 'PENDIENTE',
    usuarioId: 'user123'
  };

  const mockRecursos = [
    { id: '1', titulo: 'Cien años de soledad', autores: [{ id: '1' }] },
    { id: '2', titulo: 'El amor en los tiempos del cólera', autores: [{ id: '1' }] }
  ];

  const mockRecursosSinAutor = [
    { id: '3', titulo: 'Recurso sin autor 1', autores: [] },
    { id: '4', titulo: 'Recurso sin autor 2', autores: null }
  ];

  const mockActivatedRouteWithId = {
    params: of({ id: '1' })
  };

  const mockActivatedRouteWithAnonimo = {
    params: of({ id: 'anonimo' })
  };

  const mockActivatedRouteWithoutId = {
    params: of({})
  };

  const setupWithId = () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRouteWithId });
    fixture = TestBed.createComponent(DetalleAutorComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  };

  const setupWithAnonimo = () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRouteWithAnonimo });
    fixture = TestBed.createComponent(DetalleAutorComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  };

  const setupWithoutId = () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRouteWithoutId });
    fixture = TestBed.createComponent(DetalleAutorComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  };

  beforeEach(async () => {
    autorService = jasmine.createSpyObj('AutorService', [
      'getById', 'getRecursosAsociados', 'delete'
    ]);
    recursoService = jasmine.createSpyObj('RecursoService', ['getAll']);

    await TestBed.configureTestingModule({
      imports: [
        DetalleAutorComponent,
        RouterTestingModule.withRoutes([
          { path: 'autores', component: DummyComponent },
          { path: 'recursos/detalle/1', component: DummyComponent },
          { path: 'recursos/detalle/2', component: DummyComponent },
          { path: 'recursos/detalle/3', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: AutorService, useValue: autorService },
        { provide: RecursoService, useValue: recursoService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    autorService.getById.calls.reset();
    autorService.getRecursosAsociados.calls.reset();
    autorService.delete.calls.reset();
    recursoService.getAll.calls.reset();
  });

  describe('Component Creation', () => {
    beforeEach(() => {
      setupWithId();
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.autor()).toBeNull();
      expect(component.recursos()).toEqual([]);
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
      expect(component.mostrarModal()).toBe(false);
      expect(component.esAnonimo()).toBe(false);
    });
  });

  describe('cargarAutor', () => {
    beforeEach(() => {
      setupWithId();
    });

    it('should load autor successfully', fakeAsync(() => {
      autorService.getById.and.returnValue(of(mockAutor));
      autorService.getRecursosAsociados.and.returnValue(of(mockRecursos));

      component.cargarAutor('1');
      tick();

      expect(autorService.getById).toHaveBeenCalledWith('1');
      expect(component.autor()).toEqual(mockAutor);
      expect(component.recursos().length).toBe(2);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
      expect(component.esAnonimo()).toBe(false);
    }));

    it('should handle error when loading autor', fakeAsync(() => {
      autorService.getById.and.returnValue(throwError(() => new Error('Error')));

      component.cargarAutor('1');
      tick();

      expect(component.autor()).toBeNull();
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar el autor');
    }));
  });

  describe('cargarRecursos', () => {
    beforeEach(() => {
      setupWithId();
    });

    it('should load recursos successfully', () => {
      autorService.getRecursosAsociados.and.returnValue(of(mockRecursos));

      component.cargarRecursos('1');

      expect(autorService.getRecursosAsociados).toHaveBeenCalledWith('1');
      expect(component.recursos().length).toBe(2);
    });

    it('should handle error when loading recursos', () => {
      autorService.getRecursosAsociados.and.returnValue(throwError(() => new Error('Error')));

      component.cargarRecursos('1');

      expect(component.recursos()).toEqual([]);
    });
  });

  describe('Modo Anónimo', () => {
    beforeEach(() => {
      setupWithAnonimo();
    });

    it('should activate anonimo mode', fakeAsync(() => {
      recursoService.getAll.and.returnValue(of(mockRecursosSinAutor));
      component.ngOnInit();
      tick();

      expect(component.esAnonimo()).toBe(true);
      expect(component.autor()?.nombre).toBe('Anónimo');
      expect(component.autor()?.id).toBe('anonimo');
      expect(component.loading()).toBe(false);
    }));

    it('should load recursos sin autor', fakeAsync(() => {
      recursoService.getAll.and.returnValue(of(mockRecursosSinAutor));
      component.ngOnInit();
      tick();

      expect(recursoService.getAll).toHaveBeenCalled();
      expect(component.recursos().length).toBe(2);
      expect(component.recursos()[0].titulo).toBe('Recurso sin autor 1');
      expect(component.recursos()[1].titulo).toBe('Recurso sin autor 2');
    }));

    it('should handle empty recursos sin autor', fakeAsync(() => {
      recursoService.getAll.and.returnValue(of([]));
      component.ngOnInit();
      tick();

      expect(component.recursos().length).toBe(0);
    }));

    it('should handle error when loading recursos sin autor', fakeAsync(() => {
      recursoService.getAll.and.returnValue(throwError(() => new Error('Error')));
      const consoleSpy = spyOn(console, 'error');
      component.ngOnInit();
      tick();

      expect(consoleSpy).toHaveBeenCalled();
      expect(component.recursos()).toEqual([]);
    }));
  });

  describe('Component without ID', () => {
    beforeEach(() => {
      setupWithoutId();
    });

    it('should show error when no id is provided', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.error()).toBe('ID de autor no encontrado');
      expect(component.loading()).toBe(false);
    }));
  });

  describe('Eliminar autor', () => {
    beforeEach(() => {
      setupWithId();
      autorService.getById.and.returnValue(of(mockAutor));
      autorService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      component.cargarAutor('1');
    });

    it('should open modal when confirmarEliminar is called', () => {
      component.confirmarEliminar();
      expect(component.mostrarModal()).toBe(true);
    });

    it('should close modal when cerrarModal is called', () => {
      component.mostrarModal.set(true);
      component.cerrarModal();
      expect(component.mostrarModal()).toBe(false);
    });

    it('should delete autor successfully', fakeAsync(() => {
      spyOn(router, 'navigate');
      autorService.delete.and.returnValue(of(undefined));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(autorService.delete).toHaveBeenCalledWith('1');
      expect(router.navigate).toHaveBeenCalledWith(['/autores']);
    }));

    it('should handle error when deleting autor', fakeAsync(() => {
      autorService.delete.and.returnValue(throwError(() => new Error('Error')));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(component.error()).toBe('Error al eliminar el autor');
      expect(component.loading()).toBe(false);
      expect(component.mostrarModal()).toBe(false);
    }));

    it('should not delete when id is anonimo', () => {
      component.esAnonimo.set(true);
      component.autor.set({ id: 'anonimo', nombre: 'Anónimo' } as Autor);
      component.eliminar();
      expect(autorService.delete).not.toHaveBeenCalled();
    });

    it('should not delete when id is undefined', () => {
      component.autor.set({ ...mockAutor, id: undefined });
      component.eliminar();
      expect(autorService.delete).not.toHaveBeenCalled();
    });
  });

  describe('irADetalleRecurso', () => {
    beforeEach(() => {
      setupWithId();
    });

    it('should navigate to recurso detalle', () => {
      spyOn(router, 'navigate');
      component.irADetalleRecurso('1');
      expect(router.navigate).toHaveBeenCalledWith(['/recursos/detalle', '1']);
    });
  });

  describe('Template rendering - Modo normal', () => {
    beforeEach(fakeAsync(() => {
      setupWithId();
      autorService.getById.and.returnValue(of(mockAutor));
      autorService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      component.ngOnInit();
      tick();
      fixture.detectChanges();
    }));

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('DETALLE DEL AUTOR');
    });

    it('should display autor nombre', () => {
      const nombre = fixture.debugElement.nativeElement.querySelector('.info-group:first-child .info-value');
      expect(nombre.textContent).toContain('Gabriel García Márquez');
    });

    it('should display number of recursos', () => {
      const numero = fixture.debugElement.nativeElement.querySelector('.info-group:nth-child(2) .info-value');
      expect(numero.textContent).toContain('2');
    });

    it('should display recursos inline', () => {
      const recursos = fixture.debugElement.nativeElement.querySelectorAll('.recurso-link');
      expect(recursos.length).toBe(2);
      expect(recursos[0].textContent).toContain('Cien años de soledad');
    });

    it('should render editar button', () => {
      const editarBtn = fixture.debugElement.nativeElement.querySelector('.btn-editar');
      expect(editarBtn).toBeTruthy();
    });

    it('should render eliminar button', () => {
      const eliminarBtn = fixture.debugElement.nativeElement.querySelector('.btn-eliminar');
      expect(eliminarBtn).toBeTruthy();
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
      expect(error.textContent).toContain('Error de prueba');
    });
  });

  describe('Template rendering - Modo Anónimo', () => {
    beforeEach(fakeAsync(() => {
      setupWithAnonimo();
      recursoService.getAll.and.returnValue(of(mockRecursosSinAutor));
      component.ngOnInit();
      tick();
      fixture.detectChanges();
    }));

    it('should render title for anonimo', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('RECURSOS SIN AUTOR');
    });

    it('should not show autor nombre', () => {
      const autorNombre = fixture.debugElement.nativeElement.querySelector('.info-group:first-child');
      expect(autorNombre?.textContent).toContain('N.º de recursos asociados');
    });

    it('should not show editar button', () => {
      const editarBtn = fixture.debugElement.nativeElement.querySelector('.btn-editar');
      expect(editarBtn).toBeFalsy();
    });

    it('should not show eliminar button', () => {
      const eliminarBtn = fixture.debugElement.nativeElement.querySelector('.btn-eliminar');
      expect(eliminarBtn).toBeFalsy();
    });

    it('should display recursos sin autor', () => {
      const recursos = fixture.debugElement.nativeElement.querySelectorAll('.recurso-link');
      expect(recursos.length).toBe(2);
      expect(recursos[0].textContent).toContain('Recurso sin autor 1');
      expect(recursos[1].textContent).toContain('Recurso sin autor 2');
    });
  });

  describe('Modal template', () => {
    beforeEach(fakeAsync(() => {
      setupWithId();
      autorService.getById.and.returnValue(of(mockAutor));
      autorService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      component.cargarAutor('1');
      tick();
      fixture.detectChanges();
    }));

    it('should not show modal when mostrarModal is false', () => {
      component.mostrarModal.set(false);
      fixture.detectChanges();

      const modal = fixture.debugElement.nativeElement.querySelector('.modal-overlay');
      expect(modal).toBeFalsy();
    });

    it('should show modal when mostrarModal is true', () => {
      component.mostrarModal.set(true);
      fixture.detectChanges();

      const modal = fixture.debugElement.nativeElement.querySelector('.modal-overlay');
      expect(modal).toBeTruthy();
    });

    it('should call cerrarModal when clicking cancel button', () => {
      spyOn(component, 'cerrarModal');
      component.mostrarModal.set(true);
      fixture.detectChanges();

      const cancelBtn = fixture.debugElement.query(By.css('.btn-cancelar'));
      cancelBtn.triggerEventHandler('click', null);

      expect(component.cerrarModal).toHaveBeenCalled();
    });

    it('should call eliminar when clicking confirm button', () => {
      spyOn(component, 'eliminar');
      component.mostrarModal.set(true);
      fixture.detectChanges();

      const confirmBtn = fixture.debugElement.query(By.css('.btn-confirmar'));
      confirmBtn.triggerEventHandler('click', null);

      expect(component.eliminar).toHaveBeenCalled();
    });
  });

});
