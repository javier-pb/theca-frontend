import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoriaService, Categoria } from '../../../core/services/categoria';

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
  categoriasParaSelect = signal<{ id: string; nombreCompleto: string }[]>([]);
  loading = signal(false);
  error = signal('');

  returnToRecurso = signal(false);
  recursoId = signal<string | null>(null);

  ngOnInit(): void {
    this.returnToRecurso.set(localStorage.getItem('returnToRecurso') === 'true');
    const savedRecursoId = localStorage.getItem('recursoId');
    if (savedRecursoId) {
      this.recursoId.set(savedRecursoId);
    }

    this.cargarCategorias();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoriaId.set(id);
      this.esEdicion.set(true);
      this.cargarCategoria();
    }
  }

  cargarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        const opciones = this.construirOpcionesConJerarquia(data);
        this.categoriasParaSelect.set(opciones);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.error.set('Error al cargar las categorías');
      }
    });
  }

  construirOpcionesConJerarquia(categorias: Categoria[]): { id: string; nombreCompleto: string }[] {
    const mapaCategorias = new Map<string, Categoria>();
    for (const cat of categorias) {
      mapaCategorias.set(cat.id!, cat);
    }

    const obtenerNombreCompleto = (categoria: Categoria): string => {
      const partes: string[] = [categoria.nombre];
      let actual = categoria;
      let contador = 0;
      const maxIteraciones = 100; // Evitar loops infinitos

      while (actual.categoriaPadreId && contador < maxIteraciones) {
        const padre = mapaCategorias.get(actual.categoriaPadreId);
        if (!padre) break;
        partes.unshift(padre.nombre);
        actual = padre;
        contador++;
      }

      return partes.join(' > ');
    };

    const resultado: { id: string; nombreCompleto: string }[] = [];

    for (const cat of categorias) {
      resultado.push({
        id: cat.id!,
        nombreCompleto: obtenerNombreCompleto(cat)
      });
    }

    resultado.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

    return resultado;
  }

  getCategoriasPadreDisponibles(): { id: string; nombreCompleto: string }[] {
    if (!this.esEdicion()) {
      return this.categoriasParaSelect();
    }
    return this.categoriasParaSelect().filter(cat => cat.id !== this.categoriaId());
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
      next: (response) => {
        localStorage.removeItem('returnToRecurso');
        localStorage.removeItem('recursoId');

        if (this.returnToRecurso()) {
          if (this.recursoId()) {
            this.router.navigate(['/recursos/editar', this.recursoId()]);
          } else {
            this.router.navigate(['/recursos/nuevo']);
          }
        } else {
          const id = response.id || this.categoriaId();
          this.router.navigate(['/categorias/detalle', id]);
        }
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
