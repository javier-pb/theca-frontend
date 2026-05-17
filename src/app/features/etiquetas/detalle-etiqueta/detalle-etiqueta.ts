import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { EtiquetaService, Etiqueta } from '../../../core/services/etiqueta';
import { RecursoService } from '../../../core/services/recurso';
import { ModalEtiquetaComponent } from '../modal-etiqueta/modal-etiqueta';

@Component({
  selector: 'app-detalle-etiqueta',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalEtiquetaComponent],
  templateUrl: './detalle-etiqueta.html',
  styleUrls: ['./detalle-etiqueta.css']
})
// Componente para el detalle de una etiqueta:
export class DetalleEtiquetaComponent implements OnInit, OnDestroy {
  private etiquetaService = inject(EtiquetaService);
  private recursoService = inject(RecursoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  etiqueta = signal<Etiqueta | null>(null);
  recursos = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  mostrarModal = signal(false);
  modalModo = signal<'crear' | 'editar'>('editar');

  private routeSubscription?: Subscription;

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarEtiqueta(id);
      } else {
        this.error.set('ID de etiqueta no encontrado');
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  cargarEtiqueta(id: string): void {
    this.loading.set(true);
    this.error.set('');

    this.etiquetaService.getById(id).subscribe({
      next: (data) => {
        this.etiqueta.set(data);
        this.cargarRecursosAsociados(id);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la etiqueta');
        this.loading.set(false);
      }
    });
  }

  cargarRecursosAsociados(etiquetaId: string): void {
    this.recursoService.getAll().subscribe({
      next: (recursos) => {
        const filtrados = recursos.filter(recurso =>
          recurso.etiquetas && Array.isArray(recurso.etiquetas) &&
          recurso.etiquetas.some((e: any) => (e.id || e._id) === etiquetaId)
        );
        this.recursos.set(filtrados);
      },
      error: () => {
        console.error('Error al cargar recursos asociados');
        this.recursos.set([]);
      }
    });
  }

  abrirModalEditar(): void {
    this.modalModo.set('editar');
    this.showModal.set(true);
  }

  cerrarModal(): void {
    this.showModal.set(false);
  }

  onGuardado(): void {
    this.cerrarModal();
    if (this.etiqueta()?.id) {
      this.cargarEtiqueta(this.etiqueta()!.id!);
    }
  }

  confirmarEliminar(): void {
    this.mostrarModal.set(true);
  }

  cerrarModalEliminar(): void {
    this.mostrarModal.set(false);
  }

  eliminar(): void {
    const id = this.etiqueta()?.id;
    if (!id) return;

    this.loading.set(true);
    this.etiquetaService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/etiquetas']);
      },
      error: () => {
        this.error.set('Error al eliminar la etiqueta');
        this.loading.set(false);
        this.mostrarModal.set(false);
      }
    });
  }

  irADetalleRecurso(id: string): void {
    this.router.navigate(['/recursos/detalle', id]);
  }

}
