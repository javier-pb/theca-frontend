import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutorService, Autor } from '../../../core/services/autor';
import { RecursoService } from '../../../core/services/recurso';

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
  private recursoService = inject(RecursoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  autor = signal<Autor | null>(null);
  recursos = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  mostrarModal = signal(false);
  esAnonimo = signal(false);

  private routeSubscription?: Subscription;

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id === 'anonimo') {
        this.cargarAnonimo();
      } else if (id) {
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

  cargarAnonimo(): void {
    this.esAnonimo.set(true);
    this.autor.set({ id: 'anonimo', nombre: 'Anónimo' } as Autor);
    this.cargarRecursosSinAutor();
    this.loading.set(false);
  }

  cargarRecursosSinAutor(): void {
    this.recursoService.getAll().subscribe({
      next: (recursos) => {
        const filtrados = recursos.filter(recurso =>
          !recurso.autores || recurso.autores.length === 0
        );
        this.recursos.set(filtrados);
      },
      error: () => {
        console.error('Error al cargar recursos sin autor');
        this.recursos.set([]);
      }
    });
  }

  cargarAutor(id: string): void {
    this.loading.set(true);
    this.error.set('');
    this.esAnonimo.set(false);

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

  irADetalleRecurso(id: string): void {
    this.router.navigate(['/recursos/detalle', id]);
  }

  confirmarEliminar(): void {
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  eliminar(): void {
    const id = this.autor()?.id;
    if (!id || id === 'anonimo') return;

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
