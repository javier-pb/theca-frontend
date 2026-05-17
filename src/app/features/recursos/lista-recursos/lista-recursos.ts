import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
import { AutorService } from '../../../core/services/autor';
import { BusquedaComponent } from '../../../shared/busqueda/busqueda';
import { TipoService } from '../../../core/services/tipo';

@Component({
  selector: 'app-lista-recursos',
  standalone: true,
  imports: [CommonModule, RouterModule, BusquedaComponent],
  templateUrl: './lista-recursos.html',
  styleUrls: ['./lista-recursos.css']
})
// Componente para la lista de recursos:
export class ListaRecursosComponent implements OnInit {

  recursos = signal<any[]>([]);
  recursosFiltrados = signal<any[]>([]);
  terminoBusqueda = signal('');
  loading = signal(true);
  error = signal('');

  constructor(
    private recursoService: RecursoService,
    private autorService: AutorService,
    private authService: AuthService,
    private router: Router,
    private tipoService: TipoService
  ) {}

  ngOnInit(): void {
    this.cargarRecursos();
  }

  cargarRecursos(): void {
    this.loading.set(true);
    this.error.set('');

    const userId = this.authService.getUserId();

    this.tipoService.getAll().subscribe({
      next: (tipos) => {
        const mapaTipos = new Map();
        tipos.forEach(tipo => {
          mapaTipos.set(tipo.id, tipo);
        });

        this.recursoService.getAll(userId ?? undefined).subscribe({
          next: async (data) => {
            if (!data || !Array.isArray(data)) {
              this.recursos.set([]);
              this.filtrarRecursos();
              this.loading.set(false);
              return;
            }

            const recursosConAutores = await Promise.all(data.map(async (recurso) => {
              let autoresList: string[] = [];

              if (recurso.autores && Array.isArray(recurso.autores) && recurso.autores.length > 0) {
                if (recurso.autores[0]?.nombre && recurso.autores[0].nombre !== null) {
                  autoresList = recurso.autores.map((autor: any) => autor.nombre);
                } else {
                  const autorIds = recurso.autores.map((a: any) => a.id || a._id);

                  for (const id of autorIds) {
                    if (id) {
                      try {
                        const autor = await firstValueFrom(this.autorService.getById(id));
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
                if (tipoId && mapaTipos.has(tipoId)) {
                  const tipo = mapaTipos.get(tipoId);

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
                    } else {
                      imagenPortada = 'assets/images/Tipo (azul).png';
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

            const recursosOrdenados = this.ordenarPorFechaModificacion(recursosConAutores);
            this.recursos.set(recursosOrdenados);
            this.filtrarRecursos();
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Error al cargar los recursos');
            this.loading.set(false);
          }
        });
      },
      error: () => {
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

  onBuscar(termino: string): void {
    this.terminoBusqueda.set(termino);
    this.filtrarRecursos();
  }

  filtrarRecursos(): void {
    const termino = this.terminoBusqueda().toLowerCase().trim();

    if (termino === '') {
      this.recursosFiltrados.set(this.recursos());
    } else {
      const filtrados = this.recursos().filter(recurso =>
        recurso.titulo.toLowerCase().includes(termino)
      );
      this.recursosFiltrados.set(filtrados);
    }
  }

  abrirBusquedaAvanzada(): void {
    this.router.navigate(['/busqueda-avanzada']);
  }

  getPortadaUrl(portada: string): string {
    if (!portada) return '';
    if (portada.startsWith('http') || portada.startsWith('assets/') || portada.startsWith('data:')) {
      return portada;
    }
    return 'data:image/jpeg;base64,' + portada;
  }

}
