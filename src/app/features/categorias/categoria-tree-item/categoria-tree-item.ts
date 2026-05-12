import { Component, Input, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Categoria } from '../../../core/services/categoria';

@Component({
  selector: 'app-categoria-tree-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categoria-tree-item.html',
  styleUrls: ['./categoria-tree-item.css']
})
// Componente para representar un ítem de categoría en el árbol:
export class CategoriaTreeItemComponent {

  @Input() categoria!: Categoria;
  @Input() categorias: Categoria[] = [];
  @Output() abrirDetalle = new EventEmitter<string>();

  expanded = signal(false);

  subcategorias = computed(() => {
    return this.categorias.filter(c => c.categoriaPadreId === this.categoria.id);
  });

  hasChildren = computed(() => {
    return this.subcategorias().length > 0;
  });

  toggleExpand(): void {
    if (this.hasChildren()) {
      this.expanded.update(val => !val);
    }
  }

  irADetalle(id: string): void {
    this.abrirDetalle.emit(id);
  }

}
