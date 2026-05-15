import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutorService, Autor } from '../../../core/services/autor';

@Component({
  selector: 'app-detalle-autor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-autor.html',
  styleUrls: ['./detalle-autor.css']
})
// Componente para el detalle de un autor:
export class DetalleAutorComponent implements OnInit, OnDestroy {

  private autorService = inject(AutorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  autor = signal<Autor | null>(null);
  recursos = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  mostrarModal = signal(false);

  private routeSubscription?: Subscription;

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarAutor(id);
      } else {
        this.error.set('ID de autor no encontrado');
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  cargarAutor(id: string): void {
    this.loading.set(true);
    this.error.set('');

    this.autorService.getById(id).subscribe({
      next: (data) => {
        this.autor.set(data);
        this.cargarRecursos(id);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el autor');
        this.loading.set(false);
      }
    });
  }

  cargarRecursos(id: string): void {
    this.autorService.getRecursosAsociados(id).subscribe({
      next: (data) => {
        this.recursos.set(data);
      },
      error: () => {
        console.error('Error al cargar recursos asociados');
        this.recursos.set([]);
      }
    });
  }

  confirmarEliminar(): void {
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  eliminar(): void {
    const id = this.autor()?.id;
    if (!id) return;

    this.loading.set(true);
    this.autorService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/autores']);
      },
      error: () => {
        this.error.set('Error al eliminar el autor');
        this.loading.set(false);
        this.mostrarModal.set(false);
      }
    });
  }

}
