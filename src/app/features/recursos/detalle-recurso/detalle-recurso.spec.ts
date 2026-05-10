import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { DetalleRecursoComponent } from './detalle-recurso';
import { RecursoService } from '../../../core/services/recurso';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el detalle del recurso:
describe('DetalleRecursoComponent', () => {
  let component: DetalleRecursoComponent;
  let fixture: ComponentFixture<DetalleRecursoComponent>;
  let mockRecursoService: jasmine.SpyObj<RecursoService>;
  let router: Router;

  const mockRecurso = {
    id: '1',
    titulo: 'Recurso de prueba',
    descripcion: 'Descripción del recurso',
    enlace: 'https://ejemplo.com',
    tipo: 'libro',
    version: 1.0,
    portada: 'base64imagedata',
    estadoSincronizacion: 'PENDIENTE',
    fechaCreacion: '2024-01-15T10:00:00',
    fechaModificacion: '2024-01-15T10:00:00'
  };

  const mockRecursoActualizado = {
    ...mockRecurso,
    portada: 'nuevaBase64Image'
  };

  describe('Con ID válido', () => {
    beforeEach(async () => {
      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue('1')
          }
        }
      };

      mockRecursoService = jasmine.createSpyObj('RecursoService', ['getById', 'update', 'delete']);

      await TestBed.configureTestingModule({
        imports: [
          DetalleRecursoComponent,
          RouterTestingModule.withRoutes([
            { path: 'recursos', component: DummyComponent }
          ])
        ],
        providers: [
          { provide: RecursoService, useValue: mockRecursoService },
          { provide: ActivatedRoute, useValue: mockActivatedRoute }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(DetalleRecursoComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
    });

    afterEach(() => {
      mockRecursoService.getById.calls.reset();
      mockRecursoService.update.calls.reset();
      mockRecursoService.delete.calls.reset();
    });

    describe('Component Creation', () => {
      it('should create the component', () => {
        expect(component).toBeTruthy();
      });

      it('should initialize with default values', () => {
        expect(component.recurso()).toBeNull();
        expect(component.loading()).toBe(true);
        expect(component.error()).toBe('');
        expect(component.mostrarModal()).toBe(false);
        expect(component.actualizandoPortada()).toBe(false);
      });
    });

    describe('cargarRecurso', () => {
      it('should load recurso successfully', () => {
        mockRecursoService.getById.and.returnValue(of(mockRecurso));

        component.ngOnInit();

        expect(mockRecursoService.getById).toHaveBeenCalledWith('1');
        expect(component.recurso()).toEqual(mockRecurso);
        expect(component.loading()).toBe(false);
        expect(component.error()).toBe('');
      });

      it('should handle error when recurso not found', () => {
        mockRecursoService.getById.and.returnValue(throwError(() => new Error('Not found')));

        component.ngOnInit();

        expect(component.recurso()).toBeNull();
        expect(component.loading()).toBe(false);
        expect(component.error()).toBe('Error al cargar el recurso');
      });
    });

    describe('getPortadaUrl', () => {
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
        component.ngOnInit();
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
    });

    describe('Actualizar portada', () => {
      beforeEach(() => {
        mockRecursoService.getById.and.returnValue(of(mockRecurso));
        component.ngOnInit();
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
        const mockRecursoActualizadoConPortada = {
          ...mockRecurso,
          portada: 'abc123def456'
        };
        mockRecursoService.update.and.returnValue(of(mockRecursoActualizadoConPortada));

        component.actualizarPortada('data:image/png;base64,abc123def456');
        tick();

        expect(mockRecursoService.update).toHaveBeenCalled();
        expect(component.recurso()?.portada).toBe('abc123def456');
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
  });

  describe('Sin ID en ruta', () => {
    beforeEach(async () => {
      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue(null)
          }
        }
      };

      mockRecursoService = jasmine.createSpyObj('RecursoService', ['getById']);

      await TestBed.configureTestingModule({
        imports: [DetalleRecursoComponent, RouterTestingModule],
        providers: [
          { provide: RecursoService, useValue: mockRecursoService },
          { provide: ActivatedRoute, useValue: mockActivatedRoute }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(DetalleRecursoComponent);
      component = fixture.componentInstance;

      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should show error when no id is provided', () => {
      expect(component.error()).toBe('ID de recurso no encontrado');
      expect(component.loading()).toBe(false);
      expect(component.recurso()).toBeNull();
    });
  });

});
