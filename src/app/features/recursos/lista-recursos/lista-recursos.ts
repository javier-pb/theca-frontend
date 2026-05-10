import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';

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
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los recursos');
        this.loading.set(false);
      }
    });
  }

  getPortadaUrl(portada: string): string {
    if (!portada) return '';
    if (portada.startsWith('http')) return portada;
    return 'data:image/jpeg;base64,' + portada;
  }

}
