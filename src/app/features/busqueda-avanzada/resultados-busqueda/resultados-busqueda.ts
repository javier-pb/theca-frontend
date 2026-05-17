import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
import { AutorService, Autor } from '../../../core/services/autor';
import { TipoService, Tipo } from '../../../core/services/tipo';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { EtiquetaService, Etiqueta } from '../../../core/services/etiqueta';

@Component({
  selector: 'app-resultados-busqueda',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resultados-busqueda.html',
  styleUrls: ['./resultados-busqueda.css']
})
// Componente para los resultados de la búsqueda:
export class ResultadosBusquedaComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private recursoService = inject(RecursoService);
  private authService = inject(AuthService);
  private autorService = inject(AutorService);
  private tipoService = inject(TipoService);
  private categoriaService = inject(CategoriaService);
  private etiquetaService = inject(EtiquetaService);

  recursos = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  filtrosAplicados = signal<any>({});

  tiposDisponibles = signal<Tipo[]>([]);
  categoriasDisponibles = signal<Categoria[]>([]);
  etiquetasDisponibles = signal<Etiqueta[]>([]);
  autoresDisponibles = signal<Autor[]>([]);
  mapaTipos = new Map(); // Para mapear tipos

  ngOnInit(): void {
    this.cargarTipos();
    this.cargarCategorias();
    this.cargarEtiquetas();
    this.cargarAutores();

    let filtros: any = {};

    this.route.queryParams.subscribe(params => {
      if (params['filtros']) {
        try {
          filtros = JSON.parse(params['filtros']);
        } catch (e) {}
      }
    });

    const navigation = this.router.getCurrentNavigation();
    const stateFiltros = navigation?.extras?.state?.['filtros'];

    if (stateFiltros && Object.keys(stateFiltros).length > 0) {
      filtros = stateFiltros;
    }

    if (Object.keys(filtros).length === 0) {
      this.error.set('No se especificaron criterios de búsqueda');
      this.loading.set(false);
    } else {
      this.filtrosAplicados.set(filtros);
      this.realizarBusqueda(filtros);
    }
  }

  cargarTipos(): void {
    this.tipoService.getAll().subscribe({
      next: (data) => {
        this.tiposDisponibles.set(data);
        data.forEach(tipo => {
          this.mapaTipos.set(tipo.id, tipo);
        });
      },
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => this.categoriasDisponibles.set(data),
    });
  }

  cargarEtiquetas(): void {
    this.etiquetaService.getAll().subscribe({
      next: (data) => this.etiquetasDisponibles.set(data),
    });
  }

  cargarAutores(): void {
    this.autorService.getAll().subscribe({
      next: (data) => this.autoresDisponibles.set(data),
    });
  }

  realizarBusqueda(filtros: any): void {
    this.loading.set(true);
    this.error.set('');

    const userId = this.authService.getUserId();

    this.recursoService.search(filtros, userId || undefined).subscribe({
      next: async (data) => {
        const recursosConDatos = await Promise.all(data.map(async (recurso) => {
          let autoresList: string[] = [];

          if (recurso.autores && Array.isArray(recurso.autores) && recurso.autores.length > 0) {
            if (recurso.autores[0]?.nombre && recurso.autores[0].nombre !== null) {
              autoresList = recurso.autores.map((autor: any) => autor.nombre);
            } else {
              const autorIds = recurso.autores.map((a: any) => a.id || a._id);

              for (const id of autorIds) {
                if (id) {
                  try {
                    const autor = await this.autorService.getById(id).toPromise();
                    if (autor && autor.nombre) {
                      autoresList.push(autor.nombre);
                    }
                  } catch (e) {}
                }
              }
            }
          }

          let imagenPortada = '';
          if (recurso.portada) {
            imagenPortada = recurso.portada;
          } else {
            const tipoId = recurso.tipos?.[0]?.id || recurso.tipo?.id;
            if (tipoId && this.mapaTipos.has(tipoId)) {
              const tipo = this.mapaTipos.get(tipoId);
              if (tipo.esPredeterminado) {
                const imagenPorNombre: { [key: string]: string } = {
                  'PDF': 'PDF.png',
                  'Hoja de cálculo': 'Hoja de cálculo.png',
                  'Documento': 'Documento.png',
                  'Enlace': 'Enlace.png',
                  'ePub': 'ePub.png'
                };
                const nombreArchivo = imagenPorNombre[tipo.nombre];
                if (nombreArchivo) {
                  imagenPortada = `assets/images/${nombreArchivo}`;
                }
              }
            }
          }

          return {
            ...recurso,
            autoresList: autoresList,
            imagenPortada: imagenPortada
          };
        }));

        const recursosOrdenados = this.ordenarPorFechaModificacion(recursosConDatos);
        this.recursos.set(recursosOrdenados);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al realizar la búsqueda');
        this.loading.set(false);
      }
    });
  }

  ordenarPorFechaModificacion(recursos: any[]): any[] {
    return [...recursos].sort((a, b) => {
      const fechaA = a.fechaModificacion ? new Date(a.fechaModificacion).getTime() : 0;
      const fechaB = b.fechaModificacion ? new Date(b.fechaModificacion).getTime() : 0;
      return fechaB - fechaA;
    });
  }

  volverABuscar(): void {
    this.router.navigate(['/busqueda-avanzada']);
  }

  verDetalle(recursoId: string): void {
    this.router.navigate(['/recursos/detalle', recursoId]);
  }

  getPortadaUrl(portada: string): string {
    if (!portada) return '';
    if (portada.startsWith('http') || portada.startsWith('assets/') || portada.startsWith('data:')) {
      return portada;
    }
    return 'data:image/jpeg;base64,' + portada;
  }
}
