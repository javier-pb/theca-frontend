import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { FormularioCategoriaComponent } from './formulario-categoria';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el formulario de categorías:
describe('FormularioCategoriaComponent', () => {

  let categoriaService: jasmine.SpyObj<CategoriaService>;

  const mockCategorias: Categoria[] = [
    { id: '1', nombre: 'Literatura', categoriaPadreId: undefined },
    { id: '2', nombre: 'Novela', categoriaPadreId: '1' },
    { id: '3', nombre: 'Poesía', categoriaPadreId: '1' },
    { id: '4', nombre: 'Historia', categoriaPadreId: undefined }
  ];

  const mockCategoria: Categoria = {
    id: '1',
    nombre: 'Literatura',
    categoriaPadreId: undefined
  };

  const mockSubcategoria: Categoria = {
    id: '2',
    nombre: 'Novela',
    categoriaPadreId: '1'
  };

  beforeEach(() => {
    categoriaService = jasmine.createSpyObj('CategoriaService', [
      'getAll', 'getById', 'create', 'update', 'delete'
    ]);
    categoriaService.getAll.and.returnValue(of(mockCategorias));

    TestBed.configureTestingModule({
      imports: [
        FormularioCategoriaComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'categorias', component: DummyComponent },
          { path: 'categorias/detalle/1', component: DummyComponent },
          { path: 'categorias/detalle/2', component: DummyComponent },
          { path: 'categorias/detalle/3', component: DummyComponent },
          { path: 'recursos/editar/123', component: DummyComponent },
          { path: 'recursos/nuevo', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: CategoriaService, useValue: categoriaService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    categoriaService.getAll.calls.reset();
    categoriaService.getById.calls.reset();
    categoriaService.create.calls.reset();
    categoriaService.update.calls.reset();
    localStorage.clear();
  });

  const createComponent = (routeId: string | null = null) => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(routeId)
        }
      }
    };
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

    const fixture = TestBed.createComponent(FormularioCategoriaComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    return { component, fixture, router };
  };

  describe('Component Creation', () => {
    it('should create the component', () => {
      const { component } = createComponent(null);
      expect(component).toBeTruthy();
    });

    it('should initialize with default values in create mode', () => {
      const { component } = createComponent(null);
      expect(component.esEdicion()).toBe(false);
      expect(component.categoriaId()).toBeNull();
      expect(component.nombre()).toBe('');
      expect(component.esSubcategoria()).toBe(false);
      expect(component.categoriaPadreId()).toBe('');
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    });
  });

  describe('cargarCategorias', () => {
    it('should load categorias and build jerarquia', () => {
      const { component } = createComponent(null);
      expect(categoriaService.getAll).toHaveBeenCalled();
      const opciones = component.categoriasParaSelect();
      expect(opciones.length).toBe(4);

      const literatura = opciones.find(o => o.id === '1');
      const novela = opciones.find(o => o.id === '2');
      expect(literatura?.nombreCompleto).toBe('Literatura');
      expect(novela?.nombreCompleto).toBe('Literatura > Novela');
    });

    it('should handle error when loading categorias', () => {
      categoriaService.getAll.and.returnValue(throwError(() => new Error('Error')));
      const consoleSpy = spyOn(console, 'error');
      const { component } = createComponent(null);

      expect(consoleSpy).toHaveBeenCalled();
      expect(component.error()).toBe('Error al cargar las categorías');
    });
  });

  describe('getCategoriasPadreDisponibles', () => {
    it('should return all categorias in create mode', () => {
      const { component } = createComponent(null);
      const disponibles = component.getCategoriasPadreDisponibles();
      expect(disponibles.length).toBe(4);
    });

    it('should exclude current categoria in edit mode', () => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      const { component } = createComponent('1');
      expect(component.esEdicion()).toBe(true);

      const disponibles = component.getCategoriasPadreDisponibles();
      expect(disponibles.find(c => c.id === '1')).toBeUndefined();
      expect(disponibles.length).toBe(3);
    });
  });

  describe('Create Mode', () => {
    it('should validate required nombre', () => {
      const { component } = createComponent(null);
      component.nombre.set('');
      component.onSubmit();
      expect(component.error()).toBe('El nombre es obligatorio');
      expect(categoriaService.create).not.toHaveBeenCalled();
    });

    it('should create categoria successfully', fakeAsync(() => {
      const { component, router } = createComponent(null);
      const mockCategoriaCreada = { id: '3', nombre: 'Nueva Categoría' };
      component.nombre.set('Nueva Categoría');
      categoriaService.create.and.returnValue(of(mockCategoriaCreada));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(categoriaService.create).toHaveBeenCalledWith({ nombre: 'Nueva Categoría' });
      expect(router.navigate).toHaveBeenCalledWith(['/categorias/detalle', '3']);
    }));

    it('should create subcategoria successfully', fakeAsync(() => {
      const { component, router } = createComponent(null);
      const mockSubcategoriaCreada = { id: '4', nombre: 'Nueva Subcategoría', categoriaPadreId: '1' };
      component.nombre.set('Nueva Subcategoría');
      component.esSubcategoria.set(true);
      component.categoriaPadreId.set('1');
      categoriaService.create.and.returnValue(of(mockSubcategoriaCreada));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(categoriaService.create).toHaveBeenCalledWith({
        nombre: 'Nueva Subcategoría',
        categoriaPadreId: '1'
      });
    }));

    it('should handle creation error', fakeAsync(() => {
      const { component } = createComponent(null);
      component.nombre.set('Nueva Categoría');
      categoriaService.create.and.returnValue(throwError(() => ({ status: 500 })));

      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al crear la categoría');
    }));
  });

  describe('Edit Mode', () => {
    it('should be in edit mode and load categoria data', () => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      const { component } = createComponent('1');

      expect(component.esEdicion()).toBe(true);
      expect(component.categoriaId()).toBe('1');
      expect(component.nombre()).toBe('Literatura');
      expect(component.esSubcategoria()).toBe(false);
    });

    it('should load subcategoria data', () => {
      categoriaService.getById.and.returnValue(of(mockSubcategoria));
      const { component } = createComponent('2');

      expect(component.nombre()).toBe('Novela');
      expect(component.esSubcategoria()).toBe(true);
      expect(component.categoriaPadreId()).toBe('1');
    });

    it('should update categoria successfully', fakeAsync(() => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      const { component, router } = createComponent('1');
      const mockCategoriaActualizada = { id: '1', nombre: 'Literatura Actualizada' };

      component.nombre.set('Literatura Actualizada');
      categoriaService.update.and.returnValue(of(mockCategoriaActualizada));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(categoriaService.update).toHaveBeenCalledWith('1', { nombre: 'Literatura Actualizada' });
      expect(router.navigate).toHaveBeenCalledWith(['/categorias/detalle', '1']);
    }));

    it('should update subcategoria successfully', fakeAsync(() => {
      categoriaService.getById.and.returnValue(of(mockSubcategoria));
      const { component, router } = createComponent('2');

      component.nombre.set('Novela Actualizada');
      categoriaService.update.and.returnValue(of({ ...mockSubcategoria, nombre: 'Novela Actualizada' }));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(categoriaService.update).toHaveBeenCalledWith('2', { nombre: 'Novela Actualizada', categoriaPadreId: '1' });
    }));

    it('should handle update error', fakeAsync(() => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      const { component } = createComponent('1');

      component.nombre.set('Literatura Actualizada');
      categoriaService.update.and.returnValue(throwError(() => ({ status: 500 })));

      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al actualizar la categoría');
    }));

    it('should handle error when loading categoria fails', () => {
      categoriaService.getById.and.returnValue(throwError(() => new Error('Error')));
      const { component } = createComponent('1');

      expect(component.error()).toBe('Error al cargar la categoría');
      expect(component.loading()).toBe(false);
    });
  });

  describe('Return to Recurso functionality', () => {
    it('should initialize returnToRecurso from localStorage', () => {
      localStorage.setItem('returnToRecurso', 'true');
      localStorage.setItem('recursoId', '123');

      const { component } = createComponent(null);

      expect(component.returnToRecurso()).toBe(true);
      expect(component.recursoId()).toBe('123');
    });

    it('should navigate back to recurso edit after creating categoria', fakeAsync(() => {
      localStorage.setItem('returnToRecurso', 'true');
      localStorage.setItem('recursoId', '123');

      const { component, router } = createComponent(null);
      const mockCategoriaCreada = { id: '3', nombre: 'Categoría desde recurso' };
      component.nombre.set('Categoría desde recurso');
      categoriaService.create.and.returnValue(of(mockCategoriaCreada));
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

      const { component, router } = createComponent(null);
      const mockCategoriaCreada = { id: '3', nombre: 'Categoría desde recurso' };
      component.nombre.set('Categoría desde recurso');
      categoriaService.create.and.returnValue(of(mockCategoriaCreada));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/recursos/nuevo']);
    }));
  });

  describe('Template rendering', () => {
    it('should render title for create mode', () => {
      const { fixture } = createComponent(null);
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title.textContent).toContain('AÑADIR CATEGORÍA');
    });

    it('should render title for edit mode', () => {
      categoriaService.getById.and.returnValue(of(mockCategoria));
      const { fixture } = createComponent('1');
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title.textContent).toContain('EDITAR CATEGORÍA');
    });

    it('should render nombre input', () => {
      const { fixture } = createComponent(null);
      const input = fixture.debugElement.nativeElement.querySelector('input[name="nombre"]');
      expect(input).toBeTruthy();
    });

    it('should render checkbox', () => {
      const { fixture } = createComponent(null);
      const checkbox = fixture.debugElement.nativeElement.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeTruthy();
    });

    it('should render submit button', () => {
      const { fixture } = createComponent(null);
      const button = fixture.debugElement.nativeElement.querySelector('.btn-guardar');
      expect(button).toBeTruthy();
    });

    it('should show select when esSubcategoria is true', () => {
      const { component, fixture } = createComponent(null);
      component.esSubcategoria.set(true);
      fixture.detectChanges();

      const select = fixture.debugElement.nativeElement.querySelector('select');
      expect(select).toBeTruthy();
    });

    it('should show loading state when loading', () => {
      const { component, fixture } = createComponent(null);
      component.loading.set(true);
      fixture.detectChanges();

      const loading = fixture.debugElement.nativeElement.querySelector('.loading');
      expect(loading).toBeTruthy();
    });

    it('should show error state when error', () => {
      const { component, fixture } = createComponent(null);
      component.error.set('Error de prueba');
      fixture.detectChanges();

      const error = fixture.debugElement.nativeElement.querySelector('.error');
      expect(error).toBeTruthy();
    });
  });

});
