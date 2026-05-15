import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { DetalleRecursoComponent } from './detalle-recurso';
import { RecursoService } from '../../../core/services/recurso';
import { AutorService } from '../../../core/services/autor';
import { CategoriaService } from '../../../core/services/categoria';
import { EtiquetaService } from '../../../core/services/etiqueta';
import { TipoService } from '../../../core/services/tipo';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test para el detalle de un recurso:
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
  const mockCategoriaConNombre = { id: 'cat1', nombre: 'Categoría Prueba' };
  const mockEtiquetaConNombre = { id: 'etq1', nombre: 'Etiqueta Prueba' };
  const mockTipoConNombre = { id: 'tipo1', nombre: 'Tipo Prueba' };

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

  const mockRecursoConAutoresCompletos = {
    ...mockRecurso,
    autores: [mockAutorConNombre]
  };

  const mockRecursoConAutoresIds = {
    ...mockRecurso,
    autores: [{ id: 'autor1' }]
  };

  const mockRecursoConTiposCompletos = {
    ...mockRecurso,
    tipos: [mockTipoConNombre]
  };

  const mockRecursoConTiposIds = {
    ...mockRecurso,
    tipos: [{ id: 'tipo1' }]
  };

  const mockRecursoConCategoriasCompletas = {
    ...mockRecurso,
    categorias: [mockCategoriaConNombre]
  };

  const mockRecursoConCategoriasIds = {
    ...mockRecurso,
    categorias: [{ id: 'cat1' }]
  };

  const mockRecursoConEtiquetasCompletas = {
    ...mockRecurso,
    etiquetas: [mockEtiquetaConNombre]
  };

  const mockRecursoConEtiquetasIds = {
    ...mockRecurso,
    etiquetas: [{ id: 'etq1' }]
  };

  const mockRecursoActualizado = {
    ...mockRecurso,
    portada: 'nuevaBase64Image'
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

  const setupWithoutId = () => {
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
    router = TestBed.inject(Router);
  };

  beforeEach(async () => {
    mockRecursoService = jasmine.createSpyObj('RecursoService', ['getById', 'update', 'delete']);
    mockAutorService = jasmine.createSpyObj('AutorService', ['getById']);
    mockCategoriaService = jasmine.createSpyObj('CategoriaService', ['getById']);
    mockEtiquetaService = jasmine.createSpyObj('EtiquetaService', ['getById']);
    mockTipoService = jasmine.createSpyObj('TipoService', ['getById']);

    await TestBed.configureTestingModule({
      imports: [
        DetalleRecursoComponent,
        RouterTestingModule.withRoutes([
          { path: 'recursos', component: DummyComponent },
          { path: 'autores/detalle/1', component: DummyComponent },
          { path: 'categorias/detalle/1', component: DummyComponent },
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
    mockEtiquetaService.getById.calls.reset();
    mockTipoService.getById.calls.reset();
  });

  describe('Component Creation with valid ID', () => {
    let componentInstance: DetalleRecursoComponent;

    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
      componentInstance = fixture.componentInstance;
    });

    it('should initialize with default values', () => {
      expect(componentInstance.recurso()).toBeNull();
      expect(componentInstance.loading()).toBe(true);
      expect(componentInstance.error()).toBe('');
      expect(componentInstance.mostrarModal()).toBe(false);
      expect(componentInstance.actualizandoPortada()).toBe(false);
    });
  });

  describe('Data Loading', () => {
    it('should load recurso with complete autores', () => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConAutoresCompletos));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.autoresList().length).toBe(1);
      expect(component.autoresList()[0].nombre).toBe('Autor Prueba');
      expect(component.autoresTexto()).toBe('Autor Prueba');
    });

    it('should load recurso with autores IDs', fakeAsync(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConAutoresIds));
      mockAutorService.getById.and.returnValue(of(mockAutorConNombre));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(mockAutorService.getById).toHaveBeenCalledWith('autor1');
    }));

    it('should load recurso with complete categorias', () => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConCategoriasCompletas));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.categoriasList().length).toBe(1);
      expect(component.categoriasList()[0].nombre).toBe('Categoría Prueba');
    });

    it('should load recurso with categorias IDs', fakeAsync(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConCategoriasIds));
      mockCategoriaService.getById.and.returnValue(of(mockCategoriaConNombre));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(mockCategoriaService.getById).toHaveBeenCalledWith('cat1');
    }));

    it('should load recurso with complete etiquetas', () => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConEtiquetasCompletas));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.etiquetasList().length).toBe(1);
      expect(component.etiquetasList()[0].nombre).toBe('Etiqueta Prueba');
    });

    it('should load recurso with etiquetas IDs', fakeAsync(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConEtiquetasIds));
      mockEtiquetaService.getById.and.returnValue(of(mockEtiquetaConNombre));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(mockEtiquetaService.getById).toHaveBeenCalledWith('etq1');
    }));

    it('should load recurso with complete tipos', () => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConTiposCompletos));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.tipoNombre()).toBe('Tipo Prueba');
      expect(component.tipoId()).toBe('tipo1');
    });

    it('should load recurso with tipos IDs', fakeAsync(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConTiposIds));
      mockTipoService.getById.and.returnValue(of(mockTipoConNombre));
      setupWithId('1');
      fixture.detectChanges();
      tick();

      expect(mockTipoService.getById).toHaveBeenCalledWith('tipo1');
      expect(component.tipoNombre()).toBe('Tipo Prueba');
    }));

    it('should handle empty arrays', () => {
      mockRecursoService.getById.and.returnValue(of({ ...mockRecurso, autores: [], categorias: [], etiquetas: [], tipos: [] }));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.autoresList()).toEqual([]);
      expect(component.categoriasList()).toEqual([]);
      expect(component.etiquetasList()).toEqual([]);
      expect(component.tipoNombre()).toBe('');
    });

    it('should handle error when loading recurso', () => {
      mockRecursoService.getById.and.returnValue(throwError(() => new Error('Error')));
      setupWithId('1');
      fixture.detectChanges();

      expect(component.error()).toBe('Error al cargar el recurso');
      expect(component.loading()).toBe(false);
    });
  });

  describe('Component Creation without ID', () => {
    beforeEach(() => {
      setupWithoutId();
      fixture.detectChanges();
    });

    it('should show error when no id is provided', () => {
      expect(component.error()).toBe('ID de recurso no encontrado');
      expect(component.loading()).toBe(false);
      expect(component.recurso()).toBeNull();
    });
  });

  describe('getPortadaUrl', () => {
    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
    });

    it('should return empty string when portada is null or undefined', () => {
      expect(component.getPortadaUrl('')).toBe('');
      expect(component.getPortadaUrl(null as any)).toBe('');
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

  describe('formatearFechaLocal', () => {
    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
    });

    it('should return empty string when fecha is null', () => {
      expect(component.formatearFechaLocal('')).toBe('');
    });

    it('should format date correctly', () => {
      const result = component.formatearFechaLocal('2024-01-15T10:00:00');
      expect(result).toContain('15/01/2024');
    });
  });

  describe('Eliminar recurso', () => {
    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
      fixture.detectChanges();
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

    it('should not delete when id is undefined', () => {
      component.recurso.set({ ...mockRecurso, id: undefined });
      component.eliminar();
      expect(mockRecursoService.delete).not.toHaveBeenCalled();
    });
  });

  describe('Actualizar portada', () => {
    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
      fixture.detectChanges();
    });

    it('should open file selector when abrirSelectorArchivo is called', () => {
      const clickSpy = jasmine.createSpy('click');
      const mockInput = { click: clickSpy };
      spyOn(document, 'getElementById').and.returnValue(mockInput as any);

      component.abrirSelectorArchivo();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle file selection', () => {
      const file = new File(['dummy'], 'test.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as any;
      const readerSpy = spyOn(FileReader.prototype, 'readAsDataURL');

      component.onPortadaSeleccionada(event);

      expect(readerSpy).toHaveBeenCalled();
    });

    it('should update portada successfully', fakeAsync(() => {
      mockRecursoService.update.and.returnValue(of(mockRecursoActualizado));

      component.actualizarPortada('data:image/png;base64,abc123def456');
      tick();

      expect(mockRecursoService.update).toHaveBeenCalled();
      expect(component.actualizandoPortada()).toBe(false);
    }));

    it('should handle error when updating portada', fakeAsync(() => {
      mockRecursoService.update.and.returnValue(throwError(() => new Error('Error')));

      component.actualizarPortada('data:image/png;base64,abc123def456');
      tick();

      expect(component.error()).toBe('Error al actualizar la portada');
      expect(component.actualizandoPortada()).toBe(false);
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

  describe('Template rendering', () => {
    beforeEach(() => {
      mockRecursoService.getById.and.returnValue(of(mockRecursoConAutoresCompletos));
      setupWithId('1');
      fixture.detectChanges();
    });

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('DETALLE DEL RECURSO');
    });

    it('should render editar button', () => {
      const editarBtn = fixture.debugElement.nativeElement.querySelector('.btn-editar-recurso');
      expect(editarBtn).toBeTruthy();
      expect(editarBtn.textContent).toContain('Editar recurso');
    });

    it('should render eliminar button', () => {
      const eliminarBtn = fixture.debugElement.nativeElement.querySelector('.btn-eliminar-recurso');
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
      mockRecursoService.getById.and.returnValue(of(mockRecurso));
      setupWithId('1');
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
