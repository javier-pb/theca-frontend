import { Component, OnInit, signal, inject, OnDestroy, HostListener } from '@angular/core';
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
// Componente para el formulario del autor:
export class FormularioAutorComponent implements OnInit, OnDestroy {

  private autorService = inject(AutorService);
  private recursoService = inject(RecursoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  esEdicion = signal(false);
  autorId = signal<string | null>(null);
  nombre = signal('');
  recursosSeleccionados = signal<string[]>([]);
  recursosSeleccionadosTexto = signal('');
  recursosDisponibles = signal<{ id: string; titulo: string }[]>([]);
  loading = signal(false);
  error = signal('');

  recursosDropdownOpen = signal(false);
  recursosDropdownPosition = signal<'bottom' | 'top'>('bottom');

  returnToRecurso = signal(false);
  recursoIdRetorno = signal<string | null>(null);

  ngOnInit(): void {
    this.returnToRecurso.set(localStorage.getItem('returnToRecurso') === 'true');
    const savedRecursoId = localStorage.getItem('recursoId');
    if (savedRecursoId) {
      this.recursoIdRetorno.set(savedRecursoId);
    }

    this.cargarRecursosDisponibles();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.autorId.set(id);
      this.esEdicion.set(true);
      this.cargarAutor();
    }
  }

  ngOnDestroy(): void {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.recursosDropdownOpen.set(false);
    }
  }

  cargarRecursosDisponibles(): void {
    const userId = this.authService.getUserId();
    this.recursoService.getAll(userId ?? undefined).subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) => a.titulo.localeCompare(b.titulo));
        this.recursosDisponibles.set(ordenados.map(r => ({ id: r.id, titulo: r.titulo })));
      },
      error: () => {
        console.error('Error al cargar recursos');
      }
    });
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
        const ids = recursos.map(r => r.id);
        this.recursosSeleccionados.set(ids);
        this.actualizarTextoSeleccionados();
      },
      error: () => {
        console.error('Error al cargar recursos asociados');
      }
    });
  }

  actualizarTextoSeleccionados(): void {
    const seleccionados = this.recursosDisponibles().filter(r =>
      this.recursosSeleccionados().includes(r.id)
    );
    const texto = seleccionados.map(r => r.titulo).join(', ');
    this.recursosSeleccionadosTexto.set(texto || '');
  }

  toggleRecursosDropdown(): void {
    this.recursosDropdownOpen.set(!this.recursosDropdownOpen());
    if (this.recursosDropdownOpen()) {
      setTimeout(() => this.checkDropdownPosition(), 5);
    }
  }

  toggleRecurso(recursoId: string): void {
    const actuales = this.recursosSeleccionados();
    if (actuales.includes(recursoId)) {
      this.recursosSeleccionados.set(actuales.filter(id => id !== recursoId));
    } else {
      this.recursosSeleccionados.set([...actuales, recursoId]);
    }
    this.actualizarTextoSeleccionados();
  }

  checkDropdownPosition(): void {
    setTimeout(() => {
      const dropdown = document.querySelector('.custom-dropdown') as HTMLElement;
      const menu = dropdown?.querySelector('.dropdown-menu') as HTMLElement;
      const trigger = dropdown?.querySelector('.dropdown-trigger') as HTMLElement;

      if (menu && trigger) {
        const triggerRect = trigger.getBoundingClientRect();
        const menuHeight = menu.scrollHeight;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        const shouldShowAbove = (spaceBelow < menuHeight + 20) && (spaceAbove > menuHeight + 20);
        this.recursosDropdownPosition.set(shouldShowAbove ? 'top' : 'bottom');
      }
    }, 10);
  }

  irARecursos(): void {
    this.router.navigate(['/recursos']);
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

        localStorage.removeItem('returnToRecurso');
        localStorage.removeItem('recursoId');

        if (this.returnToRecurso()) {
          if (this.recursoIdRetorno()) {
            this.router.navigate(['/recursos/editar', this.recursoIdRetorno()]);
          } else {
            this.router.navigate(['/recursos/nuevo']);
          }
        } else {
          this.router.navigate(['/autores/detalle', autorId]);
        }
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
