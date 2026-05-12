import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { FormularioCategoriaComponent } from './formulario-categoria';
import { CategoriaService } from '../../../core/services/categoria';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el formulario de categorías:
describe('FormularioCategoriaComponent', () => {
  let component: FormularioCategoriaComponent;
  let fixture: ComponentFixture<FormularioCategoriaComponent>;
  let categoriaService: jasmine.SpyObj<CategoriaService>;
  let router: Router;

  const mockCategorias = [
    { id: '1', nombre: 'Categoría 1' },
    { id: '2', nombre: 'Categoría 2' }
  ];

  const mockCategoria = {
    id: '1',
    nombre: 'Categoría Existente',
    categoriaPadreId: undefined
  };

  const mockCategoriaCreada: any = {
    id: '3',
    nombre: 'Nueva Categoría'
  };

  const mockSubcategoriaCreada: any = {
    id: '4',
    nombre: 'Nueva Subcategoría',
    categoriaPadreId: '1'
  };

  const mockCategoriaActualizada: any = {
    id: '1',
    nombre: 'Categoría Actualizada'
  };

  beforeEach(() => {
    categoriaService = jasmine.createSpyObj('CategoriaService', [
      'getAll', 'getById', 'create', 'update'
    ]);
    categoriaService.getAll.and.returnValue(of(mockCategorias));

    TestBed.configureTestingModule({
      imports: [
        FormularioCategoriaComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'categorias', component: DummyComponent }
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
  });

  describe('Component Creation', () => {
    beforeEach(() => {
      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue(null)
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

      fixture = TestBed.createComponent(FormularioCategoriaComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.esEdicion()).toBe(false);
      expect(component.categoriaId()).toBeNull();
      expect(component.nombre()).toBe('');
      expect(component.esSubcategoria()).toBe(false);
      expect(component.categoriaPadreId()).toBe('');
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    });
  });

  describe('cargarCategoriasDisponibles', () => {
    beforeEach(() => {
      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue(null)
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

      fixture = TestBed.createComponent(FormularioCategoriaComponent);
      component = fixture.componentInstance;
    });

    it('should load available categorias successfully', () => {
      categoriaService.getAll.and.returnValue(of(mockCategorias));

      component.cargarCategoriasDisponibles();

      expect(categoriaService.getAll).toHaveBeenCalled();
      expect(component.categoriasDisponibles().length).toBe(2);
      expect(component.categoriasDisponibles()[0].nombre).toBe('Categoría 1');
    });
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue(null)
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

      fixture = TestBed.createComponent(FormularioCategoriaComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
    });

    it('should be in create mode', () => {
      expect(component.esEdicion()).toBe(false);
    });

    it('should create categoria successfully', fakeAsync(() => {
      component.nombre.set('Nueva Categoría');
      categoriaService.create.and.returnValue(of(mockCategoriaCreada));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(categoriaService.create).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/categorias']);
    }));
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue('1')
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

      categoriaService.getById.and.returnValue(of(mockCategoria));

      fixture = TestBed.createComponent(FormularioCategoriaComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    it('should be in edit mode', () => {
      expect(component.esEdicion()).toBe(true);
    });

    it('should load categoria data', () => {
      expect(component.nombre()).toBe('Categoría Existente');
    });

    it('should update categoria successfully', fakeAsync(() => {
      component.nombre.set('Categoría Actualizada');
      categoriaService.update.and.returnValue(of(mockCategoriaActualizada));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(categoriaService.update).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/categorias']);
    }));
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue(null)
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

      fixture = TestBed.createComponent(FormularioCategoriaComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should render title for create mode', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title.textContent).toContain('AÑADIR CATEGORÍA');
    });

    it('should render nombre input', () => {
      const input = fixture.debugElement.nativeElement.querySelector('input');
      expect(input).toBeTruthy();
    });

    it('should render submit button', () => {
      const button = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
      expect(button).toBeTruthy();
    });
  });

});
