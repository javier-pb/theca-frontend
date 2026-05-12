import { Component, Input, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtiquetaService, Etiqueta } from '../../../core/services/etiqueta';

@Component({
  selector: 'app-modal-etiqueta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-etiqueta.html',
  styleUrls: ['./modal-etiqueta.css']
})
// Componente para el modal de etiqueta:
export class ModalEtiquetaComponent {

  private etiquetaService = inject(EtiquetaService);

  @Input() modo: 'crear' | 'editar' = 'crear';
  @Input() etiqueta: Etiqueta | null = null;

  cerrar = output<void>();
  guardado = output<void>();

  nombre = signal('');
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    if (this.modo === 'editar' && this.etiqueta) {
      this.nombre.set(this.etiqueta.nombre);
    }
  }

  onSubmit(): void {
    const nombreTrimmed = this.nombre().trim();

    if (!nombreTrimmed) {
      this.error.set('El nombre es obligatorio');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const operacion = this.modo === 'crear'
      ? this.etiquetaService.create({ nombre: nombreTrimmed })
      : this.etiquetaService.update(this.etiqueta!.id!, { nombre: nombreTrimmed });

    operacion.subscribe({
      next: () => {
        this.loading.set(false);
        this.guardado.emit();
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400 && err.error) {
          this.error.set(err.error);
        } else {
          this.error.set(`Error al ${this.modo === 'crear' ? 'crear' : 'actualizar'} la etiqueta`);
        }
      }
    });
  }

  cancelar(): void {
    this.cerrar.emit();
  }

}
