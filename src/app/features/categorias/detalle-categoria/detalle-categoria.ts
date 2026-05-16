import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { RecursoService } from '../../../core/services/recurso';

@Component({
  selector: 'app-detalle-categoria',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-categoria.html',
  styleUrls: ['./detalle-categoria.css']
})
// Componente para el detalle de una categoría:
export class DetalleCategoriaComponent implements OnInit, OnDestroy {
  private categoriaService = inject(CategoriaService);
  private recursoService = inject(RecursoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categoria = signal<Categoria | null>(null);
  subcategorias = signal<Categoria[]>([]);
  recursosAsociados = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  mostrarModal = signal(false);

  private routeSubscription?: Subscription;

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarCategoria(id);
      } else {
        this.error.set('ID de categoría no encontrado');
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  cargarCategoria(id: string): void {
    this.loading.set(true);
    this.error.set('');

    this.categoriaService.getById(id).subscribe({
      next: (data) => {
        this.categoria.set(data);
        this.cargarSubcategorias(id);
        this.cargarRecursosAsociados(id);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la categoría');
        this.loading.set(false);
      }
    });
  }

  cargarSubcategorias(categoriaId: string): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        const hijos = data.filter(c => c.categoriaPadreId === categoriaId);
        hijos.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.subcategorias.set(hijos);
      },
      error: () => {
        console.error('Error al cargar subcategorías');
      }
    });
  }

  cargarRecursosAsociados(categoriaId: string): void {
    this.recursoService.getAll().subscribe({
      next: (recursos) => {
        const filtrados = recursos.filter(recurso =>
          recurso.categorias && Array.isArray(recurso.categorias) &&
          recurso.categorias.some((c: any) => (c.id || c._id) === categoriaId)
        );
        this.recursosAsociados.set(filtrados);
      },
      error: () => {
        console.error('Error al cargar recursos asociados');
        this.recursosAsociados.set([]);
      }
    });
  }

  irADetalle(id: string): void {
    this.router.navigate(['/categorias/detalle', id]);
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
    const id = this.categoria()?.id;
    if (!id) return;

    this.loading.set(true);
    this.categoriaService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/categorias']);
      },
      error: () => {
        this.error.set('Error al eliminar la categoría');
        this.loading.set(false);
        this.mostrarModal.set(false);
      }
    });
  }
}
