import { Component, OnInit, signal, inject, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
import { FormRecursoStateService } from '../../../core/services/form-recurso-state';
import { TipoService, Tipo } from '../../../core/services/tipo';
import { AutorService, Autor } from '../../../core/services/autor';
import { CategoriaService, Categoria } from '../../../core/services/categoria';
import { EtiquetaService, Etiqueta } from '../../../core/services/etiqueta';
import { ModalEtiquetaComponent } from "../../etiquetas/modal-etiqueta/modal-etiqueta";

@Component({
  selector: 'app-formulario-recurso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalEtiquetaComponent],
  templateUrl: './formulario-recurso.html',
  styleUrls: ['./formulario-recurso.css']
})
// Componente para el formulario de recursos:
export class FormularioRecursoComponent implements OnInit, OnDestroy {

  esEdicion = signal(false);
  recursoId = signal<string | null>(null);

  private stateService = inject(FormRecursoStateService);
  private tipoService = inject(TipoService);
  private autorService = inject(AutorService);
  private categoriaService = inject(CategoriaService);
  private etiquetaService = inject(EtiquetaService);
  formState = this.stateService.getState();
  showModalEtiqueta = signal(false);

  titulo = signal('');
  autoresIds = signal<string[]>([]);
  autoresTexto = signal('');
  portada = signal<string | null>(null);
  tipoId = signal('');
  tipoNombre = signal('');
  version = signal('');
  descripcion = signal('');
  enlace = signal('');
  categoriasIds = signal<string[]>([]);
  categoriasTexto = signal('');
  etiquetasIds = signal<string[]>([]);
  etiquetasTexto = signal('');

  tiposDisponibles = signal<Tipo[]>([]);
  autoresDisponibles = signal<Autor[]>([]);
  categoriasDisponibles = signal<Categoria[]>([]);
  categoriasJerarquicas = signal<{ categoria: Categoria, displayNombre: string, nivel: number }[]>([]);
  etiquetasDisponibles = signal<Etiqueta[]>([]);

  autoresDropdownOpen = signal(false);
  categoriasDropdownOpen = signal(false);
  etiquetasDropdownOpen = signal(false);

  loading = signal(false);
  errorTitulo = signal('');
  errorGeneral = signal('');

  categoriasDropdownPosition = signal<'bottom' | 'top'>('bottom');
  etiquetasDropdownPosition = signal<'bottom' | 'top'>('bottom');
  autoresDropdownPosition = signal<'bottom' | 'top'>('bottom');

  constructor(
    private recursoService: RecursoService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.autoresDropdownOpen.set(false);
      this.categoriasDropdownOpen.set(false);
      this.etiquetasDropdownOpen.set(false);
    }
  }

  ngOnInit(): void {
    this.cargarTipos();
    this.cargarAutores();
    this.cargarCategorias();
    this.cargarEtiquetas();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.recursoId.set(id);
      this.esEdicion.set(true);

      const savedState = this.formState();
      this.titulo.set(savedState.titulo);
      this.autoresTexto.set(savedState.autoresTexto);
      this.portada.set(savedState.portada);
      this.tipoId.set(savedState.tipoId || '');
      this.version.set(savedState.version);
      this.descripcion.set(savedState.descripcion);
      this.enlace.set(savedState.enlace);
      this.categoriasTexto.set(savedState.categoriasTexto.join(', '));
      this.etiquetasTexto.set(savedState.etiquetasTexto.join(', '));
      this.autoresIds.set(savedState.autoresIds);
      this.categoriasIds.set(savedState.categoriasIds);
      this.etiquetasIds.set(savedState.etiquetasIds);

      this.cargarRecurso();
    } else {
      this.stateService.clearState();
      this.limpiarFormulario();
    }
  }

  limpiarFormulario(): void {
    this.titulo.set('');
    this.autoresTexto.set('');
    this.autoresIds.set([]);
    this.portada.set(null);
    this.tipoId.set('');
    this.tipoNombre.set('');
    this.version.set('');
    this.descripcion.set('');
    this.enlace.set('');
    this.categoriasTexto.set('');
    this.categoriasIds.set([]);
    this.etiquetasTexto.set('');
    this.etiquetasIds.set([]);
  }

  ngOnDestroy(): void {
    this.stateService.setTitulo(this.titulo());
    this.stateService.setAutores(this.autoresIds(), this.autoresTexto());
    this.stateService.setPortada(this.portada());
    this.stateService.setTipo(this.tipoId() || null);
    this.stateService.setVersion(this.version());
    this.stateService.setDescripcion(this.descripcion());
    this.stateService.setEnlace(this.enlace());
    this.stateService.setCategorias(this.categoriasIds(), this.categoriasTexto() ? this.categoriasTexto().split(', ') : []);
    this.stateService.setEtiquetas(this.etiquetasIds(), this.etiquetasTexto() ? this.etiquetasTexto().split(', ') : []);
  }

  cargarTipos(): void {
    this.tipoService.getAll().subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.tiposDisponibles.set(ordenados);
      },
      error: () => console.error('Error al cargar tipos')
    });
  }

  cargarAutores(): void {
    this.autorService.getAll().subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.autoresDisponibles.set(ordenados);
      },
      error: () => console.error('Error al cargar autores')
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.categoriasDisponibles.set(ordenados);
        this.construirJerarquiaCategorias();
      },
      error: () => console.error('Error al cargar categorías')
    });
  }

  obtenerAncestros(categoriaId: string, categorias: Categoria[]): string[] {
    const ancestros: string[] = [];
    const mapaPorId = new Map<string, Categoria>();

    for (const cat of categorias) {
      mapaPorId.set(cat.id!, cat);
    }

    let actual = mapaPorId.get(categoriaId);
    while (actual && actual.categoriaPadreId) {
      ancestros.push(actual.categoriaPadreId);
      actual = mapaPorId.get(actual.categoriaPadreId);
    }

    return ancestros;
  }

  seleccionarConAncestros(categoriaId: string): void {
    const actuales = this.categoriasIds();
    if (!actuales.includes(categoriaId)) {
      const nuevas = [...actuales, categoriaId];
      const ancestros = this.obtenerAncestros(categoriaId, this.categoriasDisponibles());
      for (const ancestroId of ancestros) {
        if (!nuevas.includes(ancestroId)) {
          nuevas.push(ancestroId);
        }
      }
      this.categoriasIds.set(nuevas);
    } else {
      this.categoriasIds.set(actuales.filter(id => id !== categoriaId));
    }
    const categoriasSeleccionadas = this.categoriasDisponibles().filter(c => this.categoriasIds().includes(c.id!));
    const texto = categoriasSeleccionadas.map(c => c.nombre).join(', ');
    this.categoriasTexto.set(texto || '');
  }

  construirJerarquiaCategorias(): void {
    const resultado: { categoria: Categoria, displayNombre: string, nivel: number }[] = [];

    const obtenerNombreCompleto = (categoria: Categoria, categorias: Categoria[]): string => {
      if (!categoria.categoriaPadreId) {
        return categoria.nombre;
      }
      const padre = categorias.find(c => c.id === categoria.categoriaPadreId);
      if (padre) {
        return `${obtenerNombreCompleto(padre, categorias)} > ${categoria.nombre}`;
      }
      return categoria.nombre;
    };

    const categoriasConNombre = this.categoriasDisponibles().map(cat => ({
      categoria: cat,
      nombreCompleto: obtenerNombreCompleto(cat, this.categoriasDisponibles())
    }));

    categoriasConNombre.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

    for (const item of categoriasConNombre) {
      let nivel = 0;
      let actual = item.categoria;
      while (actual.categoriaPadreId) {
        nivel++;
        const padre = this.categoriasDisponibles().find(c => c.id === actual.categoriaPadreId);
        if (!padre) break;
        actual = padre;
      }

      resultado.push({
        categoria: item.categoria,
        displayNombre: item.nombreCompleto,
        nivel: nivel
      });
    }

    this.categoriasJerarquicas.set(resultado);
  }

  cargarEtiquetas(): void {
    this.etiquetaService.getAll().subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.etiquetasDisponibles.set(ordenados);
      },
      error: () => console.error('Error al cargar etiquetas')
    });
  }

  cargarRecurso(): void {
    this.loading.set(true);
    this.recursoService.getById(this.recursoId()!).subscribe({
      next: (data) => {
        this.titulo.set(data.titulo || '');

        // Autores:
        if (data.autores && Array.isArray(data.autores) && data.autores.length > 0) {
          this.autoresIds.set(data.autores.map((a: any) => a.id || a._id));
          const nombres = data.autores.map((a: any) => a.nombre).filter((n: string) => n && n.trim());
          this.autoresTexto.set(this.truncarTexto(nombres.join(', ')));
        } else {
          this.autoresIds.set([]);
          this.autoresTexto.set('');
        }

        // Tipo:
        if (data.tipo) {
          this.tipoId.set(data.tipo.id || data.tipo._id);
          this.tipoNombre.set(data.tipo.nombre || '');
        } else if (data.tipos && data.tipos.length > 0) {
          this.tipoId.set(data.tipos[0].id || data.tipos[0]._id);
          this.tipoNombre.set(data.tipos[0].nombre || '');
        }

        // Portada:
        let portadaNormalizada = data.portada || null;
        if (portadaNormalizada && !portadaNormalizada.startsWith('data:') && !portadaNormalizada.startsWith('http')) {
          portadaNormalizada = 'data:image/jpeg;base64,' + portadaNormalizada;
        }
        this.portada.set(portadaNormalizada);

        this.version.set(data.version || '');
        this.descripcion.set(data.descripcion || '');
        this.enlace.set(data.enlace || '');

        // Categorías:
        if (data.categorias && Array.isArray(data.categorias) && data.categorias.length > 0) {
          this.categoriasIds.set(data.categorias.map((c: any) => c.id || c._id));
          const nombres = data.categorias.map((c: any) => c.nombre).filter((n: string) => n && n.trim());
          this.categoriasTexto.set(this.truncarTexto(nombres.join(', ')));
        } else {
          this.categoriasIds.set([]);
          this.categoriasTexto.set('');
        }

        // Etiquetas:
        if (data.etiquetas && Array.isArray(data.etiquetas) && data.etiquetas.length > 0) {
          this.etiquetasIds.set(data.etiquetas.map((e: any) => e.id || e._id));
          const nombres = data.etiquetas.map((e: any) => e.nombre).filter((n: string) => n && n.trim());
          this.etiquetasTexto.set(this.truncarTexto(nombres.join(', ')));
        } else {
          this.etiquetasIds.set([]);
          this.etiquetasTexto.set('');
        }

        this.loading.set(false);
      },
      error: () => {
        this.errorGeneral.set('Error al cargar el recurso');
        this.loading.set(false);
      }
    });
  }

  // Método para truncar texto largo:
  truncarTexto(texto: string, maxLength: number = 50): string {
    if (!texto || texto.trim() === '') return '';

    if (texto.match(/^[\s,]+$/)) return '';

    if (texto.length <= maxLength) return texto;

    const items = texto.split(', ').filter(item => item.trim() !== '');
    if (items.length === 0) return '';

    let resultado = '';
    let i = 0;
    for (const item of items) {
      const nuevoResultado = resultado ? `${resultado}, ${item}` : item;
      if (nuevoResultado.length > maxLength) {
        const restantes = items.length - i;
        return `${resultado} +${restantes}`;
      }
      resultado = nuevoResultado;
      i++;
    }
    return resultado;
  }

  toggleAutoresDropdown(): void {
    this.autoresDropdownOpen.set(!this.autoresDropdownOpen());
    if (this.autoresDropdownOpen()) {
      setTimeout(() => this.checkDropdownPosition('autores'), 5);
    }
  }

  toggleAutor(autorId: string): void {
    const actuales = this.autoresIds();
    if (actuales.includes(autorId)) {
      this.autoresIds.set(actuales.filter(id => id !== autorId));
    } else {
      this.autoresIds.set([...actuales, autorId]);
    }
    const autoresSeleccionados = this.autoresDisponibles().filter(a => this.autoresIds().includes(a.id!));
    const texto = autoresSeleccionados.map(a => a.nombre).join(', ');
    this.autoresTexto.set(texto || '');
  }

  toggleCategoriasDropdown(): void {
    this.categoriasDropdownOpen.set(!this.categoriasDropdownOpen());
    if (this.categoriasDropdownOpen()) {
      setTimeout(() => this.checkDropdownPosition('categorias'), 5);
    }
  }

  toggleCategoria(categoriaId: string): void {
    const actuales = this.categoriasIds();
    if (actuales.includes(categoriaId)) {
      this.categoriasIds.set(actuales.filter(id => id !== categoriaId));
    } else {
      this.categoriasIds.set([...actuales, categoriaId]);
      const ancestros = this.obtenerAncestros(categoriaId, this.categoriasDisponibles());
      for (const ancestroId of ancestros) {
        if (!this.categoriasIds().includes(ancestroId)) {
          this.categoriasIds().push(ancestroId);
        }
      }
    }
    const categoriasSeleccionadas = this.categoriasDisponibles().filter(c => this.categoriasIds().includes(c.id!));
    const texto = categoriasSeleccionadas.map(c => c.nombre).join(', ');
    this.categoriasTexto.set(texto || '');
  }

  toggleEtiquetasDropdown(): void {
    this.etiquetasDropdownOpen.set(!this.etiquetasDropdownOpen());
    if (this.etiquetasDropdownOpen()) {
      setTimeout(() => this.checkDropdownPosition('etiquetas'), 5);
    }
  }

  toggleEtiqueta(etiquetaId: string): void {
    const actuales = this.etiquetasIds();
    if (actuales.includes(etiquetaId)) {
      this.etiquetasIds.set(actuales.filter(id => id !== etiquetaId));
    } else {
      this.etiquetasIds.set([...actuales, etiquetaId]);
    }
    const etiquetasSeleccionadas = this.etiquetasDisponibles().filter(e => this.etiquetasIds().includes(e.id!));
    const texto = etiquetasSeleccionadas.map(e => e.nombre).join(', ');
    this.etiquetasTexto.set(texto || '');
  }

  checkDropdownPosition(dropdownName: 'autores' | 'categorias' | 'etiquetas'): void {
    setTimeout(() => {
      const dropdown = document.querySelector(`.custom-dropdown.${dropdownName}`) as HTMLElement;
      const menu = dropdown?.querySelector('.dropdown-menu') as HTMLElement;
      const trigger = dropdown?.querySelector('.dropdown-trigger') as HTMLElement;

      if (menu && trigger) {
        const triggerRect = trigger.getBoundingClientRect();
        const menuHeight = menu.scrollHeight;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        const shouldShowAbove = (spaceBelow < menuHeight + 20) && (spaceAbove > menuHeight + 20);

        if (dropdownName === 'categorias') {
          this.categoriasDropdownPosition.set(shouldShowAbove ? 'top' : 'bottom');
        } else if (dropdownName === 'etiquetas') {
          this.etiquetasDropdownPosition.set(shouldShowAbove ? 'top' : 'bottom');
        } else if (dropdownName === 'autores') {
          this.autoresDropdownPosition.set(shouldShowAbove ? 'top' : 'bottom');
        }
      }
    }, 10);
  }

  eliminarPortada(): void {
    this.portada.set(null);
  }

  abrirSelectorArchivo(): void {
    const input = document.getElementById('portadaInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.portada.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  irAAutores(): void {
    this.ngOnDestroy();
    localStorage.setItem('returnToRecurso', 'true');
    if (this.recursoId()) {
      localStorage.setItem('recursoId', this.recursoId()!);
    }
    this.router.navigate(['/autores/nuevo']);
  }

  irATipos(): void {
    this.ngOnDestroy();
    this.router.navigate(['/tipos/nuevo'], { queryParams: { returnTo: 'recurso' } });
  }

  irACategorias(): void {
    this.ngOnDestroy();
    localStorage.setItem('returnToRecurso', 'true');
    if (this.recursoId()) {
      localStorage.setItem('recursoId', this.recursoId()!);
    }
    this.router.navigate(['/categorias/nuevo']);
  }

  irAEtiquetas(): void {
    this.showModalEtiqueta.set(true);
  }

  onEtiquetaGuardada(): void {
    this.showModalEtiqueta.set(false);
    this.cargarEtiquetas();
  }

  cerrarModalEtiqueta(): void {
    this.showModalEtiqueta.set(false);
  }

  validarCampos(): boolean {
    let esValido = true;
    this.errorTitulo.set('');
    this.errorGeneral.set('');

    if (!this.titulo().trim()) {
      this.errorTitulo.set('El título es obligatorio');
      esValido = false;
    } else if (this.titulo().length < 3) {
      this.errorTitulo.set('El título debe tener al menos 3 caracteres');
      esValido = false;
    }

    if (!this.tipoId()) {
      this.errorGeneral.set('El tipo de recurso es obligatorio');
      esValido = false;
    }

    return esValido;
  }

  onSubmit(): void {
    if (!this.validarCampos()) {
      return;
    }

    this.loading.set(true);
    this.errorGeneral.set('');

    let portadaFinal = this.portada();
    if (portadaFinal && portadaFinal.includes(',')) {
      portadaFinal = portadaFinal.split(',')[1];
    }
    if (!portadaFinal) {
      portadaFinal = '';
    }

    const userId = this.authService.getUserId();

    const dto = {
      titulo: this.titulo(),
      descripcion: this.descripcion() || '',
      enlace: this.enlace() || '',
      portada: portadaFinal,
      version: this.version(),
      usuarioId: userId,
      tiposIds: this.tipoId() ? [this.tipoId()] : [],
      etiquetasIds: this.etiquetasIds(),
      categoriasIds: this.categoriasIds(),
      autoresIds: this.autoresIds()
    };

    const operacion = this.esEdicion()
      ? this.recursoService.update(this.recursoId()!, dto)
      : this.recursoService.create(dto);

    operacion.subscribe({
      next: (response) => {
        this.stateService.clearState();
        const id = response.id || this.recursoId();
        this.router.navigate(['/recursos/detalle', id]);
      },
      error: (err) => {
        console.error('Error en la petición:', err);
        this.loading.set(false);
        if (err.error && typeof err.error === 'string') {
          this.errorGeneral.set(err.error);
        } else if (err.error && err.error.message) {
          this.errorGeneral.set(err.error.message);
        } else if (err.status === 400) {
          this.errorGeneral.set('Error en los datos enviados. Revisa la consola.');
        } else {
          this.errorGeneral.set(`Error al ${this.esEdicion() ? 'actualizar' : 'crear'} el recurso`);
        }
      }
    });
  }

  onTipoChange(tipoId: string): void {
    this.tipoId.set(tipoId);
    const tipo = this.tiposDisponibles().find(t => t.id === tipoId);
    this.tipoNombre.set(tipo?.nombre || '');
  }

  getPortadaUrl(portada: string | null): string {
    if (!portada) return '';
    if (portada.startsWith('http') || portada.startsWith('data:')) {
      return portada;
    }
    return 'data:image/jpeg;base64,' + portada;
  }

}
