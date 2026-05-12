import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { DetalleCategoriaComponent } from './detalle-categoria';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el detalle de la categoría:
describe('DetalleCategoriaComponent', () => {
  let component: DetalleCategoriaComponent;
  let fixture: ComponentFixture<DetalleCategoriaComponent>;
  let categoriaService: jasmine.SpyObj<CategoriaService>;
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

  beforeEach(async () => {
    categoriaService = jasmine.createSpyObj('CategoriaService', [
      'getById', 'getAll', 'delete'
    ]);

    const mockActivatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [
        DetalleCategoriaComponent,
        RouterTestingModule.withRoutes([
          { path: 'categorias', component: DummyComponent },
          { path: 'categorias/detalle/2', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: CategoriaService, useValue: categoriaService },
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
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.categoria()).toBeNull();
      expect(component.subcategorias()).toEqual([]);
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
      expect(component.mostrarModal()).toBe(false);
    });
  });

  describe('cargarCategoria', () => {
    it('should load categoria successfully', fakeAsync(() => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      categoriaService.getAll.and.returnValue(of(mockSubcategorias));

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

  describe('irADetalle', () => {
    it('should navigate to subcategoria detail', fakeAsync(() => {
      spyOn(router, 'navigate');

      component.irADetalle('2');

      expect(router.navigate).toHaveBeenCalledWith(['/categorias/detalle', '2']);
    }));
  });

  describe('Eliminar categoría', () => {
    beforeEach(() => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      categoriaService.getAll.and.returnValue(of(mockSubcategorias));
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
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      categoriaService.getAll.and.returnValue(of(mockSubcategorias));
      component.cargarCategoria('1');
      fixture.detectChanges();
    });

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('DETALLE DE CATEGORÍA');
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
    beforeEach(() => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      categoriaService.getAll.and.returnValue(of(mockSubcategorias));
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
