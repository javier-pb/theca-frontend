import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RecursoService } from './recurso';

// Test unitario para el servicio recursos:
describe('RecursoService', () => {

  let service: RecursoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecursoService]
    });
    service = TestBed.inject(RecursoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should call GET /api/recursos without usuarioId when no param provided', () => {
      const mockRecursos = [
        { id: '1', titulo: 'Recurso 1' },
        { id: '2', titulo: 'Recurso 2' }
      ];

      service.getAll().subscribe(data => {
        expect(data).toEqual(mockRecursos);
        expect(data.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/recursos');
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toBe('/api/recursos');
      req.flush(mockRecursos);
    });

    it('should call GET /api/recursos with usuarioId when param provided', () => {
      const mockRecursos = [
        { id: '1', titulo: 'Recurso 1', usuarioId: 'user123' }
      ];
      const usuarioId = 'user123';

      service.getAll(usuarioId).subscribe(data => {
        expect(data).toEqual(mockRecursos);
      });

      const req = httpMock.expectOne('/api/recursos?usuarioId=user123');
      expect(req.request.method).toBe('GET');
      expect(req.request.urlWithParams).toContain('usuarioId=user123');
      req.flush(mockRecursos);
    });
  });

  describe('getById', () => {
    it('should call GET /api/recursos/:id and return data', () => {
      const mockRecurso = { id: '123', titulo: 'Recurso específico' };
      const id = '123';

      service.getById(id).subscribe(data => {
        expect(data).toEqual(mockRecurso);
      });

      const req = httpMock.expectOne(`/api/recursos/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecurso);
    });
  });

  describe('create', () => {
    it('should call POST /api/recursos and return created data', () => {
      const newRecurso = { titulo: 'Nuevo recurso', descripcion: 'Descripción' };
      const mockResponse = { id: '123', ...newRecurso };

      service.create(newRecurso).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/recursos');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newRecurso);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should call PUT /api/recursos/:id and return updated data', () => {
      const id = '123';
      const updatedData = { titulo: 'Título actualizado' };
      const mockResponse = { id, ...updatedData };

      service.update(id, updatedData).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`/api/recursos/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call DELETE /api/recursos/:id', () => {
      const id = '123';

      service.delete(id).subscribe(data => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne(`/api/recursos/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('search', () => {
    it('should call POST /api/recursos/buscar with filters only when no usuarioId provided', () => {
      const filters = { titulo: 'Java', tipo: 'libro' };
      const mockResults = [
        { id: '1', titulo: 'Java para principiantes' },
        { id: '2', titulo: 'Java avanzado' }
      ];

      service.search(filters).subscribe(data => {
        expect(data).toEqual(mockResults);
        expect(data.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/recursos/buscar');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(filters);
      expect(req.request.urlWithParams).not.toContain('usuarioId');
      req.flush(mockResults);
    });

    it('should call POST /api/recursos/buscar with usuarioId as query param when provided', () => {
      const filters = { titulo: 'Angular' };
      const usuarioId = 'user123';
      const mockResults = [{ id: '1', titulo: 'Angular para principiantes' }];

      service.search(filters, usuarioId).subscribe(data => {
        expect(data).toEqual(mockResults);
      });

      const req = httpMock.expectOne('/api/recursos/buscar?usuarioId=user123');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(filters);
      expect(req.request.urlWithParams).toContain('usuarioId=user123');
      req.flush(mockResults);
    });

    it('should call POST /api/recursos/buscar with empty filters', () => {
      const filters = {};
      const mockResults: any[] = [];  // 🔴 Añadir tipo explícito

      service.search(filters).subscribe(data => {
        expect(data).toEqual(mockResults);
      });

      const req = httpMock.expectOne('/api/recursos/buscar');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(filters);
      req.flush(mockResults);
    });
  });

});
