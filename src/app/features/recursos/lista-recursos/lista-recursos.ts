import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecursoService } from '../../../core/services/recurso';

@Component({
  selector: 'app-lista-recursos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-recursos.html',
  styleUrls: ['./lista-recursos.css']
})
// Componente para mostrar la lista de recursos:
export class ListaRecursosComponent implements OnInit {

  recursos = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  mostrarModal = signal(false);
  recursoAEliminar = signal<any>(null);

  constructor(private recursoService: RecursoService) {}

  ngOnInit(): void {
    this.cargarRecursos();
  }

  cargarRecursos(): void {
    this.loading.set(true);
    this.error.set('');

    this.recursoService.getAll().subscribe({
      next: (data) => {
        this.recursos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los recursos');
        this.loading.set(false);
      }
    });
  }

  confirmarEliminar(recurso: any): void {
    this.recursoAEliminar.set(recurso);
    this.mostrarModal.set(true);
  }

  eliminar(): void {
    if (this.recursoAEliminar()) {
      this.recursoService.delete(this.recursoAEliminar().id).subscribe({
        next: () => {
          this.cargarRecursos();
          this.cerrarModal();
        },
        error: () => {
          this.error.set('Error al eliminar el recurso');
          this.cerrarModal();
        }
      });
    }
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.recursoAEliminar.set(null);
  }

}
