import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { ListaCategoriasComponent } from './lista-categorias';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para la lista de categorías:
describe('ListaCategoriasComponent', () => {

  let component: ListaCategoriasComponent;
  let fixture: ComponentFixture<ListaCategoriasComponent>;
  let categoriaService: jasmine.SpyObj<CategoriaService>;
  let router: Router;

  const mockCategorias: Categoria[] = [
    { id: '1', nombre: 'Literatura', categoriaPadreId: undefined },
    { id: '2', nombre: 'Historia', categoriaPadreId: undefined },
    { id: '3', nombre: 'Novela', categoriaPadreId: '1' },
    { id: '4', nombre: 'Poesía', categoriaPadreId: '1' },
    { id: '5', nombre: 'Contemporánea', categoriaPadreId: '2' }
  ];

  beforeEach(() => {
    categoriaService = jasmine.createSpyObj('CategoriaService', ['getAll', 'delete']);
    categoriaService.getAll.and.returnValue(of(mockCategorias));

    TestBed.configureTestingModule({
      imports: [
        ListaCategoriasComponent,
        RouterTestingModule.withRoutes([
          { path: 'categorias/detalle/1', component: DummyComponent },
          { path: 'busqueda-avanzada/categorias', component: DummyComponent }
        ])
      ],
      providers: [{ provide: CategoriaService, useValue: categoriaService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaCategoriasComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    categoriaService.getAll.calls.reset();
    categoriaService.delete.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.categorias()).toEqual([]);
      expect(component.categoriasFiltradas()).toEqual([]);
      expect(component.terminoBusqueda()).toBe('');
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
    });
  });

  describe('cargarCategorias', () => {
    it('should load categorias successfully', fakeAsync(() => {
      component.cargarCategorias();
      tick();

      expect(categoriaService.getAll).toHaveBeenCalled();
      expect(component.categorias().length).toBe(5);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    }));

    it('should handle error when loading categorias', fakeAsync(() => {
      categoriaService.getAll.and.returnValue(throwError(() => new Error('Error')));

      component.cargarCategorias();
      tick();

      expect(component.categorias()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar las categorías');
    }));
  });

  describe('ngOnInit', () => {
    it('should call cargarCategorias on init', () => {
      spyOn(component, 'cargarCategorias');
      component.ngOnInit();
      expect(component.cargarCategorias).toHaveBeenCalled();
    });
  });

  describe('ordenarCategorias', () => {
    it('should sort categorias alphabetically', () => {
      const desordenadas: Categoria[] = [
        { id: '3', nombre: 'Zeta', categoriaPadreId: undefined },
        { id: '1', nombre: 'Alfa', categoriaPadreId: undefined },
        { id: '2', nombre: 'Beta', categoriaPadreId: undefined }
      ];

      const ordenadas = component.ordenarCategorias(desordenadas);
      expect(ordenadas[0].nombre).toBe('Alfa');
      expect(ordenadas[1].nombre).toBe('Beta');
      expect(ordenadas[2].nombre).toBe('Zeta');
    });
  });

  describe('onBuscar', () => {
    it('should update terminoBusqueda and call filtrarCategorias', () => {
      spyOn(component, 'filtrarCategorias');
      component.onBuscar('Literatura');
      expect(component.terminoBusqueda()).toBe('Literatura');
      expect(component.filtrarCategorias).toHaveBeenCalled();
    });
  });

  describe('filtrarCategorias', () => {
    beforeEach(() => {
      component.categorias.set([...mockCategorias]);
    });

    it('should show all categorias when termino is empty', () => {
      component.terminoBusqueda.set('');
      component.filtrarCategorias();
      expect(component.categoriasFiltradas().length).toBe(5);
    });

    it('should filter categorias by exact name', () => {
      component.terminoBusqueda.set('Literatura');
      component.filtrarCategorias();
      expect(component.categoriasFiltradas().length).toBe(1);
      expect(component.categoriasFiltradas()[0].nombre).toBe('Literatura');
    });

    it('should filter categorias by partial name', () => {
      component.terminoBusqueda.set('tura');
      component.filtrarCategorias();
      expect(component.categoriasFiltradas().length).toBe(1);
      expect(component.categoriasFiltradas()[0].nombre).toBe('Literatura');
    });

    it('should filter subcategorias by name', () => {
      component.terminoBusqueda.set('Novela');
      component.filtrarCategorias();
      expect(component.categoriasFiltradas().length).toBe(1);
      expect(component.categoriasFiltradas()[0].nombre).toBe('Novela');
    });

    it('should be case insensitive', () => {
      component.terminoBusqueda.set('literatura');
      component.filtrarCategorias();
      expect(component.categoriasFiltradas().length).toBe(1);
      expect(component.categoriasFiltradas()[0].nombre).toBe('Literatura');
    });

    it('should return empty array when no matches', () => {
      component.terminoBusqueda.set('Inexistente');
      component.filtrarCategorias();
      expect(component.categoriasFiltradas().length).toBe(0);
    });
  });

  describe('abrirDetalle', () => {
    it('should navigate to categoria detalle', () => {
      spyOn(router, 'navigate');
      component.abrirDetalle('1');
      expect(router.navigate).toHaveBeenCalledWith(['/categorias/detalle', '1']);
    });
  });

  describe('abrirBusquedaAvanzada', () => {
    it('should navigate to busqueda-avanzada/categorias', () => {
      spyOn(router, 'navigate');
      component.abrirBusquedaAvanzada();
      expect(router.navigate).toHaveBeenCalledWith(['/busqueda-avanzada/categorias']);
    });
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      component.cargarCategorias();
      tick();
      fixture.detectChanges();
    }));

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('CATEGORÍAS');
    });

    it('should render add button', () => {
      const addButton = fixture.debugElement.nativeElement.querySelector('.btn-anadir');
      expect(addButton).toBeTruthy();
    });

    it('should render busqueda component', () => {
      const busquedaComponent = fixture.debugElement.query(By.css('app-busqueda'));
      expect(busquedaComponent).toBeTruthy();
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

    it('should show empty state when no categorias', () => {
      component.categorias.set([]);
      component.categoriasFiltradas.set([]);
      component.loading.set(false);
      component.error.set('');
      fixture.detectChanges();

      const empty = fixture.debugElement.nativeElement.querySelector('.empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('No hay categorías');
    });
  });

});
