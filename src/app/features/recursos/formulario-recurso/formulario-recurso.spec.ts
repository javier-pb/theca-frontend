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
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el formulario de recurso:
describe('FormularioRecursoComponent', () => {

  let component: FormularioRecursoComponent;
  let fixture: ComponentFixture<FormularioRecursoComponent>;
  let recursoService: jasmine.SpyObj<RecursoService>;
  let authService: jasmine.SpyObj<AuthService>;
  let stateService: jasmine.SpyObj<FormRecursoStateService>;
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

  const mockRecursoData = {
    id: '1',
    titulo: 'Recurso existente',
    descripcion: 'Descripción existente',
    enlace: 'https://ejemplo.com',
    version: '2.0',
    portada: 'portada123',
    tipo: { id: 'tipo1', nombre: 'Libro' },
    autores: [{ id: '1', nombre: 'Autor 1' }],
    categorias: [{ id: '1', nombre: 'Cat 1' }],
    etiquetas: [{ id: '1', nombre: 'Tag 1' }]
  };

  beforeEach(async () => {
    recursoService = jasmine.createSpyObj('RecursoService', ['create', 'update', 'getById']);
    authService = jasmine.createSpyObj('AuthService', ['getUserId', 'getToken']);
    stateService = jasmine.createSpyObj('FormRecursoStateService', [
      'getState', 'clearState', 'setTitulo', 'setAutores', 'setPortada', 'setTipo',
      'setVersion', 'setDescripcion', 'setEnlace', 'setCategorias', 'setEtiquetas'
    ]);

    stateService.getState.and.returnValue(signal(mockState));
    authService.getUserId.and.returnValue('user123');
    authService.getToken.and.returnValue('fake-token');

    await TestBed.configureTestingModule({
      imports: [
        FormularioRecursoComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'recursos', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: RecursoService, useValue: recursoService },
        { provide: AuthService, useValue: authService },
        { provide: FormRecursoStateService, useValue: stateService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    recursoService.create.calls.reset();
    recursoService.update.calls.reset();
    recursoService.getById.calls.reset();
  });

  describe('Create Mode', () => {
    beforeEach(() => {
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

    it('should initialize arrays as empty', () => {
      expect(component.autoresIds()).toEqual([]);
      expect(component.categoriasIds()).toEqual([]);
      expect(component.etiquetasIds()).toEqual([]);
      expect(component.categoriasTexto()).toEqual([]);
      expect(component.etiquetasTexto()).toEqual([]);
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

      it('should accept valid title', () => {
        component.titulo.set('Valid Title');
        expect(component.validarCampos()).toBe(true);
        expect(component.errorTitulo()).toBe('');
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
        component.descripcion.set('Test description');
        recursoService.create.and.returnValue(of({ id: '1' }));
      });

      it('should create resource with valid data', fakeAsync(() => {
        component.onSubmit();
        tick();

        expect(recursoService.create).toHaveBeenCalled();
        expect(stateService.clearState).toHaveBeenCalled();
      }));

      it('should include userId in DTO', fakeAsync(() => {
        component.onSubmit();
        tick();

        const called = recursoService.create.calls.mostRecent();
        const sentDto = called.args[0];

        expect(sentDto.usuarioId).toBe('user123');
        expect(sentDto.titulo).toBe('New Resource');
      }));

      it('should send empty arrays for relationships when no selection', fakeAsync(() => {
        component.onSubmit();
        tick();

        const called = recursoService.create.calls.mostRecent();
        const sentDto = called.args[0];

        expect(sentDto.autoresIds).toEqual([]);
        expect(sentDto.categoriasIds).toEqual([]);
        expect(sentDto.etiquetasIds).toEqual([]);
        expect(sentDto.tiposIds).toEqual([]);
      }));

      it('should process cover image correctly', fakeAsync(() => {
        component.portada.set('data:image/png;base64,abc123def456');
        component.onSubmit();
        tick();

        const called = recursoService.create.calls.mostRecent();
        const sentDto = called.args[0];
        expect(sentDto.portada).toBe('abc123def456');
      }));

      it('should handle empty cover image', fakeAsync(() => {
        component.portada.set(null);
        component.onSubmit();
        tick();

        const called = recursoService.create.calls.mostRecent();
        const sentDto = called.args[0];
        expect(sentDto.portada).toBe('');
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

      it('should set loading to true during creation', () => {
        component.onSubmit();
        expect(component.loading()).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should not submit if validation fails', () => {
        component.titulo.set('');
        component.onSubmit();

        expect(recursoService.create).not.toHaveBeenCalled();
        expect(component.errorTitulo()).toBe('El título es obligatorio');
      });

      it('should handle getUserId returning null', fakeAsync(() => {
        authService.getUserId.and.returnValue(null);
        component.titulo.set('Test Resource');
        recursoService.create.and.returnValue(of({ id: '1' }));

        component.onSubmit();
        tick();

        const called = recursoService.create.calls.mostRecent();
        const sentDto = called.args[0];
        expect(sentDto.usuarioId).toBeNull();
      }));
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      const mockActivatedRoute = {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy('get').and.returnValue('1')
          }
        }
      };

      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

      recursoService.getById.and.returnValue(of(mockRecursoData));
      recursoService.update.and.returnValue(of({}));

      fixture = TestBed.createComponent(FormularioRecursoComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    it('should be in edit mode', () => {
      expect(component.esEdicion()).toBe(true);
      expect(component.recursoId()).toBe('1');
    });

    it('should load resource data', () => {
      expect(component.titulo()).toBe('Recurso existente');
      expect(component.version()).toBe('2.0');
      expect(component.descripcion()).toBe('Descripción existente');
    });

    it('should normalize portada with base64 prefix when loading', () => {
      const dataConPortadaBase64 = {
        ...mockRecursoData,
        portada: 'base64string'
      };
      recursoService.getById.and.returnValue(of(dataConPortadaBase64));

      fixture = TestBed.createComponent(FormularioRecursoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.portada()).toBe('data:image/jpeg;base64,base64string');
    });

    it('should update resource', fakeAsync(() => {
      spyOn(router, 'navigate');
      component.onSubmit();
      tick();

      expect(recursoService.update).toHaveBeenCalledWith('1', jasmine.any(Object));
      expect(stateService.clearState).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/recursos']);
    }));

    it('should handle update error', fakeAsync(() => {
      recursoService.update.and.returnValue(throwError(() => ({ status: 500 })));
      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
      expect(component.errorGeneral()).toBe('Error al actualizar el recurso');
    }));
  });

  describe('Navigation Methods', () => {
    beforeEach(() => {
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
    });

    it('should navigate to autores', () => {
      spyOn(router, 'navigate');
      component.irAAutores();
      expect(router.navigate).toHaveBeenCalledWith(['/autores']);
    });

    it('should navigate to categorias', () => {
      spyOn(router, 'navigate');
      component.irACategorias();
      expect(router.navigate).toHaveBeenCalledWith(['/categorias']);
    });

    it('should navigate to etiquetas', () => {
      spyOn(router, 'navigate');
      component.irAEtiquetas();
      expect(router.navigate).toHaveBeenCalledWith(['/etiquetas']);
    });

    it('should navigate to tipos', () => {
      spyOn(router, 'navigate');
      component.irATipos();
      expect(router.navigate).toHaveBeenCalledWith(['/tipos']);
    });
  });

  describe('Form State Management', () => {
    beforeEach(() => {
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
      fixture.detectChanges();
    });

    it('should save state in ngOnDestroy', () => {
      component.titulo.set('Saved title');
      component.autoresTexto.set('Saved author');

      component.ngOnDestroy();

      expect(stateService.setTitulo).toHaveBeenCalledWith('Saved title');
      expect(stateService.setAutores).toHaveBeenCalledWith([], 'Saved author');
    });
  });

});
