import { Component, signal, output, input, inject, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GlobalSearchService, SearchResult } from '../../core/services/global-search';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './busqueda.html',
  styleUrls: ['./busqueda.css']
})
// Componente para la búsqueda:
export class BusquedaComponent {
  private router = inject(Router);
  private globalSearchService = inject(GlobalSearchService);
  private destroyRef = inject(DestroyRef);

  buscar = output<string>();
  busquedaAvanzada = output<void>();

  rutaBusquedaAvanzada = input<string>('/busqueda-avanzada');

  termino = signal('');
  resultados = signal<SearchResult[]>([]);
  mostrarDropdown = signal(false);
  buscando = signal(false);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(termino => {
      this.realizarBusqueda(termino);
    });

    effect(() => {
      const term = this.termino();
      if (term.length >= 2) {
        this.searchSubject.next(term);
        this.mostrarDropdown.set(true);
      } else {
        this.resultados.set([]);
        this.mostrarDropdown.set(false);
      }
    });
  }

  onBuscar(): void {
    const term = this.termino();
    if (term.length >= 2) {
      this.realizarBusqueda(term);
      this.buscar.emit(term);
    } else if (term.length === 0) {
      this.buscar.emit('');
    }
  }

  private realizarBusqueda(termino: string): void {
    if (termino.length < 2) {
      this.resultados.set([]);
      this.mostrarDropdown.set(false);
      return;
    }

    this.buscando.set(true);
    this.globalSearchService.buscar(termino).subscribe({
      next: (resultados) => {
        this.resultados.set(resultados);
        this.buscando.set(false);
        this.mostrarDropdown.set(resultados.length > 0);
      },
      error: () => {
        this.resultados.set([]);
        this.buscando.set(false);
        this.mostrarDropdown.set(false);
      }
    });
  }

  onBusquedaAvanzada(): void {
    this.mostrarDropdown.set(false);
    this.router.navigate([this.rutaBusquedaAvanzada()]);
  }

  limpiar(): void {
    this.termino.set('');
    this.resultados.set([]);
    this.mostrarDropdown.set(false);
    this.buscar.emit('');
  }

  seleccionarResultado(resultado: SearchResult): void {
    this.mostrarDropdown.set(false);
    this.termino.set('');
    this.resultados.set([]);
    this.router.navigate([resultado.ruta]);
  }

  cerrarDropdown(): void {
    setTimeout(() => {
      this.mostrarDropdown.set(false);
    }, 200);
  }

}
