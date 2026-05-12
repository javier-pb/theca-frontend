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

// Teest unirario para la lista de categorías:
describe('ListaCategoriasComponent', () => {
  let component: ListaCategoriasComponent;
  let fixture: ComponentFixture<ListaCategoriasComponent>;
  let categoriaService: jasmine.SpyObj<CategoriaService>;
  let router: Router;

  const mockCategorias: Categoria[] = [
    { id: '1', nombre: 'Categoría A', categoriaPadreId: undefined },
    { id: '2', nombre: 'Categoría B', categoriaPadreId: undefined },
    { id: '3', nombre: 'Subcategoría A1', categoriaPadreId: '1' },
    { id: '4', nombre: 'Subcategoría A2', categoriaPadreId: '1' },
    { id: '5', nombre: 'Subcategoría B1', categoriaPadreId: '2' }
  ];

  beforeEach(() => {
    categoriaService = jasmine.createSpyObj('CategoriaService', ['getAll', 'delete']);
    categoriaService.getAll.and.returnValue(of(mockCategorias));

    TestBed.configureTestingModule({
      imports: [ListaCategoriasComponent, RouterTestingModule],
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
    it('should sort categorias hierarchically', () => {
      const desordenadas: Categoria[] = [
        { id: '2', nombre: 'Zeta', categoriaPadreId: undefined },
        { id: '1', nombre: 'Alfa', categoriaPadreId: undefined },
        { id: '3', nombre: 'Beta Hijo', categoriaPadreId: '1' }
      ];

      const ordenadas = component.ordenarCategorias(desordenadas);
      expect(ordenadas[0].id).toBe('1');
      expect(ordenadas[1].id).toBe('3');
      expect(ordenadas[2].id).toBe('2');
    });
  });

  describe('onBuscar', () => {
    it('should update terminoBusqueda and call filtrarCategorias', () => {
      spyOn(component, 'filtrarCategorias');
      component.onBuscar('prueba');
      expect(component.terminoBusqueda()).toBe('prueba');
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

  describe('filtrarCategorias', () => {
    beforeEach(() => {
      const datos = JSON.parse(JSON.stringify(mockCategorias));
      component.categorias.set(datos);
    });

    it('should filter categorias by partial name', () => {
      component.terminoBusqueda.set('Subcategoría');
      component.filtrarCategorias();
      expect(component.categoriasFiltradas().length).toBe(3);
    });
  });

    it('should filter categorias by partial name', () => {
      component.terminoBusqueda.set('Subcategoría');
      component.filtrarCategorias();
      expect(component.categoriasFiltradas().length).toBe(3);
    });

    it('should filter categorias by partial text within subcategoria', () => {
      component.terminoBusqueda.set('A1');
      component.filtrarCategorias();
      expect(component.categoriasFiltradas().length).toBe(1);
      expect(component.categoriasFiltradas()[0]?.nombre).toBe('Subcategoría A1');
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
    it('should log message', () => {
      const consoleSpy = spyOn(console, 'log');
      component.abrirBusquedaAvanzada();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      component.cargarCategorias();
      tick();
      fixture.detectChanges();
    }));

    it('should render title', () => {
      expect(fixture.debugElement.nativeElement.querySelector('.page-title')).toBeTruthy();
    });

    it('should render add button', () => {
      expect(fixture.debugElement.nativeElement.querySelector('.btn-anadir')).toBeTruthy();
    });

    it('should render busqueda component', () => {
      expect(fixture.debugElement.query(By.css('app-busqueda'))).toBeTruthy();
    });
  });

});
