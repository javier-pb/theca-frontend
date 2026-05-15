import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AutorService } from '../../../core/services/autor';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-formulario-autor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './formulario-autor.html',
  styleUrls: ['./formulario-autor.css']
})
// Componente para el formulario de autores:
export class FormularioAutorComponent implements OnInit {

  private autorService = inject(AutorService);
  private recursoService = inject(RecursoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  esEdicion = signal(false);
  autorId = signal<string | null>(null);
  nombre = signal('');
  recursosSeleccionados = signal<string[]>([]);
  recursosDisponibles = signal<{ id: string; titulo: string }[]>([]);
  terminoBusquedaRecursos = signal('');
  loading = signal(false);
  error = signal('');
  buscando = signal(false);

  ngOnInit(): void {
    this.cargarRecursosDisponibles();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.autorId.set(id);
      this.esEdicion.set(true);
      this.cargarAutor();
    }
  }

  cargarRecursosDisponibles(): void {
    const userId = this.authService.getUserId();

    this.recursoService.getAll(userId ?? undefined).subscribe({
      next: (data) => {
        this.recursosDisponibles.set(data.map(r => ({ id: r.id, titulo: r.titulo })));
      },
      error: () => {
        console.error('Error al cargar recursos');
      }
    });
  }

  buscarRecursos(): void {
    const termino = this.terminoBusquedaRecursos().trim();
    if (!termino) {
      this.cargarRecursosDisponibles();
      return;
    }

    this.buscando.set(true);

    const filtros = {
      titulo: termino
    };

    this.recursoService.search(filtros).subscribe({
      next: (data) => {
        this.recursosDisponibles.set(data.map(r => ({ id: r.id, titulo: r.titulo })));
        this.buscando.set(false);
      },
      error: () => {
        console.error('Error en la búsqueda');
        this.buscando.set(false);
      }
    });
  }

  onEnterBusqueda(event: Event): void {
    event.preventDefault();
    this.buscarRecursos();
  }

  cargarAutor(): void {
    this.loading.set(true);
    this.error.set('');

    this.autorService.getById(this.autorId()!).subscribe({
      next: (data) => {
        this.nombre.set(data.nombre);
        this.cargarRecursosAsociados();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el autor');
        this.loading.set(false);
      }
    });
  }

  cargarRecursosAsociados(): void {
    this.autorService.getRecursosAsociados(this.autorId()!).subscribe({
      next: (recursos) => {
        this.recursosSeleccionados.set(recursos.map(r => r.id));
      },
      error: () => {
        console.error('Error al cargar recursos asociados');
      }
    });
  }

  toggleRecurso(recursoId: string): void {
    const actuales = this.recursosSeleccionados();
    if (actuales.includes(recursoId)) {
      this.recursosSeleccionados.set(actuales.filter(id => id !== recursoId));
    } else {
      this.recursosSeleccionados.set([...actuales, recursoId]);
    }
  }

  onSubmit(): void {
    if (!this.nombre().trim()) {
      this.error.set('El nombre es obligatorio');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const data: any = { nombre: this.nombre() };

    const operacion = this.esEdicion()
      ? this.autorService.update(this.autorId()!, data)
      : this.autorService.create(data);

    operacion.subscribe({
      next: (response) => {
        const autorId = response.id || this.autorId();

        if (autorId) {
          this.autorService.getRecursosAsociados(autorId).subscribe({
            next: (actuales) => {
              const idsActuales = actuales.map(r => r.id);
              const idsParaDesasociar = idsActuales.filter(id => !this.recursosSeleccionados().includes(id));
              const idsParaAsociar = this.recursosSeleccionados().filter(id => !idsActuales.includes(id));

              if (idsParaDesasociar.length > 0) {
                this.autorService.desasociarRecursos(autorId, idsParaDesasociar).subscribe();
              }

              if (idsParaAsociar.length > 0) {
                this.autorService.asociarRecursos(autorId, idsParaAsociar).subscribe();
              }
            }
          });
        }

        this.router.navigate(['/autores']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400 && err.error) {
          this.error.set(err.error);
        } else {
          this.error.set(err.error?.message || `Error al ${this.esEdicion() ? 'actualizar' : 'crear'} el autor`);
        }
      }
    });
  }

}
