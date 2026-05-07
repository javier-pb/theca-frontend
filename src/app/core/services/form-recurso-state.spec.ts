import { TestBed } from '@angular/core/testing';
import { FormRecursoStateService, FormRecursoState } from './form-recurso-state';

// Test unitario para el servicio de estado del formulario de recurso:
describe('FormRecursoStateService', () => {

  let service: FormRecursoStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormRecursoStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const state = service.getState()();

      expect(state.titulo).toBe('');
      expect(state.autoresIds).toEqual([]);
      expect(state.autoresTexto).toBe('');
      expect(state.portada).toBeNull();
      expect(state.tipoId).toBeNull();
      expect(state.version).toBe('');
      expect(state.descripcion).toBe('');
      expect(state.enlace).toBe('');
      expect(state.categoriasIds).toEqual([]);
      expect(state.categoriasTexto).toEqual([]);
      expect(state.etiquetasIds).toEqual([]);
      expect(state.etiquetasTexto).toEqual([]);
    });
  });

  describe('setTitulo', () => {
    it('should update titulo', () => {
      service.setTitulo('Nuevo Título');

      const state = service.getState()();
      expect(state.titulo).toBe('Nuevo Título');
    });
  });

  describe('setAutores', () => {
    it('should update autoresIds and autoresTexto', () => {
      service.setAutores(['1', '2'], 'Autor 1, Autor 2');

      const state = service.getState()();
      expect(state.autoresIds).toEqual(['1', '2']);
      expect(state.autoresTexto).toBe('Autor 1, Autor 2');
    });
  });

  describe('setPortada', () => {
    it('should update portada with string', () => {
      service.setPortada('data:image/png;base64,abc123');

      const state = service.getState()();
      expect(state.portada).toBe('data:image/png;base64,abc123');
    });

    it('should update portada with null', () => {
      service.setPortada(null);

      const state = service.getState()();
      expect(state.portada).toBeNull();
    });
  });

  describe('setTipo', () => {
    it('should update tipoId with string', () => {
      service.setTipo('tipo123');

      const state = service.getState()();
      expect(state.tipoId).toBe('tipo123');
    });

    it('should update tipoId with null', () => {
      service.setTipo(null);

      const state = service.getState()();
      expect(state.tipoId).toBeNull();
    });
  });

  describe('setVersion', () => {
    it('should update version', () => {
      service.setVersion('2.5');

      const state = service.getState()();
      expect(state.version).toBe('2.5');
    });
  });

  describe('setDescripcion', () => {
    it('should update descripcion', () => {
      service.setDescripcion('Descripción de prueba');

      const state = service.getState()();
      expect(state.descripcion).toBe('Descripción de prueba');
    });
  });

  describe('setEnlace', () => {
    it('should update enlace', () => {
      service.setEnlace('https://example.com');

      const state = service.getState()();
      expect(state.enlace).toBe('https://example.com');
    });
  });

  describe('setCategorias', () => {
    it('should update categoriasIds and categoriasTexto', () => {
      service.setCategorias(['cat1', 'cat2'], ['Categoría 1', 'Categoría 2']);

      const state = service.getState()();
      expect(state.categoriasIds).toEqual(['cat1', 'cat2']);
      expect(state.categoriasTexto).toEqual(['Categoría 1', 'Categoría 2']);
    });
  });

  describe('setEtiquetas', () => {
    it('should update etiquetasIds and etiquetasTexto', () => {
      service.setEtiquetas(['tag1', 'tag2'], ['Etiqueta 1', 'Etiqueta 2']);

      const state = service.getState()();
      expect(state.etiquetasIds).toEqual(['tag1', 'tag2']);
      expect(state.etiquetasTexto).toEqual(['Etiqueta 1', 'Etiqueta 2']);
    });
  });

  describe('clearState', () => {
    it('should reset state to default values', () => {
      service.setTitulo('Título modificado');
      service.setAutores(['1'], 'Autor 1');
      service.setPortada('portada123');
      service.setTipo('tipo1');
      service.setVersion('3.0');
      service.setDescripcion('Descripción modificada');
      service.setEnlace('https://modified.com');
      service.setCategorias(['cat1'], ['Cat 1']);
      service.setEtiquetas(['tag1'], ['Tag 1']);

      let state = service.getState()();
      expect(state.titulo).toBe('Título modificado');

      service.clearState();

      state = service.getState()();
      expect(state.titulo).toBe('');
      expect(state.autoresIds).toEqual([]);
      expect(state.autoresTexto).toBe('');
      expect(state.portada).toBeNull();
      expect(state.tipoId).toBeNull();
      expect(state.version).toBe('1.0');
      expect(state.descripcion).toBe('');
      expect(state.enlace).toBe('');
      expect(state.categoriasIds).toEqual([]);
      expect(state.categoriasTexto).toEqual([]);
      expect(state.etiquetasIds).toEqual([]);
      expect(state.etiquetasTexto).toEqual([]);
    });
  });

  describe('multiple updates', () => {
    it('should preserve other fields when updating one field', () => {
      service.setTitulo('Título');
      service.setVersion('2.0');
      service.setDescripcion('Descripción');

      service.setVersion('3.0');

      const state = service.getState()();
      expect(state.titulo).toBe('Título');
      expect(state.version).toBe('3.0');
      expect(state.descripcion).toBe('Descripción');
    });

    it('should handle sequential updates correctly', () => {
      service.setAutores(['1'], 'Autor 1');
      service.setAutores(['1', '2'], 'Autor 1, Autor 2');

      const state = service.getState()();
      expect(state.autoresIds).toEqual(['1', '2']);
      expect(state.autoresTexto).toBe('Autor 1, Autor 2');
    });
  });

  describe('getState returns readonly signal', () => {
    it('should return a signal that can be read', () => {
      service.setTitulo('Test Title');

      const stateSignal = service.getState();
      expect(stateSignal().titulo).toBe('Test Title');
    });

    it('should return the same signal reference', () => {
      const signal1 = service.getState();
      const signal2 = service.getState();

      expect(signal1).toBe(signal2);
    });
  });

});
