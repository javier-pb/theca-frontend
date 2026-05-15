import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { FormularioRecursoComponent } from './formulario-recurso';
import { RecursoService } from '../../../core/services/recurso';
import { AuthService } from '../../../core/services/auth';
import { FormRecursoStateService } from '../../../core/services/form-recurso-state';
import { TipoService } from '../../../core/services/tipo';
import { AutorService } from '../../../core/services/autor';
import { CategoriaService } from '../../../core/services/categoria';
import { EtiquetaService } from '../../../core/services/etiqueta';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el formulario de un recurso:
describe('FormularioRecursoComponent', () => {

  let component: FormularioRecursoComponent;
  let fixture: ComponentFixture<FormularioRecursoComponent>;
  let recursoService: jasmine.SpyObj<RecursoService>;
  let authService: jasmine.SpyObj<AuthService>;
  let stateService: jasmine.SpyObj<FormRecursoStateService>;
  let tipoService: jasmine.SpyObj<TipoService>;
  let autorService: jasmine.SpyObj<AutorService>;
  let categoriaService: jasmine.SpyObj<CategoriaService>;
  let etiquetaService: jasmine.SpyObj<EtiquetaService>;
  let router: Router;

  const mockState = {
    titulo: '',
    autoresIds: [],
    autoresTexto: '',
    portada: null,
    tipoId: null,
    version: '',
    descripcion: '',
    enlace: '',
    categoriasIds: [],
    categoriasTexto: [],
    etiquetasIds: [],
    etiquetasTexto: []
  };

  const mockTipos = [
    { id: 'tipo1', nombre: 'Libro' },
    { id: 'tipo2', nombre: 'PDF' }
  ];

  const mockAutores = [
    { id: 'autor1', nombre: 'Autor 1' },
    { id: 'autor2', nombre: 'Autor 2' }
  ];

  const mockCategorias = [
    { id: 'cat1', nombre: 'Literatura', categoriaPadreId: null },
    { id: 'cat2', nombre: 'Poesía', categoriaPadreId: 'cat1' }
  ];

  const mockEtiquetas = [
    { id: 'etq1', nombre: 'Barroco' },
    { id: 'etq2', nombre: 'Renacimiento' }
  ];

  const mockRecursoData = {
    id: '1',
    titulo: 'Recurso existente',
    descripcion: 'Descripción existente',
    enlace: 'https://ejemplo.com',
    version: '2.0',
    portada: 'portada123',
    tipo: { id: 'tipo1', nombre: 'Libro' },
    tipos: [{ id: 'tipo1', nombre: 'Libro' }],
    autores: [{ id: 'autor1', nombre: 'Autor 1' }],
    categorias: [{ id: 'cat1', nombre: 'Literatura' }],
    etiquetas: [{ id: 'etq1', nombre: 'Barroco' }]
  };

  const mockRecursoConIds = {
    id: '2',
    titulo: 'Recurso con IDs',
    autores: [{ id: 'autor1' }],
    categorias: [{ id: 'cat1' }],
    etiquetas: [{ id: 'etq1' }],
    tipos: [{ id: 'tipo1' }]
  };

  const setupCreateMode = () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

    fixture = TestBed.createComponent(FormularioRecursoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  const setupEditMode = (recursoData: any = mockRecursoData) => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

    recursoService.getById.and.returnValue(of(recursoData));
    recursoService.update.and.returnValue(of({ id: '1' }));

    fixture = TestBed.createComponent(FormularioRecursoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    recursoService = jasmine.createSpyObj('RecursoService', ['create', 'update', 'getById']);
    authService = jasmine.createSpyObj('AuthService', ['getUserId', 'getToken']);
    stateService = jasmine.createSpyObj('FormRecursoStateService', [
      'getState', 'clearState', 'setTitulo', 'setAutores', 'setPortada', 'setTipo',
      'setVersion', 'setDescripcion', 'setEnlace', 'setCategorias', 'setEtiquetas'
    ]);
    tipoService = jasmine.createSpyObj('TipoService', ['getAll']);
    autorService = jasmine.createSpyObj('AutorService', ['getAll']);
    categoriaService = jasmine.createSpyObj('CategoriaService', ['getAll']);
    etiquetaService = jasmine.createSpyObj('EtiquetaService', ['getAll']);

    stateService.getState.and.returnValue(signal(mockState));
    authService.getUserId.and.returnValue('user123');
    authService.getToken.and.returnValue('fake-token');
    tipoService.getAll.and.returnValue(of(mockTipos));
    autorService.getAll.and.returnValue(of(mockAutores));
    categoriaService.getAll.and.returnValue(of(mockCategorias));
    etiquetaService.getAll.and.returnValue(of(mockEtiquetas));

    await TestBed.configureTestingModule({
      imports: [
        FormularioRecursoComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'recursos', component: DummyComponent },
          { path: 'recursos/detalle/:id', component: DummyComponent },
          { path: 'autores/nuevo', component: DummyComponent },
          { path: 'categorias/nuevo', component: DummyComponent },
          { path: 'tipos/nuevo', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: RecursoService, useValue: recursoService },
        { provide: AuthService, useValue: authService },
        { provide: FormRecursoStateService, useValue: stateService },
        { provide: TipoService, useValue: tipoService },
        { provide: AutorService, useValue: autorService },
        { provide: CategoriaService, useValue: categoriaService },
        { provide: EtiquetaService, useValue: etiquetaService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    recursoService.create.calls.reset();
    recursoService.update.calls.reset();
    recursoService.getById.calls.reset();
    tipoService.getAll.calls.reset();
    autorService.getAll.calls.reset();
    categoriaService.getAll.calls.reset();
    etiquetaService.getAll.calls.reset();
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values in create mode', () => {
      expect(component.esEdicion()).toBe(false);
      expect(component.recursoId()).toBeNull();
      expect(component.titulo()).toBe('');
      expect(component.descripcion()).toBe('');
      expect(component.enlace()).toBe('');
      expect(component.version()).toBe('');
      expect(component.loading()).toBe(false);
      expect(component.errorGeneral()).toBe('');
    });

    it('should call clearState on init in create mode', () => {
      expect(stateService.clearState).toHaveBeenCalled();
    });

    it('should load tipos, autores, categorias, etiquetas', () => {
      expect(tipoService.getAll).toHaveBeenCalled();
      expect(autorService.getAll).toHaveBeenCalled();
      expect(categoriaService.getAll).toHaveBeenCalled();
      expect(etiquetaService.getAll).toHaveBeenCalled();
      expect(component.tiposDisponibles().length).toBe(2);
      expect(component.autoresDisponibles().length).toBe(2);
    });

    describe('Validations', () => {
      it('should validate required title', () => {
        component.titulo.set('');
        expect(component.validarCampos()).toBe(false);
        expect(component.errorTitulo()).toBe('El título es obligatorio');
      });

      it('should validate minimum title length of 3 characters', () => {
        component.titulo.set('ab');
        expect(component.validarCampos()).toBe(false);
        expect(component.errorTitulo()).toBe('El título debe tener al menos 3 caracteres');
      });

      it('should validate required tipo', () => {
        component.titulo.set('Valid Title');
        component.tipoId.set('');
        expect(component.validarCampos()).toBe(false);
        expect(component.errorGeneral()).toBe('El tipo de recurso es obligatorio');
      });

      it('should accept valid title and tipo', () => {
        component.titulo.set('Valid Title');
        component.tipoId.set('tipo1');
        expect(component.validarCampos()).toBe(true);
        expect(component.errorTitulo()).toBe('');
        expect(component.errorGeneral()).toBe('');
      });
    });

    describe('Cover Image', () => {
      it('should remove cover image', () => {
        component.portada.set('data:image/png;base64,abc123');
        expect(component.portada()).toBeTruthy();
        component.eliminarPortada();
        expect(component.portada()).toBeNull();
      });
    });

    describe('getPortadaUrl', () => {
      it('should return empty string when portada is null or undefined', () => {
        expect(component.getPortadaUrl('')).toBe('');
        expect(component.getPortadaUrl(null as any)).toBe('');
      });

      it('should return unchanged URL when portada starts with http', () => {
        const url = 'https://ejemplo.com/imagen.jpg';
        expect(component.getPortadaUrl(url)).toBe(url);
      });

      it('should return unchanged URL when portada starts with data:', () => {
        const dataUrl = 'data:image/jpeg;base64,abc123';
        expect(component.getPortadaUrl(dataUrl)).toBe(dataUrl);
      });

      it('should add base64 prefix when portada is base64 string', () => {
        const base64 = 'abc123def456';
        expect(component.getPortadaUrl(base64)).toBe('data:image/jpeg;base64,' + base64);
      });
    });

    describe('abrirSelectorArchivo', () => {
      it('should open file selector when called', () => {
        const clickSpy = jasmine.createSpy('click');
        const mockInput = { click: clickSpy };
        spyOn(document, 'getElementById').and.returnValue(mockInput as any);

        component.abrirSelectorArchivo();

        expect(clickSpy).toHaveBeenCalled();
      });
    });

    describe('onFileSelected', () => {
      it('should handle file selection', () => {
        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        const event = { target: { files: [file] } } as any;
        const readerSpy = spyOn(FileReader.prototype, 'readAsDataURL');

        component.onFileSelected(event);

        expect(readerSpy).toHaveBeenCalled();
      });
    });

    describe('Create Resource', () => {
      beforeEach(() => {
        component.titulo.set('New Resource');
        component.tipoId.set('tipo1');
        component.descripcion.set('Test description');
        recursoService.create.and.returnValue(of({ id: '1' }));
      });

      it('should create resource with valid data', fakeAsync(() => {
        component.onSubmit();
        tick();

        expect(recursoService.create).toHaveBeenCalled();
        expect(stateService.clearState).toHaveBeenCalled();
      }));

      it('should navigate to detalle after creation', fakeAsync(() => {
        spyOn(router, 'navigate');
        component.onSubmit();
        tick();

        expect(router.navigate).toHaveBeenCalledWith(['/recursos/detalle', '1']);
      }));

      it('should include userId in DTO', fakeAsync(() => {
        component.onSubmit();
        tick();

        const called = recursoService.create.calls.mostRecent();
        const sentDto = called.args[0];

        expect(sentDto.usuarioId).toBe('user123');
        expect(sentDto.titulo).toBe('New Resource');
      }));

      it('should send selected IDs in DTO', fakeAsync(() => {
        component.autoresIds.set(['autor1', 'autor2']);
        component.categoriasIds.set(['cat1']);
        component.etiquetasIds.set(['etq1', 'etq2']);
        component.onSubmit();
        tick();

        const called = recursoService.create.calls.mostRecent();
        const sentDto = called.args[0];
        expect(sentDto.autoresIds).toEqual(['autor1', 'autor2']);
        expect(sentDto.categoriasIds).toEqual(['cat1']);
        expect(sentDto.etiquetasIds).toEqual(['etq1', 'etq2']);
        expect(sentDto.tiposIds).toEqual(['tipo1']);
      }));

      it('should process cover image correctly', fakeAsync(() => {
        component.portada.set('data:image/png;base64,abc123def456');
        component.onSubmit();
        tick();

        const called = recursoService.create.calls.mostRecent();
        const sentDto = called.args[0];
        expect(sentDto.portada).toBe('abc123def456');
      }));

      it('should handle creation error with status 400', fakeAsync(() => {
        recursoService.create.and.returnValue(throwError(() => ({ status: 400 })));
        component.onSubmit();
        tick();

        expect(component.loading()).toBe(false);
        expect(component.errorGeneral()).toBe('Error en los datos enviados. Revisa la consola.');
      }));

      it('should handle generic creation error', fakeAsync(() => {
        recursoService.create.and.returnValue(throwError(() => ({ status: 500 })));
        component.onSubmit();
        tick();

        expect(component.loading()).toBe(false);
        expect(component.errorGeneral()).toBe('Error al crear el recurso');
      }));
    });
  });

  describe('Edit Mode', () => {
    describe('with complete data', () => {
      beforeEach(() => {
        setupEditMode(mockRecursoData);
      });

      it('should be in edit mode', () => {
        expect(component.esEdicion()).toBe(true);
        expect(component.recursoId()).toBe('1');
      });

      it('should load resource data', () => {
        expect(component.titulo()).toBe('Recurso existente');
        expect(component.version()).toBe('2.0');
        expect(component.descripcion()).toBe('Descripción existente');
        expect(component.autoresIds()).toEqual(['autor1']);
        expect(component.autoresTexto()).toBe('Autor 1');
        expect(component.tipoId()).toBe('tipo1');
      });

      it('should normalize portada with base64 prefix when loading', fakeAsync(() => {
        const dataConPortadaBase64 = {
          ...mockRecursoData,
          portada: 'base64string'
        };

        // Crear un nuevo TestBed para este test específico
        const newTestBed = TestBed.resetTestingModule();

        newTestBed.configureTestingModule({
          imports: [
            FormularioRecursoComponent,
            HttpClientTestingModule,
            RouterTestingModule.withRoutes([
              { path: 'recursos', component: DummyComponent },
              { path: 'recursos/detalle/1', component: DummyComponent }
            ])
          ],
          providers: [
            { provide: RecursoService, useValue: recursoService },
            { provide: AuthService, useValue: authService },
            { provide: FormRecursoStateService, useValue: stateService },
            { provide: TipoService, useValue: tipoService },
            { provide: AutorService, useValue: autorService },
            { provide: CategoriaService, useValue: categoriaService },
            { provide: EtiquetaService, useValue: etiquetaService }
          ]
        });

        const mockActivatedRoute = {
          snapshot: {
            paramMap: {
              get: jasmine.createSpy('get').and.returnValue('1')
            }
          }
        };

        newTestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
        recursoService.getById.and.returnValue(of(dataConPortadaBase64));

        const newFixture = newTestBed.createComponent(FormularioRecursoComponent);
        const newComponent = newFixture.componentInstance;
        newFixture.detectChanges();

        expect(newComponent.portada()).toBe('data:image/jpeg;base64,base64string');
      }));

      it('should update resource', fakeAsync(() => {
        spyOn(router, 'navigate');
        component.onSubmit();
        tick();

        expect(recursoService.update).toHaveBeenCalledWith('1', jasmine.any(Object));
        expect(stateService.clearState).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/recursos/detalle', '1']);
      }));

      it('should handle update error', fakeAsync(() => {
        recursoService.update.and.returnValue(throwError(() => ({ status: 500 })));
        component.onSubmit();
        tick();

        expect(component.loading()).toBe(false);
        expect(component.errorGeneral()).toBe('Error al actualizar el recurso');
      }));
    });

    describe('with data containing only IDs', () => {
      beforeEach(() => {
        setupEditMode(mockRecursoConIds);
      });

      it('should load ids correctly', () => {
        expect(component.autoresIds()).toEqual(['autor1']);
        expect(component.categoriasIds()).toEqual(['cat1']);
        expect(component.etiquetasIds()).toEqual(['etq1']);
        expect(component.tipoId()).toBe('tipo1');
      });
    });

    describe('with empty relations', () => {
      beforeEach(() => {
        setupEditMode({ ...mockRecursoData, autores: [], categorias: [], etiquetas: [] });
      });

      it('should handle empty arrays', () => {
        expect(component.autoresIds()).toEqual([]);
        expect(component.autoresTexto()).toBe('');
        expect(component.categoriasIds()).toEqual([]);
        expect(component.categoriasTexto()).toBe('');
        expect(component.etiquetasIds()).toEqual([]);
        expect(component.etiquetasTexto()).toBe('');
      });
    });

    describe('with error loading recurso', () => {
      it('should handle error when loading recurso fails', () => {
        const mockActivatedRoute = {
          snapshot: {
            paramMap: {
              get: jasmine.createSpy('get').and.returnValue('1')
            }
          }
        };
        TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
        recursoService.getById.and.returnValue(throwError(() => new Error('Error')));

        fixture = TestBed.createComponent(FormularioRecursoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.errorGeneral()).toBe('Error al cargar el recurso');
        expect(component.loading()).toBe(false);
      });
    });
  });

  describe('Toggle methods', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    describe('toggleAutor', () => {
      it('should add autor when not selected', () => {
        component.toggleAutor('autor1');
        expect(component.autoresIds()).toContain('autor1');
        expect(component.autoresTexto()).toBe('Autor 1');
      });

      it('should remove autor when already selected', () => {
        component.autoresIds.set(['autor1']);
        component.autoresTexto.set('Autor 1');
        component.toggleAutor('autor1');
        expect(component.autoresIds()).not.toContain('autor1');
        expect(component.autoresTexto()).toBe('');
      });

      it('should handle multiple autores', () => {
        component.toggleAutor('autor1');
        component.toggleAutor('autor2');
        expect(component.autoresIds()).toEqual(['autor1', 'autor2']);
        expect(component.autoresTexto()).toBe('Autor 1, Autor 2');
      });
    });

    describe('toggleCategoria', () => {
      it('should add categoria when not selected', () => {
        component.toggleCategoria('cat1');
        expect(component.categoriasIds()).toContain('cat1');
      });

      it('should remove categoria when already selected', () => {
        component.categoriasIds.set(['cat1']);
        component.toggleCategoria('cat1');
        expect(component.categoriasIds()).not.toContain('cat1');
      });
    });

    describe('toggleEtiqueta', () => {
      it('should add etiqueta when not selected', () => {
        component.toggleEtiqueta('etq1');
        expect(component.etiquetasIds()).toContain('etq1');
        expect(component.etiquetasTexto()).toBe('Barroco');
      });

      it('should remove etiqueta when already selected', () => {
        component.etiquetasIds.set(['etq1']);
        component.etiquetasTexto.set('Barroco');
        component.toggleEtiqueta('etq1');
        expect(component.etiquetasIds()).not.toContain('etq1');
        expect(component.etiquetasTexto()).toBe('');
      });
    });
  });

  describe('Navigation Methods', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should navigate to autores with returnTo param', () => {
      spyOn(router, 'navigate');
      component.irAAutores();
      expect(router.navigate).toHaveBeenCalledWith(['/autores/nuevo'], { queryParams: { returnTo: 'recurso' } });
    });

    it('should navigate to categorias with returnTo param', () => {
      spyOn(router, 'navigate');
      component.irACategorias();
      expect(router.navigate).toHaveBeenCalledWith(['/categorias/nuevo'], { queryParams: { returnTo: 'recurso' } });
    });

    it('should navigate to tipos with returnTo param', () => {
      spyOn(router, 'navigate');
      component.irATipos();
      expect(router.navigate).toHaveBeenCalledWith(['/tipos/nuevo'], { queryParams: { returnTo: 'recurso' } });
    });

    it('should open modal for etiquetas', () => {
      component.irAEtiquetas();
      expect(component.showModalEtiqueta()).toBe(true);
    });
  });

  describe('onTipoChange', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should update tipoId and tipoNombre', () => {
      component.onTipoChange('tipo1');
      expect(component.tipoId()).toBe('tipo1');
      expect(component.tipoNombre()).toBe('Libro');
    });

    it('should clear tipoNombre when tipo not found', () => {
      component.onTipoChange('unknown');
      expect(component.tipoId()).toBe('unknown');
      expect(component.tipoNombre()).toBe('');
    });
  });

  describe('truncarTexto', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should return empty string for empty text', () => {
      expect(component.truncarTexto('')).toBe('');
      expect(component.truncarTexto('   ')).toBe('');
    });

    it('should return same text if shorter than maxLength', () => {
      const texto = 'Texto corto';
      expect(component.truncarTexto(texto, 20)).toBe(texto);
    });

    it('should truncate long text and add count', () => {
      const texto = 'uno, dos, tres, cuatro, cinco';
      const resultado = component.truncarTexto(texto, 15);
      expect(resultado).toMatch(/\+[0-9]+$/);
    });
  });

  describe('Form State Management', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should save state in ngOnDestroy', () => {
      component.titulo.set('Saved title');
      component.autoresTexto.set('Saved author');
      component.autoresIds.set(['autor1']);

      component.ngOnDestroy();

      expect(stateService.setTitulo).toHaveBeenCalledWith('Saved title');
      expect(stateService.setAutores).toHaveBeenCalledWith(['autor1'], 'Saved author');
    });
  });

  describe('Modal Etiqueta', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should close modal when cerrarModalEtiqueta is called', () => {
      component.showModalEtiqueta.set(true);
      component.cerrarModalEtiqueta();
      expect(component.showModalEtiqueta()).toBe(false);
    });

    it('should reload etiquetas when onEtiquetaGuardada is called', () => {
      etiquetaService.getAll.calls.reset();
      component.onEtiquetaGuardada();
      expect(component.showModalEtiqueta()).toBe(false);
      expect(etiquetaService.getAll).toHaveBeenCalled();
    });
  });

  describe('checkDropdownPosition', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should exist and be callable', () => {
      expect(() => component.checkDropdownPosition('autores')).not.toThrow();
      expect(() => component.checkDropdownPosition('categorias')).not.toThrow();
      expect(() => component.checkDropdownPosition('etiquetas')).not.toThrow();
    });
  });

  describe('onDocumentClick', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should be defined', () => {
      expect(component.onDocumentClick).toBeDefined();
    });

    it('should not throw error when called with valid event', () => {
      const mockElement = document.createElement('div');
      mockElement.className = 'outside-element';
      const event = new Event('click');
      Object.defineProperty(event, 'target', { value: mockElement });

      expect(() => component.onDocumentClick(event as MouseEvent)).not.toThrow();
    });
  });

});
