import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EtiquetaService, Etiqueta } from './etiqueta';

// Test unitario para el servicio de etiquetas:
describe('EtiquetaService', () => {

  let service: EtiquetaService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/etiquetas';

  const mockEtiqueta: Etiqueta = {
    id: '1',
    nombre: 'Angular',
    fechaModificacion: '2026-05-13T10:00:00',
    estadoSincronizacion: 'PENDIENTE',
    usuarioId: 'user123'
  };

  const mockEtiquetas: Etiqueta[] = [
    { id: '1', nombre: 'Angular' },
    { id: '2', nombre: 'TypeScript' },
    { id: '3', nombre: 'JavaScript' }
  ];

  const mockRecursos = [
    { id: '1', titulo: 'Recurso 1' },
    { id: '2', titulo: 'Recurso 2' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EtiquetaService]
    });
    service = TestBed.inject(EtiquetaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all etiquetas', () => {
      service.getAll().subscribe(data => {
        expect(data).toEqual(mockEtiquetas);
        expect(data.length).toBe(3);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockEtiquetas);
    });
  });

  describe('getById', () => {
    it('should return a single etiqueta by id', () => {
      const id = '1';
      service.getById(id).subscribe(data => {
        expect(data).toEqual(mockEtiqueta);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEtiqueta);
    });
  });

  describe('create', () => {
    it('should create a new etiqueta', () => {
      const newEtiqueta = { nombre: 'React' };
      const mockResponse = { ...newEtiqueta, id: '4' };

      service.create(newEtiqueta).subscribe(data => {
        expect(data).toEqual(mockResponse);
        expect(data.id).toBe('4');
        expect(data.nombre).toBe('React');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEtiqueta);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing etiqueta', () => {
      const id = '1';
      const updateData = { nombre: 'Angular 17' };
      const mockResponse = { ...mockEtiqueta, ...updateData };

      service.update(id, updateData).subscribe(data => {
        expect(data).toEqual(mockResponse);
        expect(data.nombre).toBe('Angular 17');
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete an etiqueta', () => {
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
    it('should return recursos asociados to an etiqueta', () => {
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

});
