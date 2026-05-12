import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { DetalleEtiquetaComponent } from './detalle-etiqueta';
import { EtiquetaService, Etiqueta } from '../../../core/services/etiqueta';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Tes unitario para el detalle de una etiqueta:
describe('DetalleEtiquetaComponent', () => {
  let component: DetalleEtiquetaComponent;
  let fixture: ComponentFixture<DetalleEtiquetaComponent>;
  let etiquetaService: jasmine.SpyObj<EtiquetaService>;
  let router: Router;

  const mockEtiqueta: Etiqueta = {
    id: '1',
    nombre: 'Angular',
    fechaModificacion: '2026-05-13T10:00:00',
    estadoSincronizacion: 'PENDIENTE',
    usuarioId: 'user123'
  };

  const mockRecursos = [
    { id: '1', titulo: 'Recurso Angular 1' },
    { id: '2', titulo: 'Recurso Angular 2' }
  ];

  beforeEach(async () => {
    etiquetaService = jasmine.createSpyObj('EtiquetaService', [
      'getById', 'getRecursosAsociados', 'delete'
    ]);

    const mockActivatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [
        DetalleEtiquetaComponent,
        RouterTestingModule.withRoutes([
          { path: 'etiquetas', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: EtiquetaService, useValue: etiquetaService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleEtiquetaComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    etiquetaService.getById.calls.reset();
    etiquetaService.getRecursosAsociados.calls.reset();
    etiquetaService.delete.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.etiqueta()).toBeNull();
      expect(component.recursos()).toEqual([]);
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
      expect(component.showModal()).toBe(false);
      expect(component.mostrarModal()).toBe(false);
    });
  });

  describe('cargarEtiqueta', () => {
    it('should load etiqueta successfully', fakeAsync(() => {
      etiquetaService.getById.and.returnValue(of(mockEtiqueta));
      etiquetaService.getRecursosAsociados.and.returnValue(of(mockRecursos));

      component.cargarEtiqueta('1');
      tick();

      expect(etiquetaService.getById).toHaveBeenCalledWith('1');
      expect(component.etiqueta()).toEqual(mockEtiqueta);
      expect(component.recursos().length).toBe(2);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    }));

    it('should handle error when loading etiqueta', fakeAsync(() => {
      etiquetaService.getById.and.returnValue(throwError(() => new Error('Error')));

      component.cargarEtiqueta('1');
      tick();

      expect(component.etiqueta()).toBeNull();
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar la etiqueta');
    }));
  });

  describe('cargarRecursos', () => {
    it('should load recursos successfully', () => {
      etiquetaService.getRecursosAsociados.and.returnValue(of(mockRecursos));

      component.cargarRecursos('1');

      expect(etiquetaService.getRecursosAsociados).toHaveBeenCalledWith('1');
      expect(component.recursos().length).toBe(2);
    });

    it('should handle error when loading recursos', () => {
      etiquetaService.getRecursosAsociados.and.returnValue(throwError(() => new Error('Error')));

      component.cargarRecursos('1');

      expect(component.recursos()).toEqual([]);
    });
  });

  describe('abrirModalEditar', () => {
    it('should open edit modal', () => {
      component.abrirModalEditar();

      expect(component.modalModo()).toBe('editar');
      expect(component.showModal()).toBe(true);
    });
  });

  describe('cerrarModal', () => {
    it('should close modal', () => {
      component.showModal.set(true);
      component.cerrarModal();

      expect(component.showModal()).toBe(false);
    });
  });

  describe('onGuardado', () => {
    it('should close modal and reload etiqueta', fakeAsync(() => {
      spyOn(component, 'cargarEtiqueta');
      component.etiqueta.set(mockEtiqueta);
      component.onGuardado();

      expect(component.showModal()).toBe(false);
      expect(component.cargarEtiqueta).toHaveBeenCalledWith('1');
    }));
  });

  describe('Eliminar etiqueta', () => {
    beforeEach(() => {
      etiquetaService.getById.and.returnValue(of(mockEtiqueta));
      etiquetaService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      component.cargarEtiqueta('1');
    });

    it('should open modal when confirmarEliminar is called', () => {
      component.confirmarEliminar();
      expect(component.mostrarModal()).toBe(true);
    });

    it('should close modal when cerrarModalEliminar is called', () => {
      component.mostrarModal.set(true);
      component.cerrarModalEliminar();
      expect(component.mostrarModal()).toBe(false);
    });

    it('should delete etiqueta successfully', fakeAsync(() => {
      spyOn(router, 'navigate');
      etiquetaService.delete.and.returnValue(of(undefined));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(etiquetaService.delete).toHaveBeenCalledWith('1');
      expect(router.navigate).toHaveBeenCalledWith(['/etiquetas']);
    }));

    it('should handle error when deleting etiqueta', fakeAsync(() => {
      etiquetaService.delete.and.returnValue(throwError(() => new Error('Error')));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(component.error()).toBe('Error al eliminar la etiqueta');
      expect(component.loading()).toBe(false);
      expect(component.mostrarModal()).toBe(false);
    }));
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      etiquetaService.getById.and.returnValue(of(mockEtiqueta));
      etiquetaService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      component.cargarEtiqueta('1');
      tick();
      fixture.detectChanges();
    }));

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('DETALLE DE LA ETIQUETA');
    });

    it('should display etiqueta nombre with # symbol', () => {
      const nombre = fixture.debugElement.nativeElement.querySelector('.info-group:first-child .info-value');
      expect(nombre.textContent).toContain('#Angular');
    });

    it('should display number of recursos', () => {
      const numero = fixture.debugElement.nativeElement.querySelector('.info-group:nth-child(2) .info-value');
      expect(numero.textContent).toContain('2');
    });

    it('should display recursos list', () => {
      const recursos = fixture.debugElement.nativeElement.querySelectorAll('.recurso-link');
      expect(recursos.length).toBe(2);
      expect(recursos[0].textContent).toContain('Recurso Angular 1');
      expect(recursos[1].textContent).toContain('Recurso Angular 2');
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
      etiquetaService.getById.and.returnValue(of(mockEtiqueta));
      etiquetaService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      component.cargarEtiqueta('1');
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
