import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { DetalleRecursoComponent } from './detalle-recurso';
import { RecursoService } from '../../../core/services/recurso';

// Test unitario para el detalle de recurso:
describe('DetalleRecursoComponent', () => {

  let component: DetalleRecursoComponent;
  let fixture: ComponentFixture<DetalleRecursoComponent>;
  let mockRecursoService: jasmine.SpyObj<RecursoService>;
  let mockActivatedRoute: any;

  const mockRecurso = {
    id: '1',
    titulo: 'Recurso de prueba',
    descripcion: 'Descripción del recurso',
    enlace: 'https://ejemplo.com',
    tipo: 'libro',
    version: 1.0,
    estadoSincronizacion: 'PENDIENTE',
    fechaCreacion: '2024-01-15T10:00:00',
    fechaModificacion: '2024-01-15T10:00:00'
  };

  describe('Con ID válido', () => {
    beforeEach(async () => {
      mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue('1')
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
    });

    afterEach(() => {
      mockRecursoService.getById.calls.reset();
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.recurso()).toBeNull();
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
    });

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

  describe('Sin ID en ruta', () => {
    beforeEach(async () => {
      mockActivatedRoute = {
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
