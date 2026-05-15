import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TipoService, Tipo } from './tipo';

// Test unitario para el servicio de tipos:
describe('TipoService', () => {

  let service: TipoService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/tipos';

  const mockTipo: Tipo = {
    id: '1',
    nombre: 'PDF',
    imagen: 'base64imagedata',
    esPredeterminado: true,
    fechaModificacion: '2026-05-15T10:00:00',
    estadoSincronizacion: 'PENDIENTE',
    usuarioId: 'user123'
  };

  const mockTipos: Tipo[] = [
    { id: '1', nombre: 'PDF', esPredeterminado: true },
    { id: '2', nombre: 'ePub', esPredeterminado: true },
    { id: '3', nombre: 'Documento', esPredeterminado: true }
  ];

  const mockRecursos = [
    { id: '1', titulo: 'Recurso 1' },
    { id: '2', titulo: 'Recurso 2' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TipoService]
    });
    service = TestBed.inject(TipoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should return all tipos', () => {
      service.getAll().subscribe(data => {
        expect(data).toEqual(mockTipos);
        expect(data.length).toBe(3);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTipos);
    });

    it('should handle error when getAll fails', () => {
      service.getAll().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getById', () => {
    it('should return a single tipo by id', () => {
      const id = '1';
      service.getById(id).subscribe(data => {
        expect(data).toEqual(mockTipo);
        expect(data.id).toBe('1');
        expect(data.nombre).toBe('PDF');
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTipo);
    });

    it('should handle 404 when tipo not found', () => {
      const id = '999';
      service.getById(id).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new tipo', () => {
      const newTipo = { nombre: 'Nuevo Tipo' };
      const mockResponse = { ...newTipo, id: '4', esPredeterminado: false };

      service.create(newTipo).subscribe(data => {
        expect(data).toEqual(mockResponse);
        expect(data.id).toBe('4');
        expect(data.nombre).toBe('Nuevo Tipo');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTipo);
      req.flush(mockResponse);
    });

    it('should create a new tipo with imagen', () => {
      const newTipo = { nombre: 'Tipo con Imagen', imagen: 'base64image' };
      const mockResponse = { ...newTipo, id: '5' };

      service.create(newTipo).subscribe(data => {
        expect(data).toEqual(mockResponse);
        expect(data.imagen).toBe('base64image');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.body.imagen).toBe('base64image');
      req.flush(mockResponse);
    });

    it('should handle 400 error when nombre already exists', () => {
      const newTipo = { nombre: 'PDF' };
      const errorMessage = 'Ya existe un tipo con el nombre \'PDF\'';

      service.create(newTipo).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update an existing tipo', () => {
      const id = '1';
      const updateData = { nombre: 'PDF Actualizado' };
      const mockResponse = { ...mockTipo, ...updateData };

      service.update(id, updateData).subscribe(data => {
        expect(data).toEqual(mockResponse);
        expect(data.nombre).toBe('PDF Actualizado');
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });

    it('should update imagen of an existing tipo', () => {
      const id = '1';
      const updateData = { imagen: 'newbase64image' };
      const mockResponse = { ...mockTipo, ...updateData };

      service.update(id, updateData).subscribe(data => {
        expect(data.imagen).toBe('newbase64image');
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.body.imagen).toBe('newbase64image');
      req.flush(mockResponse);
    });

    it('should handle 404 when updating non-existent tipo', () => {
      const id = '999';
      const updateData = { nombre: 'No Existe' };

      service.update(id, updateData).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('delete', () => {
    it('should delete a tipo', () => {
      const id = '1';
      service.delete(id).subscribe(data => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle 404 when deleting non-existent tipo', () => {
      const id = '999';
      service.delete(id).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 400 when deleting predeterminado tipo', () => {
      const id = '1';
      const errorMessage = 'No se puede eliminar un tipo predeterminado';

      service.delete(id).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getRecursosAsociados', () => {
    it('should return recursos asociados to a tipo', () => {
      const id = '1';
      service.getRecursosAsociados(id).subscribe(data => {
        expect(data).toEqual(mockRecursos);
        expect(data.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}/recursos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecursos);
    });

    it('should return empty array when no recursos asociados', () => {
      const id = '2';
      service.getRecursosAsociados(id).subscribe(data => {
        expect(data).toEqual([]);
        expect(data.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}/recursos`);
      req.flush([]);
    });

    it('should handle error when getRecursosAsociados fails', () => {
      const id = '1';
      service.getRecursosAsociados(id).subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}/recursos`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

});
