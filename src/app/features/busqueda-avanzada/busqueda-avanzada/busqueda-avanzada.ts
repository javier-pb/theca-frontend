import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TipoService, Tipo } from '../../../core/services/tipo';
import { AutorService, Autor } from '../../../core/services/autor';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { EtiquetaService, Etiqueta } from '../../../core/services/etiqueta';

@Component({
  selector: 'app-busqueda-avanzada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './busqueda-avanzada.html',
  styleUrls: ['./busqueda-avanzada.css']
})
// Componente para la búsqueda avanzada:
export class BusquedaAvanzadaComponent implements OnInit {

  private router = inject(Router);

  titulo = signal('');
  autorId = signal('');
  tipoId = signal('');
  version = signal<number | null>(null);
  descripcion = signal('');
  estadoSincronizacion = signal(''); // TODO: para sincronización
  categoriaId = signal('');
  etiquetaId = signal('');
  fechaCreacion = signal<string>('');
  fechaModificacion = signal<string>('');

  tiposDisponibles = signal<Tipo[]>([]);
  autoresDisponibles = signal<Autor[]>([]);
  categoriasDisponibles = signal<Categoria[]>([]);
  categoriasJerarquicas = signal<{ id: string; displayNombre: string }[]>([]);
  etiquetasDisponibles = signal<Etiqueta[]>([]);

  loading = signal(false);

  private tipoService = inject(TipoService);
  private autorService = inject(AutorService);
  private categoriaService = inject(CategoriaService);
  private etiquetaService = inject(EtiquetaService);

  ngOnInit(): void {
    this.cargarTipos();
    this.cargarAutores();
    this.cargarCategorias();
    this.cargarEtiquetas();
  }

  cargarTipos(): void {
    this.tipoService.getAll().subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.tiposDisponibles.set(ordenados);
      },
    });
  }

  cargarAutores(): void {
    this.autorService.getAll().subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.autoresDisponibles.set(ordenados);
      },
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categoriasDisponibles.set(data);
        this.categoriasJerarquicas.set(this.construirJerarquia(data));
      },
    });
  }

  construirJerarquia(categorias: Categoria[]): { id: string; displayNombre: string }[] {
    const mapa = new Map<string, Categoria>();
    for (const cat of categorias) {
      mapa.set(cat.id!, cat);
    }

    const obtenerNombreCompleto = (categoria: Categoria): string => {
      const partes: string[] = [categoria.nombre];
      let actual = categoria;
      let contador = 0;
      const maxIteraciones = 100;

      while (actual.categoriaPadreId && contador < maxIteraciones) {
        const padre = mapa.get(actual.categoriaPadreId);
        if (!padre) break;
        partes.unshift(padre.nombre);
        actual = padre;
        contador++;
      }
      return partes.join(' > ');
    };

    const resultado = categorias.map(cat => ({
      id: cat.id!,
      displayNombre: obtenerNombreCompleto(cat)
    }));

    resultado.sort((a, b) => a.displayNombre.localeCompare(b.displayNombre));
    return resultado;
  }

  cargarEtiquetas(): void {
    this.etiquetaService.getAll().subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.etiquetasDisponibles.set(ordenados);
      },
    });
  }

  limpiarCampos(): void {
    this.titulo.set('');
    this.autorId.set('');
    this.tipoId.set('');
    this.version.set(null);
    this.descripcion.set('');
    this.estadoSincronizacion.set('');
    this.categoriaId.set('');
    this.etiquetaId.set('');
    this.fechaCreacion.set('');
    this.fechaModificacion.set('');
  }

  volver(): void {
    this.router.navigate(['/recursos']);
  }

  onSubmit(): void {
    const filtros: any = {};

    if (this.titulo()) filtros.titulo = this.titulo();

    if (this.autorId()) filtros.autores = [this.autorId()];

    if (this.tipoId()) filtros.tipo = this.tipoId();

    if (this.version() !== null) filtros.version = this.version();

    if (this.descripcion()) filtros.descripcion = this.descripcion();

    if (this.estadoSincronizacion()) filtros.estadoSincronizacion = this.estadoSincronizacion();

    if (this.categoriaId()) filtros.categorias = [this.categoriaId()];

    if (this.etiquetaId()) filtros.etiquetas = [this.etiquetaId()];

    if (this.fechaCreacion()) {
      filtros.fechaCreacion = this.fechaCreacion() + 'T00:00:00';
    }

    if (this.fechaModificacion()) {
      filtros.fechaModificacion = this.fechaModificacion() + 'T00:00:00';
    }

    this.router.navigate(['/busqueda/resultados'], {
      queryParams: { filtros: JSON.stringify(filtros) }
    });
  }

}
