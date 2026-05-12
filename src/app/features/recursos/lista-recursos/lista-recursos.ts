import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
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
  mostrarModal = signal(false);
  recursoAEliminar = signal<any>(null);

  constructor(
    private recursoService: RecursoService,
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
      next: (data) => {
        this.recursos.set(data);
        this.filtrarRecursos();
        this.loading.set(false);
      },
      error: () => {
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
        recurso.titulo.toLowerCase().includes(termino) ||
        (recurso.autor && recurso.autor.toLowerCase().includes(termino))
      );
      this.recursosFiltrados.set(filtrados);
    }
  }

  abrirBusquedaAvanzada(): void {
    // TODO: Implementar búsqueda avanzada
    console.log('Búsqueda avanzada - Pendiente');
  }

  getPortadaUrl(portada: string): string {
    if (!portada) return '';
    if (portada.startsWith('http')) return portada;
    return 'data:image/jpeg;base64,' + portada;
  }

}
