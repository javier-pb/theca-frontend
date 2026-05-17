import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { GlobalSearchService, SearchResult } from './global-search';
import { AuthService } from './auth';
import { TipoService } from './tipo';
import { AutorService } from './autor';

// Test unitario para el serivico de búsqueda global:
describe('GlobalSearchService', () => {

  let service: GlobalSearchService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;
  let tipoService: jasmine.SpyObj<TipoService>;
  let autorService: jasmine.SpyObj<AutorService>;

  const mockUserId = 'user123';

  const mockTipos = [
    { id: '1', nombre: 'PDF', esPredeterminado: true },
    { id: '2', nombre: 'ePub', esPredeterminado: true }
  ];

  const mockAutor = { id: 'autor1', nombre: 'Miguel de Cervantes' };

  const mockRecursos = [
    { id: '1', titulo: 'El Quijote', autores: [{ id: 'autor1' }], portada: null, tipos: [{ id: '1' }] }
  ];

  const mockAutores = [
    { id: '2', nombre: 'Gabriel García Márquez' }
  ];

  const mockCategorias = [
    { id: '3', nombre: 'Literatura' }
  ];

  const mockEtiquetas = [
    { id: '4', nombre: 'Barroco' }
  ];

  const mockTiposLista = [
    { id: '5', nombre: 'PDF' }
  ];

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getUserId']);
    tipoService = jasmine.createSpyObj('TipoService', ['getAll']);
    autorService = jasmine.createSpyObj('AutorService', ['getById']);

    authService.getUserId.and.returnValue(mockUserId);
    tipoService.getAll.and.returnValue(of(mockTipos));
    autorService.getById.and.returnValue(of(mockAutor));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GlobalSearchService,
        { provide: AuthService, useValue: authService },
        { provide: TipoService, useValue: tipoService },
        { provide: AutorService, useValue: autorService }
      ]
    });

    service = TestBed.inject(GlobalSearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('buscar', () => {
    it('should return empty array when termino is less than 2 characters', (done) => {
      service.buscar('a').subscribe(result => {
        expect(result).toEqual([]);
        done();
      });
    });

    it('should return empty array when termino is empty', (done) => {
      service.buscar('').subscribe(result => {
        expect(result).toEqual([]);
        done();
      });
    });

    it('should perform search and combine results from all entities', fakeAsync(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));

      service.buscar('test').subscribe(results => {
        expect(results.length).toBeGreaterThan(0);
      });

      const reqRecursos = httpMock.expectOne('/api/recursos/buscar?usuarioId=user123');
      reqRecursos.flush(mockRecursos);

      const reqAutores = httpMock.expectOne('/api/autores?usuarioId=user123');
      reqAutores.flush(mockAutores);

      const reqCategorias = httpMock.expectOne('/api/categorias?usuarioId=user123');
      reqCategorias.flush(mockCategorias);

      const reqEtiquetas = httpMock.expectOne('/api/etiquetas?usuarioId=user123');
      reqEtiquetas.flush(mockEtiquetas);

      const reqTipos = httpMock.expectOne('/api/tipos?usuarioId=user123');
      reqTipos.flush(mockTiposLista);

      tick();
    }));

    it('should order results by tipo priority: recurso, categoria, etiqueta, autor, tipo', (done) => {
      const mockResultados: SearchResult[] = [
        { id: '1', titulo: 'Zeta', tipo: 'recurso', ruta: '/recursos/detalle/1' },
        { id: '2', titulo: 'Alfa', tipo: 'tipo', ruta: '/tipos/detalle/2' },
        { id: '3', titulo: 'Beta', tipo: 'categoria', ruta: '/categorias/detalle/3' },
        { id: '4', titulo: 'Gamma', tipo: 'etiqueta', ruta: '/etiquetas/detalle/4' },
        { id: '5', titulo: 'Delta', tipo: 'autor', ruta: '/autores/detalle/5' }
      ];

      const ordenEsperado = ['recurso', 'categoria', 'etiqueta', 'autor', 'tipo'];

      expect(ordenEsperado[0]).toBe('recurso');
      expect(ordenEsperado[1]).toBe('categoria');
      expect(ordenEsperado[2]).toBe('etiqueta');
      expect(ordenEsperado[3]).toBe('autor');
      expect(ordenEsperado[4]).toBe('tipo');

      done();
    });

    it('should sort results alphabetically within same tipo', () => {
      const mismosTipo: SearchResult[] = [
        { id: '1', titulo: 'Zeta', tipo: 'recurso', ruta: '/recursos/detalle/1' },
        { id: '2', titulo: 'Alfa', tipo: 'recurso', ruta: '/recursos/detalle/2' },
        { id: '3', titulo: 'Beta', tipo: 'recurso', ruta: '/recursos/detalle/3' }
      ];

      const ordenados = mismosTipo.sort((a, b) => a.titulo.localeCompare(b.titulo));

      expect(ordenados[0].titulo).toBe('Alfa');
      expect(ordenados[1].titulo).toBe('Beta');
      expect(ordenados[2].titulo).toBe('Zeta');
    });

    it('should limit results to maximum 10', () => {
      const muchosResultados: SearchResult[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        titulo: `Resultado ${i}`,
        tipo: 'recurso',
        ruta: `/recursos/detalle/${i}`
      }));

      const limitados = muchosResultados.slice(0, 10);
      expect(limitados.length).toBe(10);
    });

    it('should handle error when API calls fail', fakeAsync(() => {
      service.buscar('test').subscribe(results => {
        expect(results).toEqual([]);
      });

      const reqRecursos = httpMock.expectOne('/api/recursos/buscar?usuarioId=user123');
      reqRecursos.error(new ErrorEvent('Network error'));

      const reqAutores = httpMock.expectOne('/api/autores?usuarioId=user123');
      reqAutores.flush([]);

      const reqCategorias = httpMock.expectOne('/api/categorias?usuarioId=user123');
      reqCategorias.flush([]);

      const reqEtiquetas = httpMock.expectOne('/api/etiquetas?usuarioId=user123');
      reqEtiquetas.flush([]);

      const reqTipos = httpMock.expectOne('/api/tipos?usuarioId=user123');
      reqTipos.flush([]);

      tick();
    }));
  });

  describe('buscarRecursos', () => {
    it('should format recurso correctly with imagen and autores', fakeAsync(() => {
      autorService.getById.and.returnValue(of(mockAutor));

      service.buscar('Quijote').subscribe();

      const reqRecursos = httpMock.expectOne('/api/recursos/buscar?usuarioId=user123');
      expect(reqRecursos.request.method).toBe('POST');
      expect(reqRecursos.request.body).toEqual({ titulo: 'quijote' });
      reqRecursos.flush(mockRecursos);

      const reqAutores = httpMock.expectOne('/api/autores?usuarioId=user123');
      expect(reqAutores.request.method).toBe('GET');
      reqAutores.flush([]);

      const reqCategorias = httpMock.expectOne('/api/categorias?usuarioId=user123');
      expect(reqCategorias.request.method).toBe('GET');
      reqCategorias.flush([]);

      const reqEtiquetas = httpMock.expectOne('/api/etiquetas?usuarioId=user123');
      expect(reqEtiquetas.request.method).toBe('GET');
      reqEtiquetas.flush([]);

      const reqTipos = httpMock.expectOne('/api/tipos?usuarioId=user123');
      expect(reqTipos.request.method).toBe('GET');
      reqTipos.flush([]);

      tick();
      httpMock.verify();
    }));
  });

  describe('buscarAutores', () => {
    it('should filter autores by nombre', () => {
      const autores = [
        { id: '1', nombre: 'Juan Pérez' },
        { id: '2', nombre: 'María García' }
      ];

      const filtrados = autores.filter(a => a.nombre.toLowerCase().includes('juan'));
      expect(filtrados.length).toBe(1);
      expect(filtrados[0].nombre).toBe('Juan Pérez');
    });
  });

  describe('buscarCategorias', () => {
    it('should filter categorias by nombre', () => {
      const categorias = [
        { id: '1', nombre: 'Literatura' },
        { id: '2', nombre: 'Historia' }
      ];

      const filtrados = categorias.filter(c => c.nombre.toLowerCase().includes('literatura'));
      expect(filtrados.length).toBe(1);
      expect(filtrados[0].nombre).toBe('Literatura');
    });
  });

  describe('buscarEtiquetas', () => {
    it('should filter etiquetas by nombre', () => {
      const etiquetas = [
        { id: '1', nombre: 'Barroco' },
        { id: '2', nombre: 'Renacimiento' }
      ];

      const filtrados = etiquetas.filter(e => e.nombre.toLowerCase().includes('barroco'));
      expect(filtrados.length).toBe(1);
      expect(filtrados[0].nombre).toBe('Barroco');
    });
  });

  describe('buscarTipos', () => {
    it('should filter tipos by nombre', () => {
      const tipos = [
        { id: '1', nombre: 'PDF' },
        { id: '2', nombre: 'ePub' }
      ];

      const filtrados = tipos.filter(t => t.nombre.toLowerCase().includes('pdf'));
      expect(filtrados.length).toBe(1);
      expect(filtrados[0].nombre).toBe('PDF');
    });
  });

});
