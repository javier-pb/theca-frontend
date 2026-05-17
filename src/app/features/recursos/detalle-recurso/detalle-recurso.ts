import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecursoService } from '../../../core/services/recurso';
import { AutorService } from '../../../core/services/autor';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { EtiquetaService } from '../../../core/services/etiqueta';
import { TipoService } from '../../../core/services/tipo';

interface CategoriaJerarquica {
  id: string;
  displayNombre: string;
  nivel: number;
  nombre: string;
  ancestros: string[];
  rutaCompleta: { id: string; nombre: string }[];
}

@Component({
  selector: 'app-detalle-recurso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-recurso.html',
  styleUrls: ['./detalle-recurso.css']
})
// Compponente para el detalle de un recurso:
export class DetalleRecursoComponent implements OnInit {

  recurso = signal<any>(null);
  loading = signal(true);
  error = signal('');
  mostrarModal = signal(false);
  actualizandoPortada = signal(false);

  tipoNombre = signal('');
  tipoId = signal('');

  autoresList = signal<any[]>([]);
  categoriasList = signal<CategoriaJerarquica[]>([]);
  etiquetasList = signal<any[]>([]);

  constructor(
    private recursoService: RecursoService,
    private autorService: AutorService,
    private categoriaService: CategoriaService,
    private etiquetaService: EtiquetaService,
    private tipoService: TipoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarRecurso(id);
    } else {
      this.error.set('ID de recurso no encontrado');
      this.loading.set(false);
    }
  }

  cargarRecurso(id: string): void {
    this.loading.set(true);
    this.error.set('');

    this.recursoService.getById(id).subscribe({
      next: (data) => {
        this.recurso.set(data);
        this.procesarAutores(data.autores);
        this.procesarTipo(data.tipos);
        this.procesarCategorias(data.categorias);
        this.procesarEtiquetas(data.etiquetas);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el recurso');
        this.loading.set(false);
      }
    });
  }

  procesarAutores(autores: any[]): void {
    if (!autores || autores.length === 0) {
      this.autoresList.set([]);
      return;
    }

    if (autores[0] && autores[0].nombre) {
      const ordenados = [...autores].sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.autoresList.set(ordenados);
    } else {
      const ids = autores.map((a: any) => a.id || a._id);
      const peticiones = ids.map((id: string) => this.autorService.getById(id).toPromise().catch(() => null));

      Promise.all(peticiones).then((resultados: any[]) => {
        const autoresValidos = resultados.filter(autor => autor !== null);
        const ordenados = autoresValidos.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.autoresList.set(ordenados);
      }).catch(() => {
        this.autoresList.set([]);
      });
    }
  }

  procesarTipo(tipos: any[]): void {
    if (!tipos || tipos.length === 0) {
      this.tipoNombre.set('');
      this.tipoId.set('');
      return;
    }

    const tipo = tipos[0];
    if (tipo && tipo.nombre) {
      this.tipoNombre.set(tipo.nombre);
      this.tipoId.set(tipo.id || tipo._id);
    } else if (tipo && tipo.id) {
      this.tipoService.getById(tipo.id).toPromise().catch(() => null).then((data: any) => {
        if (data) {
          this.tipoNombre.set(data.nombre);
          this.tipoId.set(data.id);
        } else {
          this.tipoNombre.set('');
          this.tipoId.set('');
        }
      });
    }
  }

  procesarCategorias(categorias: any[]): void {
    if (!categorias || categorias.length === 0) {
      this.categoriasList.set([]);
      return;
    }

    this.categoriaService.getAll().subscribe({
      next: (todasCategorias) => {
        const mapaCategorias = new Map<string, any>();
        for (const cat of todasCategorias) {
          mapaCategorias.set(cat.id!, cat);
        }

        const ids = categorias.map((c: any) => c.id || c._id);
        const resultadoTemp: CategoriaJerarquica[] = [];

        for (const id of ids) {
          const categoria = mapaCategorias.get(id);
          if (categoria) {
            const { displayNombre, nivel, ancestros, rutaCompleta } = this.obtenerNombreJerarquicoConRuta(categoria, mapaCategorias);
            resultadoTemp.push({
              id,
              displayNombre,
              nivel,
              nombre: categoria.nombre,
              ancestros,
              rutaCompleta
            });
          }
        }

        const categoriasFiltradas = resultadoTemp.filter(cat => {
          const esAncestroDeOtra = resultadoTemp.some(otra =>
            otra.id !== cat.id && otra.ancestros.includes(cat.id)
          );
          return !esAncestroDeOtra;
        });

        categoriasFiltradas.sort((a, b) => a.displayNombre.localeCompare(b.displayNombre));
        this.categoriasList.set(categoriasFiltradas);
      },
      error: () => {
        const simple = categorias.map((c: any) => ({
          id: c.id || c._id,
          displayNombre: c.nombre || '',
          nivel: 0,
          nombre: c.nombre || '',
          ancestros: [],
          rutaCompleta: [{ id: c.id || c._id, nombre: c.nombre || '' }]
        }));
        simple.sort((a, b) => a.displayNombre.localeCompare(b.displayNombre));
        this.categoriasList.set(simple);
      }
    });
  }

  obtenerNombreJerarquicoConRuta(categoria: any, mapaCategorias: Map<string, any>): {
    displayNombre: string;
    nivel: number;
    ancestros: string[];
    rutaCompleta: { id: string; nombre: string }[];
  } {
    const ruta: { id: string; nombre: string }[] = [{ id: categoria.id, nombre: categoria.nombre }];
    const ancestros: string[] = [];
    let actual = categoria;
    let nivel = 0;
    let contador = 0;
    const maxIteraciones = 100;

    while (actual.categoriaPadreId && contador < maxIteraciones) {
      const padre = mapaCategorias.get(actual.categoriaPadreId);
      if (!padre) break;
      ruta.unshift({ id: padre.id, nombre: padre.nombre });
      ancestros.push(padre.id);
      actual = padre;
      nivel++;
      contador++;
    }

    const displayNombre = ruta.map(p => p.nombre).join(' > ');

    return {
      displayNombre: displayNombre,
      nivel: nivel,
      ancestros: ancestros,
      rutaCompleta: ruta
    };
  }

  procesarEtiquetas(etiquetas: any[]): void {
    if (!etiquetas || etiquetas.length === 0) {
      this.etiquetasList.set([]);
      return;
    }

    if (etiquetas[0] && etiquetas[0].nombre) {
      const ordenados = [...etiquetas].sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.etiquetasList.set(ordenados);
    } else {
      const ids = etiquetas.map((e: any) => e.id || e._id);
      const peticiones = ids.map((id: string) => this.etiquetaService.getById(id).toPromise().catch(() => null));

      Promise.all(peticiones).then((resultados: any[]) => {
        const etiquetasValidas = resultados.filter(etiqueta => etiqueta !== null);
        const ordenados = etiquetasValidas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.etiquetasList.set(ordenados);
      }).catch(() => {
        this.etiquetasList.set([]);
      });
    }
  }

  getPortadaUrl(portada: string): string {
    if (!portada) return '';
    if (portada.startsWith('http') || portada.startsWith('data:')) {
      return portada;
    }
    return 'data:image/jpeg;base64,' + portada;
  }

  abrirSelectorArchivo(): void {
    const input = document.getElementById('portadaInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onPortadaSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.actualizarPortada(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  actualizarPortada(portadaBase64: string): void {
    this.actualizandoPortada.set(true);

    let portadaFinal = portadaBase64;
    if (portadaFinal && portadaFinal.includes(',')) {
      portadaFinal = portadaFinal.split(',')[1];
    }

    const recursoActualizado = {
      ...this.recurso(),
      portada: portadaFinal
    };

    this.recursoService.update(this.recurso().id, recursoActualizado).subscribe({
      next: (response) => {
        this.recurso.set(response);
        this.actualizandoPortada.set(false);
      },
      error: () => {
        this.error.set('Error al actualizar la portada');
        this.actualizandoPortada.set(false);
      }
    });
  }

  irADetalleAutor(id: string): void {
    this.router.navigate(['/autores/detalle', id]);
  }

  irADetalleCategoria(id: string): void {
    this.router.navigate(['/categorias/detalle', id]);
  }

  irADetalleEtiqueta(id: string): void {
    this.router.navigate(['/etiquetas/detalle', id]);
  }

  irADetalleTipo(id: string): void {
    this.router.navigate(['/tipos/detalle', id]);
  }

  confirmarEliminar(): void {
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  eliminar(): void {
    const id = this.recurso()?.id;
    if (!id) return;

    this.loading.set(true);
    this.recursoService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/recursos']);
      },
      error: () => {
        this.error.set('Error al eliminar el recurso');
        this.loading.set(false);
        this.mostrarModal.set(false);
      }
    });
  }

  formatearFechaLocal(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);

    return localDate.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

}
