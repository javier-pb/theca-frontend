import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TipoService, Tipo } from '../../../core/services/tipo';
import { BusquedaComponent } from '../../../shared/busqueda/busqueda';

@Component({
  selector: 'app-lista-tipos',
  standalone: true,
  imports: [CommonModule, RouterModule, BusquedaComponent],
  templateUrl: './lista-tipos.html',
  styleUrls: ['./lista-tipos.css']
})
// Componente para la lista de tipos:
export class ListaTiposComponent implements OnInit {

  private tipoService = inject(TipoService);
  private router = inject(Router);

  tipos = signal<Tipo[]>([]);
  tiposFiltrados = signal<Tipo[]>([]);
  terminoBusqueda = signal('');
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.loading.set(true);
    this.error.set('');

    this.tipoService.getAll().subscribe({
      next: (data) => {
        const ordenados = this.ordenarAlfabeticamente(data);
        this.tipos.set(ordenados);
        this.filtrarTipos();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los tipos');
        this.loading.set(false);
      }
    });
  }

  ordenarAlfabeticamente(tipos: Tipo[]): Tipo[] {
    return [...tipos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  onBuscar(termino: string): void {
    this.terminoBusqueda.set(termino);
    this.filtrarTipos();
  }

  filtrarTipos(): void {
    const termino = this.terminoBusqueda().toLowerCase().trim();

    if (termino === '') {
      this.tiposFiltrados.set(this.tipos());
    } else {
      const filtrados = this.tipos().filter(tipo =>
        tipo.nombre.toLowerCase().includes(termino)
      );
      this.tiposFiltrados.set(filtrados);
    }
  }

  abrirBusquedaAvanzada(): void {
    console.log('Búsqueda avanzada - Pendiente de implementar');
  }

  irADetalle(id: string): void {
    this.router.navigate(['/tipos/detalle', id]);
  }

  getImagenUrl(tipo: Tipo): string {
    if (tipo.imagen) {
      if (tipo.imagen.startsWith('http') || tipo.imagen.startsWith('data:')) {
        return tipo.imagen;
      }
      return 'data:image/jpeg;base64,' + tipo.imagen;
    }

    if (tipo.esPredeterminado) {
      const imagenPorNombre: { [key: string]: string } = {
        'PDF': 'PDF.png',
        'Hoja de cálculo': 'Hoja de cálculo.png',
        'Documento': 'Documento.png',
        'Enlace': 'Enlace.png',
        'ePub': 'ePub.png'
      };

      const nombreArchivo = imagenPorNombre[tipo.nombre];
      if (nombreArchivo) {
        return `assets/images/${nombreArchivo}`;
      }

      const nombreNormalizado = tipo.nombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s/g, '');
      return `assets/images/${nombreNormalizado}.png`;
    }

    return '';
  }

}
