import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TipoService, Tipo } from '../../../core/services/tipo';

@Component({
  selector: 'app-formulario-tipo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './formulario-tipo.html',
  styleUrls: ['./formulario-tipo.css']
})
// Componente para el formulario de tipos:
export class FormularioTipoComponent implements OnInit {

  private tipoService = inject(TipoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  esEdicion = signal(false);
  tipoId = signal<string | null>(null);
  tipoCompleto = signal<Tipo | null>(null);
  nombre = signal('');
  imagen = signal<string>('');
  loading = signal(false);
  error = signal('');

  returnToRecurso = signal(false);
  recursoIdRetorno = signal<string | null>(null);

  ngOnInit(): void {
    this.returnToRecurso.set(localStorage.getItem('returnToRecurso') === 'true');
    const savedRecursoId = localStorage.getItem('recursoId');
    if (savedRecursoId) {
      this.recursoIdRetorno.set(savedRecursoId);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tipoId.set(id);
      this.esEdicion.set(true);
      this.cargarTipo();
    }
  }

  cargarTipo(): void {
    this.loading.set(true);
    this.error.set('');

    this.tipoService.getById(this.tipoId()!).subscribe({
      next: (data) => {
        this.tipoCompleto.set(data);
        this.nombre.set(data.nombre);

        if (data.imagen) {
          const url = this.getImagenUrl(data.imagen);
          this.imagen.set(url || '');
        }
        else if (data.esPredeterminado) {
          const imagenPorNombre: { [key: string]: string } = {
            'PDF': 'PDF.png',
            'Hoja de cálculo': 'Hoja de cálculo.png',
            'Documento': 'Documento.png',
            'Enlace': 'Enlace.png',
            'ePub': 'ePub.png'
          };

          const nombreArchivo = imagenPorNombre[data.nombre];
          if (nombreArchivo) {
            this.imagen.set(`assets/images/${nombreArchivo}`);
          } else {
            const nombreNormalizado = data.nombre
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s/g, '');
            this.imagen.set(`assets/images/${nombreNormalizado}.png`);
          }
        } else {
          this.imagen.set('');
        }

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el tipo');
        this.loading.set(false);
      }
    });
  }

  getImagenUrl(imagen: string | null | undefined): string | null {
    if (!imagen) return null;
    if (imagen.startsWith('http') || imagen.startsWith('data:')) {
      return imagen;
    }
    return 'data:image/jpeg;base64,' + imagen;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagen.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarImagen(): void {
    this.imagen.set('');
  }

  onSubmit(): void {
    if (!this.nombre().trim()) {
      this.error.set('El nombre es obligatorio');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    let imagenFinal = this.imagen();

    if (imagenFinal && imagenFinal.startsWith('assets/images/')) {
      imagenFinal = '';
    }

    if (imagenFinal === '') {
      imagenFinal = '';
    }

    if (imagenFinal && imagenFinal.includes(',')) {
      imagenFinal = imagenFinal.split(',')[1];
    }

    const data: any = { nombre: this.nombre() };
    data.imagen = imagenFinal || '';

    const operacion = this.esEdicion()
      ? this.tipoService.update(this.tipoId()!, data)
      : this.tipoService.create(data);

    operacion.subscribe({
      next: (response) => {
        localStorage.removeItem('returnToRecurso');
        localStorage.removeItem('recursoId');

        if (this.returnToRecurso()) {
          if (this.recursoIdRetorno()) {
            this.router.navigate(['/recursos/editar', this.recursoIdRetorno()]);
          } else {
            this.router.navigate(['/recursos/nuevo']);
          }
        } else {
          const id = response.id || this.tipoId();
          this.router.navigate(['/tipos/detalle', id]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400 && err.error) {
          this.error.set(err.error);
        } else {
          this.error.set(err.error?.message || `Error al ${this.esEdicion() ? 'actualizar' : 'crear'} el tipo`);
        }
      }
    });
  }

  abrirSelectorArchivo(): void {
    const input = document.getElementById('imagenInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

}
