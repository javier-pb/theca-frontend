// core/services/form-recurso-state.service.ts
import { Injectable, signal } from '@angular/core';

export interface FormRecursoState {
  titulo: string;
  autoresIds: string[];
  autoresTexto: string;
  portada: string | null;
  tipoId: string | null;
  version: string;
  descripcion: string;
  enlace: string;
  categoriasIds: string[];
  categoriasTexto: string[];
  etiquetasIds: string[];
  etiquetasTexto: string[];
}

@Injectable({ providedIn: 'root' })
// Servicio para manejar el estado del formulario de recurso:
export class FormRecursoStateService {
  private state = signal<FormRecursoState>({
    titulo: '',
    autoresIds: [],
    autoresTexto: '',
    portada: null,
    tipoId: null,
    version: '',
    descripcion: '',
    enlace: '',
    categoriasIds: [],
    categoriasTexto: [],
    etiquetasIds: [],
    etiquetasTexto: []
  });

  getState = () => this.state.asReadonly();

  setTitulo(titulo: string) {
    this.state.update(s => ({ ...s, titulo }));
  }

  setAutores(ids: string[], texto: string) {
    this.state.update(s => ({ ...s, autoresIds: ids, autoresTexto: texto }));
  }

  setPortada(portada: string | null) {
    this.state.update(s => ({ ...s, portada }));
  }

  setTipo(id: string | null) {
    this.state.update(s => ({ ...s, tipoId: id }));
  }

  setVersion(version: string) {
    this.state.update(s => ({ ...s, version }));
  }

  setDescripcion(descripcion: string) {
    this.state.update(s => ({ ...s, descripcion }));
  }

  setEnlace(enlace: string) {
    this.state.update(s => ({ ...s, enlace }));
  }

  setCategorias(ids: string[], texto: string[]) {
    this.state.update(s => ({ ...s, categoriasIds: ids, categoriasTexto: texto }));
  }

  setEtiquetas(ids: string[], texto: string[]) {
    this.state.update(s => ({ ...s, etiquetasIds: ids, etiquetasTexto: texto }));
  }

  clearState() {
    this.state.set({
      titulo: '',
      autoresIds: [],
      autoresTexto: '',
      portada: null,
      tipoId: null,
      version: '1.0',
      descripcion: '',
      enlace: '',
      categoriasIds: [],
      categoriasTexto: [],
      etiquetasIds: [],
      etiquetasTexto: []
    });
  }

}
