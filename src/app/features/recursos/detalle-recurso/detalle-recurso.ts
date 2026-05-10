import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecursoService } from '../../../core/services/recurso';

@Component({
  selector: 'app-detalle-recurso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-recurso.html',
  styleUrls: ['./detalle-recurso.css']
})
// Componente para el detalle del recurso:
export class DetalleRecursoComponent implements OnInit {
  recurso = signal<any>(null);
  loading = signal(true);
  error = signal('');
  mostrarModal = signal(false);
  actualizandoPortada = signal(false);

  constructor(
    private recursoService: RecursoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarRecurso(id);
    } else {
      this.error.set('ID de recurso no encontrado');
      this.loading.set(false);
    }
  }

  cargarRecurso(id: string): void {
    this.loading.set(true);
    this.error.set('');

    this.recursoService.getById(id).subscribe({
      next: (data) => {
        this.recurso.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el recurso');
        this.loading.set(false);
      }
    });
  }

  getPortadaUrl(portada: string): string {
    if (!portada) return '';
    if (portada.startsWith('http') || portada.startsWith('data:')) {
      return portada;
    }
    return 'data:image/jpeg;base64,' + portada;
  }

  abrirSelectorArchivo(): void {
    const input = document.getElementById('portadaInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onPortadaSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.actualizarPortada(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  actualizarPortada(portadaBase64: string): void {
    this.actualizandoPortada.set(true);

    let portadaFinal = portadaBase64;
    if (portadaFinal && portadaFinal.includes(',')) {
      portadaFinal = portadaFinal.split(',')[1];
    }

    const recursoActualizado = {
      ...this.recurso(),
      portada: portadaFinal
    };

    this.recursoService.update(this.recurso().id, recursoActualizado).subscribe({
      next: (response) => {
        this.recurso.set(response);
        this.actualizandoPortada.set(false);
      },
      error: () => {
        this.error.set('Error al actualizar la portada');
        this.actualizandoPortada.set(false);
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
    const id = this.recurso()?.id;
    if (!id) return;

    this.loading.set(true);
    this.recursoService.delete(id).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/recursos']);
      },
      error: () => {
        this.error.set('Error al eliminar el recurso');
        this.loading.set(false);
        this.mostrarModal.set(false);
      }
    });
  }

  formatearFechaLocal(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);

    return localDate.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

}
