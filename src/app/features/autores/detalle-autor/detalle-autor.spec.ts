import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { DetalleAutorComponent } from './detalle-autor';
import { AutorService, Autor } from '../../../core/services/autor';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el detalle de un autor:
describe('DetalleAutorComponent', () => {

  let component: DetalleAutorComponent;
  let fixture: ComponentFixture<DetalleAutorComponent>;
  let autorService: jasmine.SpyObj<AutorService>;
  let router: Router;

  const mockAutor: Autor = {
    id: '1',
    nombre: 'Gabriel García Márquez',
    fechaModificacion: '2026-05-14T10:00:00',
    estadoSincronizacion: 'PENDIENTE',
    usuarioId: 'user123'
  };

  const mockRecursos = [
    { id: '1', titulo: 'Cien años de soledad' },
    { id: '2', titulo: 'El amor en los tiempos del cólera' }
  ];

  beforeEach(async () => {
    autorService = jasmine.createSpyObj('AutorService', [
      'getById', 'getRecursosAsociados', 'delete'
    ]);

    const mockActivatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [
        DetalleAutorComponent,
        RouterTestingModule.withRoutes([
          { path: 'autores', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: AutorService, useValue: autorService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleAutorComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    autorService.getById.calls.reset();
    autorService.getRecursosAsociados.calls.reset();
    autorService.delete.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.autor()).toBeNull();
      expect(component.recursos()).toEqual([]);
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
      expect(component.mostrarModal()).toBe(false);
    });
  });

  describe('cargarAutor', () => {
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

  describe('Eliminar autor', () => {
    beforeEach(() => {
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
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      autorService.getById.and.returnValue(of(mockAutor));
      autorService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      component.cargarAutor('1');
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

    it('should display recursos list', () => {
      const recursos = fixture.debugElement.nativeElement.querySelectorAll('.recurso-link');
      expect(recursos.length).toBe(2);
      expect(recursos[0].textContent).toContain('Cien años de soledad');
      expect(recursos[1].textContent).toContain('El amor en los tiempos del cólera');
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

  describe('Modal template', () => {
    beforeEach(fakeAsync(() => {
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
