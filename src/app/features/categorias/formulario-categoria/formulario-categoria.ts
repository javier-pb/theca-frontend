import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoriaService } from '../../../core/services/categoria';

@Component({
  selector: 'app-formulario-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './formulario-categoria.html',
  styleUrls: ['./formulario-categoria.css']
})
// Componente para el formulario de categorías:
export class FormularioCategoriaComponent implements OnInit {

  private categoriaService = inject(CategoriaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  esEdicion = signal(false);
  categoriaId = signal<string | null>(null);
  nombre = signal('');
  esSubcategoria = signal(false);
  categoriaPadreId = signal('');
  categoriasDisponibles = signal<{ id: string; nombre: string }[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.cargarCategoriasDisponibles();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoriaId.set(id);
      this.esEdicion.set(true);
      this.cargarCategoria();
    }
  }

  cargarCategoriasDisponibles(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        const categoriasMapeadas = data.map(categoria => ({
          id: categoria.id || '',
          nombre: categoria.nombre || ''
        }));
        this.categoriasDisponibles.set(categoriasMapeadas);
      },
      error: () => {
        this.error.set('Error al cargar las categorías');
      }
    });
  }
  cargarCategoria(): void {
    this.loading.set(true);
    this.error.set('');

    this.categoriaService.getById(this.categoriaId()!).subscribe({
      next: (data) => {
        this.nombre.set(data.nombre);
        this.esSubcategoria.set(!!data.categoriaPadreId);
        this.categoriaPadreId.set(data.categoriaPadreId || '');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la categoría');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (!this.nombre().trim()) {
      this.error.set('El nombre es obligatorio');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const data: any = { nombre: this.nombre() };

    if (this.esSubcategoria() && this.categoriaPadreId()) {
      data.categoriaPadreId = this.categoriaPadreId();
    }

    const operacion = this.esEdicion()
      ? this.categoriaService.update(this.categoriaId()!, data)
      : this.categoriaService.create(data);

    operacion.subscribe({
      next: () => {
        this.router.navigate(['/categorias']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400 && err.error) {
          this.error.set(err.error);
        } else {
          this.error.set(err.error?.message || `Error al ${this.esEdicion() ? 'actualizar' : 'crear'} la categoría`);
        }
      }
    });
  }

}
