import { Component, signal, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutorService } from '../../../core/services/autor';
import { CategoriaService } from '../../../core/services/categoria';
import { TipoService } from '../../../core/services/tipo';
import { EtiquetaService } from '../../../core/services/etiqueta';

export type TipoEntidad = 'autor' | 'categoria' | 'tipo' | 'etiqueta';

@Component({
  selector: 'app-modal-crear-entidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-crear-entidad.html',
  styleUrls: ['./modal-crear-entidad.css']
})
// Componente para los modales:
export class ModalCrearEntidadComponent {
  private autorService = inject(AutorService);
  private categoriaService = inject(CategoriaService);
  private tipoService = inject(TipoService);
  private etiquetaService = inject(EtiquetaService);

  tipo = input.required<TipoEntidad>();
  cerrarModal = output<void>();
  entidadCreada = output<any>();

  nombre = signal('');
  loading = signal(false);
  error = signal('');

  titulo(): string {
    switch (this.tipo()) {
      case 'autor': return 'autor';
      case 'categoria': return 'categoría';
      case 'tipo': return 'tipo';
      case 'etiqueta': return 'etiqueta';
      default: return 'entidad';
    }
  }

  private getArticulo(): string {
    switch (this.tipo()) {
      case 'autor': return 'el';
      case 'categoria': return 'la';
      case 'tipo': return 'el';
      case 'etiqueta': return 'la';
      default: return 'la';
    }
  }

  guardar(): void {
    const nombreTrim = this.nombre().trim();
    if (!nombreTrim) return;

    this.loading.set(true);
    this.error.set('');

    let servicio;
    switch (this.tipo()) {
      case 'autor':
        servicio = this.autorService.create({ nombre: nombreTrim });
        break;
      case 'categoria':
        servicio = this.categoriaService.create({ nombre: nombreTrim });
        break;
      case 'tipo':
        servicio = this.tipoService.create({ nombre: nombreTrim });
        break;
      case 'etiqueta':
        servicio = this.etiquetaService.create({ nombre: nombreTrim });
        break;
      default:
        return;
    }

    servicio.subscribe({
      next: (respuesta) => {
        this.loading.set(false);
        this.entidadCreada.emit(respuesta);
        this.cerrarModal.emit();
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400 && err.error) {
          this.error.set(err.error);
        } else {
          const articulo = this.getArticulo();
          this.error.set(`Error al crear ${articulo} ${this.titulo()}`);
        }
      }
    });
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }

}
