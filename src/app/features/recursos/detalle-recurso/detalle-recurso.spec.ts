import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { DetalleRecursoComponent } from './detalle-recurso';
import { RecursoService } from '../../../core/services/recurso';
import { AutorService } from '../../../core/services/autor';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { EtiquetaService } from '../../../core/services/etiqueta';
import { TipoService } from '../../../core/services/tipo';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el detalle de un recurso:
describe('DetalleRecursoComponent', () => {

  let component: DetalleRecursoComponent;
  let fixture: ComponentFixture<DetalleRecursoComponent>;
  let mockRecursoService: jasmine.SpyObj<RecursoService>;
  let mockAutorService: jasmine.SpyObj<AutorService>;
  let mockCategoriaService: jasmine.SpyObj<CategoriaService>;
  let mockEtiquetaService: jasmine.SpyObj<EtiquetaService>;
  let mockTipoService: jasmine.SpyObj<TipoService>;
  let router: Router;

  const mockAutorConNombre = { id: 'autor1', nombre: 'Autor Prueba' };
  const mockCategoriaConNombre = { id: 'cat1', nombre: 'Literatura', categoriaPadreId: null };
  const mockSubcategoriaConNombre = { id: 'cat2', nombre: 'Novela', categoriaPadreId: 'cat1' };
  const mockSubSubcategoriaConNombre = { id: 'cat3', nombre: 'Barroca', categoriaPadreId: 'cat2' };
  const mockEtiquetaConNombre = { id: 'etq1', nombre: 'Barroco' };
  const mockTipoConNombre = { id: 'tipo1', nombre: 'Tipo Prueba' };

  const mockTodasCategorias = [
    mockCategoriaConNombre,
    mockSubcategoriaConNombre,
    mockSubSubcategoriaConNombre,
    { id: 'cat4', nombre: 'Prosa', categoriaPadreId: null }
  ];

  const mockRecurso = {
    id: '1',
    titulo: 'Recurso de prueba',
    descripcion: 'Descripción del recurso',
    enlace: 'https://ejemplo.com',
    version: 1.0,
    portada: 'base64imagedata',
    estadoSincronizacion: 'PENDIENTE',
    fechaCreacion: '2024-01-15T10:00:00',
    fechaModificacion: '2024-01-15T10:00:00'
  };

  const mockRecursoConJerarquia = {
    ...mockRecurso,
    categorias: [{ id: 'cat3' }]
  };

  const mockRecursoConMultiplesCategorias = {
    ...mockRecurso,
    categorias: [{ id: 'cat1' }, { id: 'cat3' }, { id: 'cat4' }]
  };

  const mockRecursoConAutoresCompletos = {
    ...mockRecurso,
    autores: [mockAutorConNombre]
  };

  const mockRecursoConAutoresIds = {
    ...mockRecurso,
    autores: [{ id: 'autor1' }]
  };

  const mockRecursoConEtiquetasCompletas = {
    ...mockRecurso,
    etiquetas: [mockEtiquetaConNombre]
  };

  const mockRecursoConEtiquetasIds = {
    ...mockRecurso,
    etiquetas: [{ id: 'etq1' }]
  };

  const mockRecursoConTiposCompletos = {
    ...mockRecurso,
    tipos: [mockTipoConNombre]
  };

  const mockRecursoConTiposIds = {
    ...mockRecurso,
    tipos: [{ id: 'tipo1' }]
  };

  const setupWithId = (id: string = '1') => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(id)
        }
      }
    };
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
    fixture = TestBed.createComponent(DetalleRecursoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  };

  beforeEach(async () => {
    mockRecursoService = jasmine.createSpyObj('RecursoService', ['getById', 'update', 'delete']);
    mockAutorService = jasmine.createSpyObj('AutorService', ['getById']);
    mockCategoriaService = jasmine.createSpyObj('CategoriaService', ['getById', 'getAll']);
    mockEtiquetaService = jasmine.createSpyObj('EtiquetaService', ['getById']);
    mockTipoService = jasmine.createSpyObj('TipoService', ['getById']);

    await TestBed.configureTestingModule({
      imports: [
        DetalleRecursoComponent,
        RouterTestingModule.withRoutes([
          { path: 'recursos', component: DummyComponent },
          { path: 'autores/detalle/1', component: DummyComponent },
          { path: 'categorias/detalle/cat1', component: DummyComponent },
          { path: 'categorias/detalle/cat2', component: DummyComponent },
          { path: 'categorias/detalle/cat3', component: DummyComponent },
          { path: 'etiquetas/detalle/1', component: DummyComponent },
          { path: 'tipos/detalle/1', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: RecursoService, useValue: mockRecursoService },
        { provide: AutorService, useValue: mockAutorService },
        { provide: CategoriaService, useValue: mockCategoriaService },
        { provide: EtiquetaService, useValue: mockEtiquetaService },
        { provide: TipoService, useValue: mockTipoService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    mockRecursoService.getById.calls.reset();
    mockRecursoService.update.calls.reset();
    mockRecursoService.delete.calls.reset();
    mockAutorService.getById.calls.reset();
    mockCategoriaService.getById.calls.reset();
    mockCategoriaService.getAll.calls.reset();
    mockEtiquetaService.getById.calls.reset();
    mockTipoService.getById.calls.reset();
  });

  describe('Component Creation without ID', () => {
    beforeEach(() => {
      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue(null)
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
      fixture = TestBed.createComponent(DetalleRecursoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show error when no id is provided', () => {
      expect(component.error()).toBe('ID de recurso no encontrado');
      expect(component.loading()).toBe(false);
      expect(component.recurso()).toBeNull();
    });
  });

  describe('Cargar Recurso', () => {
    it('should load recurso successfully', fakeAsync(() => {
      mockCategoriaService.getAll.and.returnValue(of([]));
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(mockRecursoService.getById).toHaveBeenCalledWith('1');
      expect(component.recurso()).toEqual(mockRecurso);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    }));

    it('should handle error when loading recurso fails', fakeAsync(() => {
      mockRecursoService.getById.and.returnValue(throwError(() => new Error('Error')));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(component.error()).toBe('Error al cargar el recurso');
      expect(component.loading()).toBe(false);
      expect(component.recurso()).toBeNull();
    }));
  });

  describe('Procesar Autores', () => {
    it('should process autores with nombres directly', () => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConAutoresCompletos));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.autoresList().length).toBe(1);
      expect(component.autoresList()[0].nombre).toBe('Autor Prueba');
    });

    it('should load autores by ID when only ids are present', fakeAsync(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConAutoresIds));
      mockAutorService.getById.and.returnValue(of(mockAutorConNombre));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(mockAutorService.getById).toHaveBeenCalledWith('autor1');
      expect(component.autoresList().length).toBe(1);
      expect(component.autoresList()[0].nombre).toBe('Autor Prueba');
    }));

    it('should handle autores with empty array', () => {
      mockRecursoService.getById.and.returnValue(of({ ...mockRecurso, autores: [] }));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.autoresList()).toEqual([]);
    });

    it('should handle error when loading autor by ID fails', fakeAsync(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConAutoresIds));
      mockAutorService.getById.and.returnValue(throwError(() => new Error('Error')));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(component.autoresList()).toEqual([]);
    }));
  });

  describe('Procesar Tipo', () => {
    it('should process tipo with nombre directly', () => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConTiposCompletos));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.tipoNombre()).toBe('Tipo Prueba');
      expect(component.tipoId()).toBe('tipo1');
    });

    it('should load tipo by ID when only id is present', fakeAsync(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConTiposIds));
      mockTipoService.getById.and.returnValue(of(mockTipoConNombre));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(mockTipoService.getById).toHaveBeenCalledWith('tipo1');
      expect(component.tipoNombre()).toBe('Tipo Prueba');
    }));

    it('should handle empty tipos array', () => {
      mockRecursoService.getById.and.returnValue(of({ ...mockRecurso, tipos: [] }));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.tipoNombre()).toBe('');
      expect(component.tipoId()).toBe('');
    });
  });

  describe('Procesar Etiquetas', () => {
    it('should process etiquetas with nombres directly', () => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConEtiquetasCompletas));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.etiquetasList().length).toBe(1);
      expect(component.etiquetasList()[0].nombre).toBe('Barroco');
    });

    it('should load etiquetas by ID when only ids are present', fakeAsync(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConEtiquetasIds));
      mockEtiquetaService.getById.and.returnValue(of(mockEtiquetaConNombre));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(mockEtiquetaService.getById).toHaveBeenCalledWith('etq1');
      expect(component.etiquetasList().length).toBe(1);
      expect(component.etiquetasList()[0].nombre).toBe('Barroco');
    }));

    it('should sort etiquetas alphabetically', () => {
      const etiquetasDesordenadas = [
        { id: 'etq3', nombre: 'Zeta' },
        { id: 'etq1', nombre: 'Alfa' },
        { id: 'etq2', nombre: 'Beta' }
      ];
      mockRecursoService.getById.and.returnValue(of({ ...mockRecurso, etiquetas: etiquetasDesordenadas }));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.etiquetasList()[0].nombre).toBe('Alfa');
      expect(component.etiquetasList()[1].nombre).toBe('Beta');
      expect(component.etiquetasList()[2].nombre).toBe('Zeta');
    });
  });

  describe('Procesar Categorías', () => {
    it('should build hierarchical display for categorías', fakeAsync(() => {
      mockCategoriaService.getAll.and.returnValue(of(mockTodasCategorias));
      mockRecursoService.getById.and.returnValue(of(mockRecursoConJerarquia));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(component.categoriasList().length).toBe(1);
      expect(component.categoriasList()[0].displayNombre).toBe('Literatura > Novela > Barroca');
      expect(component.categoriasList()[0].rutaCompleta.length).toBe(3);
    }));

    it('should filter out ancestor categories when both ancestor and descendant are present', fakeAsync(() => {
      mockCategoriaService.getAll.and.returnValue(of(mockTodasCategorias));
      mockRecursoService.getById.and.returnValue(of(mockRecursoConMultiplesCategorias));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(component.categoriasList().length).toBe(2);
      expect(component.categoriasList().find(c => c.id === 'cat1')).toBeUndefined();
      expect(component.categoriasList().find(c => c.id === 'cat3')).toBeDefined();
      expect(component.categoriasList().find(c => c.id === 'cat4')).toBeDefined();
    }));

    it('should handle empty categorias array', () => {
      mockRecursoService.getById.and.returnValue(of({ ...mockRecurso, categorias: [] }));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.categoriasList()).toEqual([]);
    });
  });

  describe('obtenerNombreJerarquicoConRuta', () => {
    beforeEach(fakeAsync(() => {
      mockCategoriaService.getAll.and.returnValue(of(mockTodasCategorias));
      mockRecursoService.getById.and.returnValue(of(mockRecursoConJerarquia));
      setupWithId('1');
      fixture.detectChanges();
      tick();
    }));

    it('should return correct rutaCompleta for a category', () => {
      const categoria = mockTodasCategorias.find(c => c.id === 'cat3');
      const mapa = new Map();
      mockTodasCategorias.forEach(c => mapa.set(c.id, c));

      const resultado = component.obtenerNombreJerarquicoConRuta(categoria, mapa);

      expect(resultado.rutaCompleta.length).toBe(3);
      expect(resultado.rutaCompleta[0].nombre).toBe('Literatura');
      expect(resultado.rutaCompleta[1].nombre).toBe('Novela');
      expect(resultado.rutaCompleta[2].nombre).toBe('Barroca');
      expect(resultado.ancestros).toEqual(['cat2', 'cat1']);
    });
  });

  describe('getPortadaUrl', () => {
    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
    });

    it('should return empty string when portada is null or empty', () => {
      expect(component.getPortadaUrl('')).toBe('');
    });

    it('should return unchanged URL when portada starts with http', () => {
      const url = 'https://ejemplo.com/imagen.jpg';
      expect(component.getPortadaUrl(url)).toBe(url);
    });

    it('should return unchanged URL when portada starts with data:', () => {
      const dataUrl = 'data:image/jpeg;base64,abc123';
      expect(component.getPortadaUrl(dataUrl)).toBe(dataUrl);
    });

    it('should add base64 prefix when portada is base64 string', () => {
      const base64 = 'abc123def456';
      expect(component.getPortadaUrl(base64)).toBe('data:image/jpeg;base64,' + base64);
    });
  });

  describe('Actualizar portada', () => {
    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      mockRecursoService.update.and.returnValue(of(mockRecurso));
      setupWithId('1');
      fixture.detectChanges();
    });

    it('should update portada successfully', fakeAsync(() => {
      component.actualizarPortada('data:image/png;base64,abc123def456');
      tick();

      expect(mockRecursoService.update).toHaveBeenCalled();
      expect(component.actualizandoPortada()).toBe(false);
    }));

    it('should handle error when updating portada', fakeAsync(() => {
      mockRecursoService.update.and.returnValue(throwError(() => new Error('Error')));

      component.actualizarPortada('data:image/png;base64,abc123');
      tick();

      expect(component.error()).toBe('Error al actualizar la portada');
      expect(component.actualizandoPortada()).toBe(false);
    }));
  });

  describe('Eliminar recurso', () => {
    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
      fixture.detectChanges();
    });

    it('should open and close modal', () => {
      component.confirmarEliminar();
      expect(component.mostrarModal()).toBe(true);

      component.cerrarModal();
      expect(component.mostrarModal()).toBe(false);
    });

    it('should delete recurso successfully', fakeAsync(() => {
      spyOn(router, 'navigate');
      mockRecursoService.delete.and.returnValue(of(null));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(mockRecursoService.delete).toHaveBeenCalledWith('1');
      expect(router.navigate).toHaveBeenCalledWith(['/recursos']);
    }));

    it('should handle error when deleting recurso', fakeAsync(() => {
      mockRecursoService.delete.and.returnValue(throwError(() => new Error('Error')));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(component.error()).toBe('Error al eliminar el recurso');
      expect(component.loading()).toBe(false);
      expect(component.mostrarModal()).toBe(false);
    }));
  });

  describe('Navigation methods', () => {
    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
      fixture.detectChanges();
    });

    it('should navigate to autor detalle', () => {
      spyOn(router, 'navigate');
      component.irADetalleAutor('autor1');
      expect(router.navigate).toHaveBeenCalledWith(['/autores/detalle', 'autor1']);
    });

    it('should navigate to categoria detalle', () => {
      spyOn(router, 'navigate');
      component.irADetalleCategoria('cat1');
      expect(router.navigate).toHaveBeenCalledWith(['/categorias/detalle', 'cat1']);
    });

    it('should navigate to etiqueta detalle', () => {
      spyOn(router, 'navigate');
      component.irADetalleEtiqueta('etq1');
      expect(router.navigate).toHaveBeenCalledWith(['/etiquetas/detalle', 'etq1']);
    });

    it('should navigate to tipo detalle', () => {
      spyOn(router, 'navigate');
      component.irADetalleTipo('tipo1');
      expect(router.navigate).toHaveBeenCalledWith(['/tipos/detalle', 'tipo1']);
    });
  });

  describe('formatearFechaLocal', () => {
    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
    });

    it('should return empty string when fecha is null or empty', () => {
      expect(component.formatearFechaLocal('')).toBe('');
    });

    it('should format fecha correctly', () => {
      const fecha = '2024-01-15T10:00:00';
      const resultado = component.formatearFechaLocal(fecha);
      expect(resultado).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      mockCategoriaService.getAll.and.returnValue(of(mockTodasCategorias));
      mockRecursoService.getById.and.returnValue(of(mockRecursoConJerarquia));
      setupWithId('1');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }));

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('DETALLE DEL RECURSO');
    });

    it('should display categorías with > separators', () => {
      const categoriaElement = fixture.debugElement.nativeElement.querySelector('.categoria-jerarquica');
      expect(categoriaElement).toBeTruthy();
      expect(categoriaElement.textContent).toContain('Literatura');
      expect(categoriaElement.textContent).toContain('Novela');
      expect(categoriaElement.textContent).toContain('Barroca');
      expect(categoriaElement.textContent).toContain('>');
    });

    it('should make each category level clickable', () => {
      const categoriaNiveles = fixture.debugElement.nativeElement.querySelectorAll('.categoria-nivel');
      expect(categoriaNiveles.length).toBe(3);

      spyOn(component, 'irADetalleCategoria');
      (categoriaNiveles[0] as HTMLElement).click();
      expect(component.irADetalleCategoria).toHaveBeenCalled();
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

});
