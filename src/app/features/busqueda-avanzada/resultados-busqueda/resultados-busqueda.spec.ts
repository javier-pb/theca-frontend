import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { ResultadosBusquedaComponent } from './resultados-busqueda';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
import { AutorService, Autor } from '../../../core/services/autor';
import { TipoService, Tipo } from '../../../core/services/tipo';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { EtiquetaService, Etiqueta } from '../../../core/services/etiqueta';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para los resultados de la búsqueda:
describe('ResultadosBusquedaComponent', () => {

  let component: ResultadosBusquedaComponent;
  let fixture: ComponentFixture<ResultadosBusquedaComponent>;
  let recursoService: jasmine.SpyObj<RecursoService>;
  let authService: jasmine.SpyObj<AuthService>;
  let autorService: jasmine.SpyObj<AutorService>;
  let tipoService: jasmine.SpyObj<TipoService>;
  let categoriaService: jasmine.SpyObj<CategoriaService>;
  let etiquetaService: jasmine.SpyObj<EtiquetaService>;
  let router: Router;

  const mockUserId = 'user123';

  const mockTipos: Tipo[] = [
    { id: '1', nombre: 'PDF', esPredeterminado: true },
    { id: '2', nombre: 'ePub', esPredeterminado: true }
  ];

  const mockAutores: Autor[] = [
    { id: '1', nombre: 'Miguel de Cervantes' },
    { id: '2', nombre: 'Gabriel García Márquez' }
  ];

  const mockCategorias: Categoria[] = [
    { id: '1', nombre: 'Literatura' },
    { id: '2', nombre: 'Poesía' }
  ];

  const mockEtiquetas: Etiqueta[] = [
    { id: '1', nombre: 'Barroco' },
    { id: '2', nombre: 'Renacimiento' }
  ];

  const mockRecursos = [
    {
      id: '1',
      titulo: 'El Quijote',
      autores: [{ id: '1', nombre: 'Miguel de Cervantes' }],
      portada: null,
      tipos: [{ id: '1' }],
      fechaModificacion: '2024-01-15T10:00:00'
    },
    {
      id: '2',
      titulo: 'Cien años de soledad',
      autores: [{ id: '2', nombre: 'Gabriel García Márquez' }],
      portada: 'base64image',
      tipos: [{ id: '2' }],
      fechaModificacion: '2024-06-15T10:00:00'
    }
  ];

  const mockRecursosSinNombres = [
    {
      id: '3',
      titulo: 'Recurso sin nombres',
      autores: [{ id: '1' }],
      portada: null,
      tipos: [{ id: '1' }],
      fechaModificacion: '2024-01-15T10:00:00'
    }
  ];

  const createComponentWithFilters = (filtros: any = {}) => {
    const mockActivatedRoute = {
      queryParams: of({ filtros: JSON.stringify(filtros) })
    };

    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

    fixture = TestBed.createComponent(ResultadosBusquedaComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    recursoService = jasmine.createSpyObj('RecursoService', ['search']);
    authService = jasmine.createSpyObj('AuthService', ['getUserId']);
    autorService = jasmine.createSpyObj('AutorService', ['getAll', 'getById']);
    tipoService = jasmine.createSpyObj('TipoService', ['getAll']);
    categoriaService = jasmine.createSpyObj('CategoriaService', ['getAll']);
    etiquetaService = jasmine.createSpyObj('EtiquetaService', ['getAll']);

    authService.getUserId.and.returnValue(mockUserId);
    tipoService.getAll.and.returnValue(of(mockTipos));
    categoriaService.getAll.and.returnValue(of(mockCategorias));
    etiquetaService.getAll.and.returnValue(of(mockEtiquetas));
    autorService.getAll.and.returnValue(of(mockAutores));
    autorService.getById.and.returnValue(of({ id: '1', nombre: 'Miguel de Cervantes' }));
    recursoService.search.and.returnValue(of(mockRecursos));

    await TestBed.configureTestingModule({
      imports: [
        ResultadosBusquedaComponent,
        RouterTestingModule.withRoutes([
          { path: 'busqueda-avanzada', component: DummyComponent },
          { path: 'recursos/detalle/1', component: DummyComponent },
          { path: 'recursos/detalle/2', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: RecursoService, useValue: recursoService },
        { provide: AuthService, useValue: authService },
        { provide: AutorService, useValue: autorService },
        { provide: TipoService, useValue: tipoService },
        { provide: CategoriaService, useValue: categoriaService },
        { provide: EtiquetaService, useValue: etiquetaService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    recursoService.search.calls.reset();
    autorService.getById.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      createComponentWithFilters({ titulo: 'test' });
      expect(component).toBeTruthy();
    });
  });

  describe('Carga de datos iniciales', () => {
    it('should load tipos, categorias, etiquetas and autores on init', () => {
      createComponentWithFilters({ titulo: 'test' });

      expect(tipoService.getAll).toHaveBeenCalled();
      expect(categoriaService.getAll).toHaveBeenCalled();
      expect(etiquetaService.getAll).toHaveBeenCalled();
      expect(autorService.getAll).toHaveBeenCalled();
    });

    it('should build mapaTipos from loaded tipos', () => {
      createComponentWithFilters({ titulo: 'test' });
      expect(component.mapaTipos.size).toBe(2);
      expect(component.mapaTipos.get('1')?.nombre).toBe('PDF');
    });
  });

  describe('Receiving filters', () => {
    it('should receive filters from queryParams', fakeAsync(() => {
      const filtros = { titulo: 'Quijote' };
      createComponentWithFilters(filtros);
      tick();

      expect(component.filtrosAplicados()).toEqual(filtros);
      expect(recursoService.search).toHaveBeenCalledWith(filtros, mockUserId);
    }));

    it('should handle invalid JSON in queryParams', fakeAsync(() => {
      const mockActivatedRoute = {
        queryParams: of({ filtros: 'invalid-json' })
      };
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

      fixture = TestBed.createComponent(ResultadosBusquedaComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);

      fixture.detectChanges();
      tick();

      expect(component.error()).toBe('No se especificaron criterios de búsqueda');
    }));
  });

  describe('realizarBusqueda', () => {
    it('should search and display results', fakeAsync(() => {
      createComponentWithFilters({ titulo: 'test' });
      tick();

      expect(component.recursos().length).toBe(2);
      expect(component.loading()).toBe(false);
    }));

    it('should extract autoresList from recursos with nombres', fakeAsync(() => {
      createComponentWithFilters({ titulo: 'test' });
      tick();

      // 🔴 CORREGIDO: buscar el recurso específico en lugar de asumir orden
      const recursoQuijote = component.recursos().find(r => r.titulo === 'El Quijote');
      expect(recursoQuijote.autoresList).toEqual(['Miguel de Cervantes']);
    }));

    it('should load autores by ID when nombres are missing', fakeAsync(() => {
      recursoService.search.and.returnValue(of(mockRecursosSinNombres));
      createComponentWithFilters({ titulo: 'test' });
      tick();

      expect(autorService.getById).toHaveBeenCalledWith('1');
    }));

    it('should generate imagenPortada for tipos predeterminados', fakeAsync(() => {
      createComponentWithFilters({ titulo: 'test' });
      tick();

      // 🔴 CORREGIDO: buscar el recurso con tipo PDF
      const recursoPDF = component.recursos().find(r => r.tipos?.[0]?.id === '1');
      expect(recursoPDF.imagenPortada).toBe('assets/images/PDF.png');
    }));

    it('should use recurso.portada when available', fakeAsync(() => {
      createComponentWithFilters({ titulo: 'test' });
      tick();

      // 🔴 CORREGIDO: buscar el recurso con portada
      const recursoConPortada = component.recursos().find(r => r.portada === 'base64image');
      expect(recursoConPortada.imagenPortada).toBe('base64image');
    }));

    it('should order recursos by modification date (newest first)', fakeAsync(() => {
      createComponentWithFilters({ titulo: 'test' });
      tick();

      // El orden debe ser: más reciente primero (Cien años de soledad tiene fecha 2024-06-15)
      expect(component.recursos()[0].fechaModificacion).toBe('2024-06-15T10:00:00');
      expect(component.recursos()[1].fechaModificacion).toBe('2024-01-15T10:00:00');
    }));

    it('should handle search error', fakeAsync(() => {
      recursoService.search.and.returnValue(throwError(() => new Error('Error')));
      createComponentWithFilters({ titulo: 'test' });
      tick();

      expect(component.error()).toBe('Error al realizar la búsqueda');
      expect(component.loading()).toBe(false);
    }));
  });

  describe('ordenarPorFechaModificacion', () => {
    it('should sort recursos by modification date (newest first)', () => {
      createComponentWithFilters({ titulo: 'test' });

      const recursos = [
        { fechaModificacion: '2024-01-15T10:00:00', titulo: 'Antiguo' },
        { fechaModificacion: '2024-06-15T10:00:00', titulo: 'Reciente' },
        { fechaModificacion: '2024-03-15T10:00:00', titulo: 'Medio' }
      ];

      const ordenados = component.ordenarPorFechaModificacion(recursos);

      expect(ordenados[0].titulo).toBe('Reciente');
      expect(ordenados[1].titulo).toBe('Medio');
      expect(ordenados[2].titulo).toBe('Antiguo');
    });
  });

  describe('Navigation methods', () => {
    it('should navigate to busqueda-avanzada when volverABuscar is called', () => {
      createComponentWithFilters({ titulo: 'test' });
      spyOn(router, 'navigate');
      component.volverABuscar();
      expect(router.navigate).toHaveBeenCalledWith(['/busqueda-avanzada']);
    });

    it('should navigate to recurso detalle when verDetalle is called', () => {
      createComponentWithFilters({ titulo: 'test' });
      spyOn(router, 'navigate');
      component.verDetalle('1');
      expect(router.navigate).toHaveBeenCalledWith(['/recursos/detalle', '1']);
    });
  });

  describe('getPortadaUrl', () => {
    it('should return empty string when portada is null or undefined', () => {
      createComponentWithFilters({ titulo: 'test' });
      expect(component.getPortadaUrl('')).toBe('');
      expect(component.getPortadaUrl(null as any)).toBe('');
    });

    it('should return unchanged URL when portada starts with http', () => {
      createComponentWithFilters({ titulo: 'test' });
      const url = 'https://ejemplo.com/imagen.jpg';
      expect(component.getPortadaUrl(url)).toBe(url);
    });

    it('should return unchanged URL when portada starts with assets/', () => {
      createComponentWithFilters({ titulo: 'test' });
      const url = 'assets/images/PDF.png';
      expect(component.getPortadaUrl(url)).toBe(url);
    });

    it('should return unchanged URL when portada starts with data:', () => {
      createComponentWithFilters({ titulo: 'test' });
      const url = 'data:image/jpeg;base64,abc123';
      expect(component.getPortadaUrl(url)).toBe(url);
    });

    it('should add base64 prefix when portada is base64 string', () => {
      createComponentWithFilters({ titulo: 'test' });
      const base64 = 'abc123def456';
      expect(component.getPortadaUrl(base64)).toBe('data:image/jpeg;base64,' + base64);
    });
  });
});
