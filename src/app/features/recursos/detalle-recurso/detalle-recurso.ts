import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecursoService } from '../../../core/services/recurso';

@Component({
  selector: 'app-detalle-recurso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-recurso.html',
  styleUrls: ['./detalle-recurso.css']
})
// Componente para el detalle de un recurso:
export class DetalleRecursoComponent implements OnInit {
  recurso = signal<any>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private recursoService: RecursoService,
    private route: ActivatedRoute
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

}
