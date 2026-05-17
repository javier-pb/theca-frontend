import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { BusquedaComponent } from '../../../shared/busqueda/busqueda';
import { CategoriaTreeItemComponent } from '../categoria-tree-item/categoria-tree-item';

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [CommonModule, RouterModule, BusquedaComponent, CategoriaTreeItemComponent],
  templateUrl: './lista-categorias.html',
  styleUrls: ['./lista-categorias.css']
})
// Componente para la lista de categorías:
export class ListaCategoriasComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);

  categorias = signal<Categoria[]>([]);
  categoriasFiltradas = signal<Categoria[]>([]);
  terminoBusqueda = signal('');
  loading = signal(true);
  error = signal('');
  mostrarModal = signal(false);
  categoriaAEliminar = signal<Categoria | null>(null);

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading.set(true);
    this.error.set('');

    this.categoriaService.getAll().subscribe({
      next: (data) => {
        const categoriasOrdenadas = this.ordenarCategorias(data);
        this.categorias.set(categoriasOrdenadas);
        this.filtrarCategorias();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las categorías');
        this.loading.set(false);
      }
    });
  }

  ordenarCategorias(categorias: Categoria[]): Categoria[] {
    return [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  onBuscar(termino: string): void {
    this.terminoBusqueda.set(termino);
    this.filtrarCategorias();
  }

  filtrarCategorias(): void {
    const termino = this.terminoBusqueda().toLowerCase().trim();

    if (termino === '') {
      this.categoriasFiltradas.set(this.categorias());
    } else {
      const filtradas = this.categorias().filter(categoria =>
        categoria.nombre.toLowerCase().includes(termino)
      );
      const filtradasOrdenadas = this.ordenarCategorias(filtradas);
      this.categoriasFiltradas.set(filtradasOrdenadas);
    }
  }

  abrirBusquedaAvanzada(): void {
    this.router.navigate(['/busqueda-avanzada/categorias']);
  }

  abrirDetalle(id: string): void {
    this.router.navigate(['/categorias/detalle', id]);
  }

}
