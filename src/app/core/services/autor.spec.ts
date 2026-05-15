import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AutorService, Autor } from './autor';

// Test unitario para el servicio del autor:
describe('AutorService', () => {
  let service: AutorService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/autores';

  const mockAutor: Autor = {
    id: '1',
    nombre: 'Gabriel García Márquez',
    fechaModificacion: '2026-05-14T10:00:00',
    estadoSincronizacion: 'PENDIENTE',
    usuarioId: 'user123'
  };

  const mockAutores: Autor[] = [
    { id: '1', nombre: 'Gabriel García Márquez' },
    { id: '2', nombre: 'Miguel de Cervantes' },
    { id: '3', nombre: 'Isabel Allende' }
  ];

  const mockRecursos = [
    { id: '1', titulo: 'Cien años de soledad' },
    { id: '2', titulo: 'Don Quijote de la Mancha' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AutorService]
    });
    service = TestBed.inject(AutorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all autores', () => {
      service.getAll().subscribe(data => {
        expect(data).toEqual(mockAutores);
        expect(data.length).toBe(3);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockAutores);
    });
  });

  describe('getById', () => {
    it('should return a single autor by id', () => {
      const id = '1';
      service.getById(id).subscribe(data => {
        expect(data).toEqual(mockAutor);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAutor);
    });
  });

  describe('create', () => {
    it('should create a new autor', () => {
      const newAutor = { nombre: 'Jorge Luis Borges' };
      const mockResponse = { ...newAutor, id: '4' };

      service.create(newAutor).subscribe(data => {
        expect(data).toEqual(mockResponse);
        expect(data.id).toBe('4');
        expect(data.nombre).toBe('Jorge Luis Borges');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAutor);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing autor', () => {
      const id = '1';
      const updateData = { nombre: 'Gabriel García Márquez (Actualizado)' };
      const mockResponse = { ...mockAutor, ...updateData };

      service.update(id, updateData).subscribe(data => {
        expect(data).toEqual(mockResponse);
        expect(data.nombre).toBe('Gabriel García Márquez (Actualizado)');
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete an autor', () => {
      const id = '1';
      service.delete(id).subscribe(data => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getRecursosAsociados', () => {
    it('should return recursos asociados to an autor', () => {
      const id = '1';
      service.getRecursosAsociados(id).subscribe(data => {
        expect(data).toEqual(mockRecursos);
        expect(data.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}/recursos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecursos);
    });
  });

  describe('asociarRecursos', () => {
    it('should associate recursos to an autor', () => {
      const id = '1';
      const recursosIds = ['r1', 'r2'];
      const mockResponse = { message: 'Recursos asociados exitosamente' };

      service.asociarRecursos(id, recursosIds).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}/recursos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ recursosIds });
      req.flush(mockResponse);
    });
  });

  describe('desasociarRecursos', () => {
    it('should disassociate recursos from an autor', () => {
      const id = '1';
      const recursosIds = ['r1', 'r2'];
      const mockResponse = { message: 'Recursos desasociados exitosamente' };

      service.desasociarRecursos(id, recursosIds).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}/recursos`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({ recursosIds });
      req.flush(mockResponse);
    });
  });

});
