import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, catchError, map, firstValueFrom, switchMap } from 'rxjs';
import { AuthService } from './auth';
import { TipoService } from './tipo';
import { AutorService } from './autor';

export interface SearchResult {
  id: string;
  titulo: string;
  tipo: 'recurso' | 'autor' | 'categoria' | 'etiqueta' | 'tipo';
  ruta: string;
  imagen?: string;
  autores?: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
// Servicio para la búsuqueda global:
export class GlobalSearchService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private tipoService = inject(TipoService);
  private autorService = inject(AutorService);

  private apiUrl = '/api';

  private readonly ordenTipos: Record<string, number> = {
    'recurso': 1,
    'categoria': 2,
    'etiqueta': 3,
    'autor': 4,
    'tipo': 5
  };

  buscar(termino: string): Observable<SearchResult[]> {
    if (!termino || termino.trim().length < 2) {
      return of([]);
    }

    const userId = this.authService.getUserId();
    const terminoLower = termino.toLowerCase().trim();

    return this.tipoService.getAll().pipe(
      map(tipos => {
        const mapaTipos = new Map();
        tipos.forEach(tipo => {
          mapaTipos.set(tipo.id, tipo);
        });
        return mapaTipos;
      }),
      switchMap(mapaTipos => {
        return forkJoin({
          recursos: this.buscarRecursos(terminoLower, userId, mapaTipos),
          autores: this.buscarAutores(terminoLower, userId),
          categorias: this.buscarCategorias(terminoLower, userId),
          etiquetas: this.buscarEtiquetas(terminoLower, userId),
          tipos: this.buscarTipos(terminoLower, userId)
        });
      }),
      map((resultados: {
        recursos: SearchResult[];
        autores: SearchResult[];
        categorias: SearchResult[];
        etiquetas: SearchResult[];
        tipos: SearchResult[];
      }) => {
        const todos: SearchResult[] = [
          ...resultados.recursos,
          ...resultados.autores,
          ...resultados.categorias,
          ...resultados.etiquetas,
          ...resultados.tipos
        ];

        return todos.sort((a, b) => {
          const ordenA = this.ordenTipos[a.tipo] || 99;
          const ordenB = this.ordenTipos[b.tipo] || 99;

          if (ordenA !== ordenB) {
            return ordenA - ordenB;
          }

          return a.titulo.localeCompare(b.titulo);
        }).slice(0, 10);
      }),
      catchError(() => of([]))
    );
  }

  private buscarRecursos(termino: string, userId: string | null, mapaTipos: Map<string, any>): Observable<SearchResult[]> {
    const filtros = { titulo: termino };
    let url = `${this.apiUrl}/recursos/buscar`;
    if (userId) {
      url += `?usuarioId=${userId}`;
    }
    return this.http.post<any[]>(url, filtros).pipe(
      switchMap(async (recursos) => {
        const resultados: SearchResult[] = [];

        for (const r of recursos) {
          let imagenPortada = '';
          if (r.portada) {
            if (r.portada.startsWith('http') || r.portada.startsWith('data:')) {
              imagenPortada = r.portada;
            } else {
              imagenPortada = 'data:image/jpeg;base64,' + r.portada;
            }
          } else {
            const tipoId = r.tipos?.[0]?.id || r.tipo?.id;
            if (tipoId && mapaTipos.has(tipoId)) {
              const tipo = mapaTipos.get(tipoId);
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
                  imagenPortada = `assets/images/${nombreArchivo}`;
                }
              }
            }
          }

          let autoresTexto = '';
          if (r.autores && Array.isArray(r.autores) && r.autores.length > 0) {
            const nombres: string[] = [];
            for (const autor of r.autores) {
              if (autor.nombre) {
                nombres.push(autor.nombre);
              } else if (autor.id) {
                try {
                  const autorCompleto = await firstValueFrom(this.autorService.getById(autor.id));
                  if (autorCompleto && autorCompleto.nombre) {
                    nombres.push(autorCompleto.nombre);
                  }
                } catch (e) {}
              }
            }
            autoresTexto = nombres.join(', ');
          }

          resultados.push({
            id: r.id,
            titulo: r.titulo,
            tipo: 'recurso',
            ruta: `/recursos/detalle/${r.id}`,
            imagen: imagenPortada,
            autores: autoresTexto,
            descripcion: r.descripcion?.substring(0, 100)
          });
        }
        return resultados;
      }),
      catchError(() => of([]))
    );
  }

  private buscarAutores(termino: string, userId: string | null): Observable<SearchResult[]> {
    let url = `${this.apiUrl}/autores`;
    if (userId) {
      url += `?usuarioId=${userId}`;
    }
    return this.http.get<any[]>(url).pipe(
      map(autores => autores
        .filter(a => a.nombre.toLowerCase().includes(termino))
        .map(a => ({
          id: a.id,
          titulo: a.nombre,
          tipo: 'autor' as const,
          ruta: `/autores/detalle/${a.id}`,
          descripcion: 'Autor'
        }))
      ),
      catchError(() => of([]))
    );
  }

  private buscarCategorias(termino: string, userId: string | null): Observable<SearchResult[]> {
    let url = `${this.apiUrl}/categorias`;
    if (userId) {
      url += `?usuarioId=${userId}`;
    }
    return this.http.get<any[]>(url).pipe(
      map(categorias => categorias
        .filter(c => c.nombre.toLowerCase().includes(termino))
        .map(c => ({
          id: c.id,
          titulo: c.nombre,
          tipo: 'categoria' as const,
          ruta: `/categorias/detalle/${c.id}`,
          descripcion: 'Categoría'
        }))
      ),
      catchError(() => of([]))
    );
  }

  private buscarEtiquetas(termino: string, userId: string | null): Observable<SearchResult[]> {
    let url = `${this.apiUrl}/etiquetas`;
    if (userId) {
      url += `?usuarioId=${userId}`;
    }
    return this.http.get<any[]>(url).pipe(
      map(etiquetas => etiquetas
        .filter(e => e.nombre.toLowerCase().includes(termino))
        .map(e => ({
          id: e.id,
          titulo: e.nombre,
          tipo: 'etiqueta' as const,
          ruta: `/etiquetas/detalle/${e.id}`,
          descripcion: 'Etiqueta'
        }))
      ),
      catchError(() => of([]))
    );
  }

  private buscarTipos(termino: string, userId: string | null): Observable<SearchResult[]> {
    let url = `${this.apiUrl}/tipos`;
    if (userId) {
      url += `?usuarioId=${userId}`;
    }
    return this.http.get<any[]>(url).pipe(
      map(tipos => tipos
        .filter(t => t.nombre.toLowerCase().includes(termino))
        .map(t => ({
          id: t.id,
          titulo: t.nombre,
          tipo: 'tipo' as const,
          ruta: `/tipos/detalle/${t.id}`,
          descripcion: 'Tipo'
        }))
      ),
      catchError(() => of([]))
    );
  }

}
