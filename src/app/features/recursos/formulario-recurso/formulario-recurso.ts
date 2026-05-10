// formulario-recurso.ts - CORREGIDO CON AUTH SERVICE
import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
import { FormRecursoStateService } from '../../../core/services/form-recurso-state';

@Component({
  selector: 'app-formulario-recurso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './formulario-recurso.html',
  styleUrls: ['./formulario-recurso.css']
})
// Componente para crear o editar un recurso:
export class FormularioRecursoComponent implements OnInit, OnDestroy {

  esEdicion = signal(false);
  recursoId = signal<string | null>(null);

  private stateService = inject(FormRecursoStateService);
  formState = this.stateService.getState();

  titulo = signal('');
  autoresTexto = signal('');
  autoresIds = signal<string[]>([]);
  portada = signal<string | null>(null);
  tipoId = signal('');
  version = signal('');
  descripcion = signal('');
  enlace = signal('');
  categoriasTexto = signal<string[]>([]);
  categoriasIds = signal<string[]>([]);
  etiquetasTexto = signal<string[]>([]);
  etiquetasIds = signal<string[]>([]);

  tiposDisponibles = signal<{ id: string; nombre: string }[]>([]);
  autoresDisponibles = signal<{ id: string; nombre: string }[]>([]);
  categoriasDisponibles = signal<{ id: string; nombre: string }[]>([]);
  etiquetasDisponibles = signal<{ id: string; nombre: string }[]>([]);

  loading = signal(false);
  errorTitulo = signal('');
  errorGeneral = signal('');

  constructor(
    private recursoService: RecursoService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.recursoId.set(id);
      this.esEdicion.set(true);

      const savedState = this.formState();
      this.titulo.set(savedState.titulo);
      this.autoresTexto.set(savedState.autoresTexto);
      this.portada.set(savedState.portada);
      this.tipoId.set(savedState.tipoId || '');
      this.version.set(savedState.version);
      this.descripcion.set(savedState.descripcion);
      this.enlace.set(savedState.enlace);
      this.categoriasTexto.set([...savedState.categoriasTexto]);
      this.etiquetasTexto.set([...savedState.etiquetasTexto]);
      this.autoresIds.set([]);
      this.categoriasIds.set([]);
      this.etiquetasIds.set([]);

      this.cargarRecurso();
    } else {
      this.stateService.clearState();

      this.titulo.set('');
      this.autoresTexto.set('');
      this.autoresIds.set([]);
      this.portada.set(null);
      this.tipoId.set('');
      this.version.set('');
      this.descripcion.set('');
      this.enlace.set('');
      this.categoriasTexto.set([]);
      this.categoriasIds.set([]);
      this.etiquetasTexto.set([]);
      this.etiquetasIds.set([]);
    }
  }

  ngOnDestroy(): void {
    this.stateService.setTitulo(this.titulo());
    this.stateService.setAutores(this.autoresIds(), this.autoresTexto());
    this.stateService.setPortada(this.portada());
    this.stateService.setTipo(this.tipoId() || null);
    this.stateService.setVersion(this.version());
    this.stateService.setDescripcion(this.descripcion());
    this.stateService.setEnlace(this.enlace());
    this.stateService.setCategorias(this.categoriasIds(), this.categoriasTexto());
    this.stateService.setEtiquetas(this.etiquetasIds(), this.etiquetasTexto());
  }

  cargarRecurso(): void {
    this.loading.set(true);
    this.recursoService.getById(this.recursoId()!).subscribe({
      next: (data) => {
        this.titulo.set(data.titulo || '');
        this.autoresTexto.set(data.autores?.map((a: any) => a.nombre).join(', ') || '');
        this.portada.set(data.portada || null);
        this.tipoId.set(data.tipo?.id || '');
        this.version.set(data.version || '');
        this.descripcion.set(data.descripcion || '');
        this.enlace.set(data.enlace || '');
        this.categoriasTexto.set(data.categorias?.map((c: any) => c.nombre) || []);
        this.etiquetasTexto.set(data.etiquetas?.map((e: any) => e.nombre) || []);
        this.loading.set(false);
      },
      error: () => {
        this.errorGeneral.set('Error al cargar el recurso');
        this.loading.set(false);
      }
    });
  }

  eliminarPortada(): void {
    this.portada.set(null);
  }

  abrirSelectorArchivo(): void {
    const input = document.getElementById('portadaInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.portada.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  irATipos(): void {
    this.ngOnDestroy();
    this.router.navigate(['/tipos']);
  }

  irAAutores(): void {
    this.ngOnDestroy();
    this.router.navigate(['/autores']);
  }

  irACategorias(): void {
    this.ngOnDestroy();
    this.router.navigate(['/categorias']);
  }

  irAEtiquetas(): void {
    this.ngOnDestroy();
    this.router.navigate(['/etiquetas']);
  }

  validarCampos(): boolean {
    let esValido = true;
    this.errorTitulo.set('');

    if (!this.titulo().trim()) {
      this.errorTitulo.set('El título es obligatorio');
      esValido = false;
    } else if (this.titulo().length < 3) {
      this.errorTitulo.set('El título debe tener al menos 3 caracteres');
      esValido = false;
    }

    return esValido;
  }

  onSubmit(): void {
    if (!this.validarCampos()) {
      return;
    }

    this.loading.set(true);
    this.errorGeneral.set('');

    let portadaFinal = this.portada();
    if (portadaFinal && portadaFinal.includes(',')) {
      portadaFinal = portadaFinal.split(',')[1];
    }
    if (!portadaFinal) {
      portadaFinal = '';
    }

    const userId = this.authService.getUserId();

    const dto = {
      titulo: this.titulo(),
      descripcion: this.descripcion() || '',
      enlace: this.enlace() || '',
      portada: portadaFinal,
      version: this.version(),
      usuarioId: userId,
      tiposIds: this.tipoId() ? [this.tipoId()] : [],
      etiquetasIds: this.etiquetasIds(),
      categoriasIds: this.categoriasIds(),
      autoresIds: this.autoresIds()
    };

    const operacion = this.esEdicion()
      ? this.recursoService.update(this.recursoId()!, dto)
      : this.recursoService.create(dto);

    operacion.subscribe({
      next: () => {
        this.stateService.clearState();
        this.router.navigate(['/recursos']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.error && typeof err.error === 'string') {
          this.errorGeneral.set(err.error);
        } else if (err.error && err.error.message) {
          this.errorGeneral.set(err.error.message);
        } else if (err.status === 400) {
          this.errorGeneral.set('Error en los datos enviados. Revisa la consola.');
        } else {
          this.errorGeneral.set(`Error al ${this.esEdicion() ? 'actualizar' : 'crear'} el recurso`);
        }
      }
    });
  }

}
