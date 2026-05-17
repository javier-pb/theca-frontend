import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EtiquetaService, Etiqueta } from '../../../core/services/etiqueta';
import { BusquedaComponent } from '../../../shared/busqueda/busqueda';
import { ModalEtiquetaComponent } from '../modal-etiqueta/modal-etiqueta';

@Component({
  selector: 'app-lista-etiquetas',
  standalone: true,
  imports: [CommonModule, RouterModule, BusquedaComponent, ModalEtiquetaComponent],
  templateUrl: './lista-etiquetas.html',
  styleUrls: ['./lista-etiquetas.css']
})
// Componente para la lista de etiquetas:
export class ListaEtiquetasComponent implements OnInit {

  private etiquetaService = inject(EtiquetaService);
  private router = inject(Router);

  etiquetas = signal<Etiqueta[]>([]);
  etiquetasFiltradas = signal<Etiqueta[]>([]);
  terminoBusqueda = signal('');
  loading = signal(true);
  error = signal('');

  showModal = signal(false);
  modalModo = signal<'crear' | 'editar'>('crear');
  etiquetaSeleccionada = signal<Etiqueta | null>(null);

  ngOnInit(): void {
    this.cargarEtiquetas();
  }

  cargarEtiquetas(): void {
    this.loading.set(true);
    this.error.set('');

    this.etiquetaService.getAll().subscribe({
      next: (data) => {
        const ordenadas = this.ordenarAlfabeticamente(data);
        this.etiquetas.set(ordenadas);
        this.filtrarEtiquetas();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las etiquetas');
        this.loading.set(false);
      }
    });
  }

  ordenarAlfabeticamente(etiquetas: Etiqueta[]): Etiqueta[] {
    return [...etiquetas].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  onBuscar(termino: string): void {
    this.terminoBusqueda.set(termino);
    this.filtrarEtiquetas();
  }

  filtrarEtiquetas(): void {
    const termino = this.terminoBusqueda().toLowerCase().trim();

    if (termino === '') {
      this.etiquetasFiltradas.set(this.etiquetas());
    } else {
      const filtradas = this.etiquetas().filter(etiqueta =>
        etiqueta.nombre.toLowerCase().includes(termino)
      );
      this.etiquetasFiltradas.set(filtradas);
    }
  }

  abrirBusquedaAvanzada(): void {
    this.router.navigate(['/busqueda-avanzada/etiquetas']);
  }

  abrirModalCrear(): void {
    this.modalModo.set('crear');
    this.etiquetaSeleccionada.set(null);
    this.showModal.set(true);
  }

  abrirModalEditar(etiqueta: Etiqueta): void {
    this.modalModo.set('editar');
    this.etiquetaSeleccionada.set(etiqueta);
    this.showModal.set(true);
  }

  cerrarModal(): void {
    this.showModal.set(false);
    this.etiquetaSeleccionada.set(null);
  }

  onGuardado(): void {
    this.cerrarModal();
    this.cargarEtiquetas();
  }

  irADetalle(id: string): void {
    this.router.navigate(['/etiquetas/detalle', id]);
  }

}
