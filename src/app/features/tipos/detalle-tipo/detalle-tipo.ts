import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TipoService, Tipo } from '../../../core/services/tipo';

@Component({
  selector: 'app-detalle-tipo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-tipo.html',
  styleUrls: ['./detalle-tipo.css']
})
// Componente para el detalle de un tipo:
export class DetalleTipoComponent implements OnInit, OnDestroy {

  private tipoService = inject(TipoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tipo = signal<Tipo | null>(null);
  recursos = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  mostrarModal = signal(false);

  private routeSubscription?: Subscription;

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarTipo(id);
      } else {
        this.error.set('ID de tipo no encontrado');
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  cargarTipo(id: string): void {
    this.loading.set(true);
    this.error.set('');

    this.tipoService.getById(id).subscribe({
      next: (data) => {
        this.tipo.set(data);
        this.cargarRecursos(id);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el tipo');
        this.loading.set(false);
      }
    });
  }

  cargarRecursos(id: string): void {
    this.tipoService.getRecursosAsociados(id).subscribe({
      next: (data) => {
        this.recursos.set(data);
      },
      error: () => {
        console.error('Error al cargar recursos asociados');
        this.recursos.set([]);
      }
    });
  }

  getImagenUrl(tipo: Tipo | null): string {
    if (!tipo) return '';

    if (tipo.imagen) {
      if (tipo.imagen.startsWith('http') || tipo.imagen.startsWith('data:')) {
        return tipo.imagen;
      }
      return 'data:image/jpeg;base64,' + tipo.imagen;
    }

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
        return `assets/images/${nombreArchivo}`;
      }

      const nombreNormalizado = tipo.nombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s/g, '');
      return `assets/images/${nombreNormalizado}.png`;
    }

    return '';
  }

  confirmarEliminar(): void {
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  eliminar(): void {
    const id = this.tipo()?.id;
    if (!id) return;

    this.loading.set(true);
    this.tipoService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/tipos']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400 && err.error) {
          this.error.set(err.error);
        } else {
          this.error.set('Error al eliminar el tipo');
        }
        this.mostrarModal.set(false);
      }
    });
  }

}
