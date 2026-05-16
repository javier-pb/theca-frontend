import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AutorService, Autor } from '../../../core/services/autor';
import { RecursoService } from '../../../core/services/recurso';
import { BusquedaComponent } from '../../../shared/busqueda/busqueda';

interface GrupoAutores {
  letra: string;
  autores: Autor[];
}

@Component({
  selector: 'app-lista-autores',
  standalone: true,
  imports: [CommonModule, RouterModule, BusquedaComponent],
  templateUrl: './lista-autores.html',
  styleUrls: ['./lista-autores.css']
})
// Componente para la lista de autores:
export class ListaAutoresComponent implements OnInit {
  private autorService = inject(AutorService);
  private recursoService = inject(RecursoService);
  private router = inject(Router);

  autores = signal<Autor[]>([]);
  autoresFiltrados = signal<Autor[]>([]);
  terminoBusqueda = signal('');
  loading = signal(true);
  error = signal('');
  grupos = signal<GrupoAutores[]>([]);

  mostrarAnonimo = signal(false);

  ngOnInit(): void {
    this.cargarAutores();
    this.verificarRecursosSinAutor();
  }

  cargarAutores(): void {
    this.loading.set(true);
    this.error.set('');

    this.autorService.getAll().subscribe({
      next: (data) => {
        const ordenados = this.ordenarAlfabeticamente(data);
        this.autores.set(ordenados);
        this.filtrarAutores();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los autores');
        this.loading.set(false);
      }
    });
  }

  verificarRecursosSinAutor(): void {
    this.recursoService.getAll().subscribe({
      next: (recursos) => {
        const hayRecursosSinAutor = recursos.some(recurso =>
          !recurso.autores || recurso.autores.length === 0
        );
        this.mostrarAnonimo.set(hayRecursosSinAutor);
      },
      error: () => {
        console.error('Error al verificar recursos sin autor');
      }
    });
  }

  ordenarAlfabeticamente(autores: Autor[]): Autor[] {
    return [...autores].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  onBuscar(termino: string): void {
    this.terminoBusqueda.set(termino);
    this.filtrarAutores();
  }

  filtrarAutores(): void {
    const termino = this.terminoBusqueda().toLowerCase().trim();

    let filtrados: Autor[];
    if (termino === '') {
      filtrados = [...this.autores()];
    } else {
      filtrados = this.autores().filter(autor =>
        autor.nombre.toLowerCase().includes(termino)
      );
    }
    this.autoresFiltrados.set(filtrados);
    this.agruparPorLetra();
  }

  agruparPorLetra(): void {
    const gruposMap = new Map<string, Autor[]>();

    const anonimos: Autor[] = [];
    const normales: Autor[] = [];

    for (const autor of this.autoresFiltrados()) {
      const primeraLetra = autor.nombre.charAt(0).toUpperCase();
      if (/[A-Z]/.test(primeraLetra)) {
        if (!gruposMap.has(primeraLetra)) {
          gruposMap.set(primeraLetra, []);
        }
        gruposMap.get(primeraLetra)!.push(autor);
      } else {
        anonimos.push(autor);
      }
    }

    const gruposArray: GrupoAutores[] = [];
    for (const [letra, autores] of gruposMap) {
      gruposArray.push({ letra, autores });
    }
    gruposArray.sort((a, b) => a.letra.localeCompare(b.letra));

    if (anonimos.length > 0) {
      gruposArray.push({ letra: 'Anónimo', autores: anonimos });
    }

    this.grupos.set(gruposArray);
  }

  irADetalle(id: string): void {
    this.router.navigate(['/autores/detalle', id]);
  }

  irAAnonimo(): void {
    this.router.navigate(['/autores/detalle/anonimo']);
  }

  abrirBusquedaAvanzada(): void {
    console.log('Búsqueda avanzada - Pendiente de implementar');
  }

}
