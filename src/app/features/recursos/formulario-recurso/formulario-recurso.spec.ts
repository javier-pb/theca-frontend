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

// Tests unitarios para el formulario de recursos:
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

  beforeEach(async () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    recursoService = jasmine.createSpyObj('RecursoService', ['create']);
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
        { provide: FormRecursoStateService, useValue: stateService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioRecursoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    recursoService.create.calls.reset();
  });

  describe('Component Creation', () => {
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

    it('should initialize arrays as empty', () => {
      expect(component.autoresIds()).toEqual([]);
      expect(component.categoriasIds()).toEqual([]);
      expect(component.etiquetasIds()).toEqual([]);
      expect(component.categoriasTexto()).toEqual([]);
      expect(component.etiquetasTexto()).toEqual([]);
    });
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

  describe('Create Mode', () => {
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

    it('should process cover image correctly (remove base64 prefix)', fakeAsync(() => {
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

  describe('Navigation Methods', () => {
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
    it('should save state in ngOnDestroy', () => {
      component.titulo.set('Saved title');
      component.autoresTexto.set('Saved author');

      component.ngOnDestroy();

      expect(stateService.setTitulo).toHaveBeenCalledWith('Saved title');
      expect(stateService.setAutores).toHaveBeenCalledWith([], 'Saved author');
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
