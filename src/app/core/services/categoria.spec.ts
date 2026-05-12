import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CategoriaService, Categoria } from './categoria';

// Test unitario para el servicio de categoría:
describe('CategoriaService', () => {

  let service: CategoriaService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/categorias';

  const mockCategoria: Categoria = {
    id: '1',
    nombre: 'Test Categoria',
    categoriaPadreId: undefined
  };

  const mockCategorias: Categoria[] = [
    { id: '1', nombre: 'Categoria 1', categoriaPadreId: undefined },
    { id: '2', nombre: 'Categoria 2', categoriaPadreId: '1' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoriaService]
    });
    service = TestBed.inject(CategoriaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all categorias', () => {
      service.getAll().subscribe(data => {
        expect(data).toEqual(mockCategorias);
        expect(data.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategorias);
    });
  });

  describe('getById', () => {
    it('should return a single categoria by id', () => {
      const id = '1';
      service.getById(id).subscribe(data => {
        expect(data).toEqual(mockCategoria);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategoria);
    });
  });

  describe('create', () => {
    it('should create a new categoria', () => {
      const newCategoria = { nombre: 'Nueva Categoria', categoriaPadreId: undefined };
      const mockResponse = { ...newCategoria, id: '3' };

      service.create(newCategoria).subscribe(data => {
        expect(data).toEqual(mockResponse);
        expect(data.id).toBe('3');
        expect(data.nombre).toBe('Nueva Categoria');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCategoria);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing categoria', () => {
      const id = '1';
      const updateData = { nombre: 'Categoria Actualizada' };
      const mockResponse = { ...mockCategoria, ...updateData };

      service.update(id, updateData).subscribe(data => {
        expect(data).toEqual(mockResponse);
        expect(data.nombre).toBe('Categoria Actualizada');
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a categoria', () => {
      const id = '1';
      service.delete(id).subscribe(data => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

});
