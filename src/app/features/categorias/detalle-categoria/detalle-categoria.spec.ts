import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { DetalleCategoriaComponent } from './detalle-categoria';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { RecursoService } from '../../../core/services/recurso';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}


// Test unitario para el detalle de una categoría:
describe('DetalleCategoriaComponent', () => {

  let component: DetalleCategoriaComponent;
  let fixture: ComponentFixture<DetalleCategoriaComponent>;
  let categoriaService: jasmine.SpyObj<CategoriaService>;
  let recursoService: jasmine.SpyObj<RecursoService>;
  let router: Router;

  const mockCategoria: Categoria = {
    id: '1',
    nombre: 'Categoría Principal',
    categoriaPadreId: undefined
  };

  const mockSubcategorias: Categoria[] = [
    { id: '2', nombre: 'Subcategoría A', categoriaPadreId: '1' },
    { id: '3', nombre: 'Subcategoría B', categoriaPadreId: '1' }
  ];

  const mockRecursos = [
    { id: 'r1', titulo: 'Recurso con categoría 1', categorias: [{ id: '1' }] },
    { id: 'r2', titulo: 'Recurso con categoría 2', categorias: [{ id: '2' }] },
    { id: 'r3', titulo: 'Otro recurso', categorias: [{ id: '1' }] }
  ];

  beforeEach(async () => {
    categoriaService = jasmine.createSpyObj('CategoriaService', [
      'getById', 'getAll', 'delete'
    ]);
    recursoService = jasmine.createSpyObj('RecursoService', ['getAll']);

    const mockActivatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [
        DetalleCategoriaComponent,
        RouterTestingModule.withRoutes([
          { path: 'categorias', component: DummyComponent },
          { path: 'categorias/detalle/2', component: DummyComponent },
          { path: 'recursos/detalle/r1', component: DummyComponent },
          { path: 'recursos/detalle/r3', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: CategoriaService, useValue: categoriaService },
        { provide: RecursoService, useValue: recursoService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCategoriaComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    categoriaService.getById.calls.reset();
    categoriaService.getAll.calls.reset();
    categoriaService.delete.calls.reset();
    recursoService.getAll.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.categoria()).toBeNull();
      expect(component.subcategorias()).toEqual([]);
      expect(component.recursosAsociados()).toEqual([]);
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
      expect(component.mostrarModal()).toBe(false);
    });
  });

  describe('cargarCategoria', () => {
    it('should load categoria successfully', fakeAsync(() => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      categoriaService.getAll.and.returnValue(of(mockSubcategorias));
      recursoService.getAll.and.returnValue(of(mockRecursos));

      component.cargarCategoria('1');
      tick();

      expect(categoriaService.getById).toHaveBeenCalledWith('1');
      expect(component.categoria()).toEqual(mockCategoria);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    }));

    it('should handle error when loading categoria', fakeAsync(() => {
      categoriaService.getById.and.returnValue(throwError(() => new Error('Error')));

      component.cargarCategoria('1');
      tick();

      expect(component.categoria()).toBeNull();
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar la categoría');
    }));
  });

  describe('cargarSubcategorias', () => {
    it('should load subcategorias successfully', () => {
      categoriaService.getAll.and.returnValue(of(mockSubcategorias));

      component.cargarSubcategorias('1');

      expect(categoriaService.getAll).toHaveBeenCalled();
      expect(component.subcategorias().length).toBe(2);
      expect(component.subcategorias()[0].nombre).toBe('Subcategoría A');
      expect(component.subcategorias()[1].nombre).toBe('Subcategoría B');
    });

    it('should sort subcategorias alphabetically', () => {
      const subcategoriasDesordenadas: Categoria[] = [
        { id: '3', nombre: 'Zeta', categoriaPadreId: '1' },
        { id: '2', nombre: 'Alfa', categoriaPadreId: '1' },
        { id: '4', nombre: 'Beta', categoriaPadreId: '1' }
      ];
      categoriaService.getAll.and.returnValue(of(subcategoriasDesordenadas));

      component.cargarSubcategorias('1');

      expect(component.subcategorias()[0].nombre).toBe('Alfa');
      expect(component.subcategorias()[1].nombre).toBe('Beta');
      expect(component.subcategorias()[2].nombre).toBe('Zeta');
    });

    it('should return empty array when no subcategorias', () => {
      categoriaService.getAll.and.returnValue(of([]));

      component.cargarSubcategorias('1');

      expect(component.subcategorias().length).toBe(0);
    });
  });

  describe('cargarRecursosAsociados', () => {
    it('should load recursos asociados successfully', () => {
      recursoService.getAll.and.returnValue(of(mockRecursos));

      component.cargarRecursosAsociados('1');

      expect(recursoService.getAll).toHaveBeenCalled();
      expect(component.recursosAsociados().length).toBe(2);
      expect(component.recursosAsociados()[0].id).toBe('r1');
      expect(component.recursosAsociados()[1].id).toBe('r3');
    });

    it('should handle resources with categorias as objects with _id', () => {
      const recursosConId = [
        { id: 'r1', titulo: 'Recurso 1', categorias: [{ _id: '1' }] },
        { id: 'r2', titulo: 'Recurso 2', categorias: [{ _id: '2' }] },
        { id: 'r3', titulo: 'Recurso 3', categorias: [{ _id: '1' }] }
      ];
      recursoService.getAll.and.returnValue(of(recursosConId));

      component.cargarRecursosAsociados('1');

      expect(component.recursosAsociados().length).toBe(2);
    });

    it('should handle empty recursos list', () => {
      recursoService.getAll.and.returnValue(of([]));

      component.cargarRecursosAsociados('1');

      expect(component.recursosAsociados().length).toBe(0);
    });

    it('should handle error when loading recursos', () => {
      recursoService.getAll.and.returnValue(throwError(() => new Error('Error')));
      const consoleSpy = spyOn(console, 'error');

      component.cargarRecursosAsociados('1');

      expect(consoleSpy).toHaveBeenCalled();
      expect(component.recursosAsociados()).toEqual([]);
    });
  });

  describe('irADetalle', () => {
    it('should navigate to subcategoria detail', fakeAsync(() => {
      spyOn(router, 'navigate');

      component.irADetalle('2');

      expect(router.navigate).toHaveBeenCalledWith(['/categorias/detalle', '2']);
    }));
  });

  describe('irADetalleRecurso', () => {
    it('should navigate to recurso detail', fakeAsync(() => {
      spyOn(router, 'navigate');

      component.irADetalleRecurso('r1');

      expect(router.navigate).toHaveBeenCalledWith(['/recursos/detalle', 'r1']);
    }));
  });

  describe('Eliminar categoría', () => {
    beforeEach(() => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      categoriaService.getAll.and.returnValue(of(mockSubcategorias));
      recursoService.getAll.and.returnValue(of(mockRecursos));
      component.cargarCategoria('1');
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

    it('should delete categoria successfully', fakeAsync(() => {
      spyOn(router, 'navigate');
      categoriaService.delete.and.returnValue(of(undefined));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(categoriaService.delete).toHaveBeenCalledWith('1');
      expect(router.navigate).toHaveBeenCalledWith(['/categorias']);
    }));

    it('should handle error when deleting categoria', fakeAsync(() => {
      categoriaService.delete.and.returnValue(throwError(() => new Error('Error')));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(component.error()).toBe('Error al eliminar la categoría');
      expect(component.loading()).toBe(false);
      expect(component.mostrarModal()).toBe(false);
    }));

    it('should not delete when id is undefined', () => {
      component.categoria.set({ ...mockCategoria, id: undefined });
      component.eliminar();

      expect(categoriaService.delete).not.toHaveBeenCalled();
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      categoriaService.getAll.and.returnValue(of(mockSubcategorias));
      recursoService.getAll.and.returnValue(of(mockRecursos));
      component.cargarCategoria('1');
      fixture.detectChanges();
    });

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('DETALLE DE LA CATEGORÍA');
    });

    it('should display categoria nombre', () => {
      const nombre = fixture.debugElement.nativeElement.querySelector('.info-group:first-child .info-value');
      expect(nombre.textContent).toContain('Categoría Principal');
    });

    it('should display subcategorias', () => {
      const subcategorias = fixture.debugElement.nativeElement.querySelectorAll('.subcategoria-item');
      expect(subcategorias.length).toBe(2);
      expect(subcategorias[0].textContent).toContain('Subcategoría A');
      expect(subcategorias[1].textContent).toContain('Subcategoría B');
    });

    it('should display number of recursos asociados', () => {
      const numero = fixture.debugElement.nativeElement.querySelector('.info-group:nth-child(3) .info-value');
      expect(numero.textContent).toContain('2');
    });

    it('should display recursos asociados list', () => {
      const recursos = fixture.debugElement.nativeElement.querySelectorAll('.recurso-item');
      expect(recursos.length).toBe(2);
      expect(recursos[0].textContent).toContain('Recurso con categoría 1');
      expect(recursos[1].textContent).toContain('Otro recurso');
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

    it('should show empty state when no recursos asociados', () => {
      component.recursosAsociados.set([]);
      fixture.detectChanges();

      const recursosText = fixture.debugElement.nativeElement.querySelector('.info-group:nth-child(4) .info-value');
      expect(recursosText.textContent).toContain('No hay recursos asociados a esta categoría');
    });
  });

  describe('Modal template', () => {
    beforeEach(() => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      categoriaService.getAll.and.returnValue(of(mockSubcategorias));
      recursoService.getAll.and.returnValue(of(mockRecursos));
      component.cargarCategoria('1');
      fixture.detectChanges();
    });

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
