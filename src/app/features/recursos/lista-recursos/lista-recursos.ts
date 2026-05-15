import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
import { AutorService } from '../../../core/services/autor';
import { BusquedaComponent } from '../../../shared/busqueda/busqueda';

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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarRecursos();
  }

  cargarRecursos(): void {
    this.loading.set(true);
    this.error.set('');

    const userId = this.authService.getUserId();

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
            const autorIds = recurso.autores.map((a: any) => a.id || a._id);

            for (const id of autorIds) {
              if (id) {
                try {
                  const autor = await this.autorService.getById(id).toPromise();
                  if (autor && autor.nombre) {
                    autoresList.push(autor.nombre);
                  }
                } catch (e) {
                  console.error(`Error cargando autor ${id}:`, e);
                }
              }
            }
          }

          return {
            ...recurso,
            autoresList: autoresList
          };
        }));

        this.recursos.set(recursosConAutores);
        this.filtrarRecursos();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar recursos:', err);
        this.error.set('Error al cargar los recursos');
        this.loading.set(false);
      }
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
    console.log('Búsqueda avanzada - Pendiente');
  }

  getPortadaUrl(portada: string): string {
    if (!portada) return '';
    if (portada.startsWith('http')) return portada;
    return 'data:image/jpeg;base64,' + portada;
  }

}
