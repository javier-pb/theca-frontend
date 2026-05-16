import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { FormularioTipoComponent } from './formulario-tipo';
import { TipoService, Tipo } from '../../../core/services/tipo';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el formulario de tipos:
describe('FormularioTipoComponent', () => {

  let component: FormularioTipoComponent;
  let fixture: ComponentFixture<FormularioTipoComponent>;
  let tipoService: jasmine.SpyObj<TipoService>;
  let router: Router;

  const mockTipo: Tipo = {
    id: '1',
    nombre: 'PDF',
    imagen: 'base64imagedata',
    esPredeterminado: true,
    usuarioId: 'user123'
  };

  const mockTipoPredeterminadoSinImagen: Tipo = {
    id: '2',
    nombre: 'ePub',
    imagen: null,
    esPredeterminado: true,
    usuarioId: 'user123'
  };

  const mockTipoNoPredeterminado: Tipo = {
    id: '3',
    nombre: 'Personalizado',
    imagen: null,
    esPredeterminado: false,
    usuarioId: 'user123'
  };

  const mockTipoCreado = { id: '4', nombre: 'Nuevo Tipo' };

  const setupCreateMode = () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

    fixture = TestBed.createComponent(FormularioTipoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  const setupEditMode = (tipo: Tipo = mockTipo) => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
    tipoService.getById.and.returnValue(of(tipo));

    fixture = TestBed.createComponent(FormularioTipoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    tipoService = jasmine.createSpyObj('TipoService', ['getById', 'create', 'update']);

    await TestBed.configureTestingModule({
      imports: [
        FormularioTipoComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'tipos', component: DummyComponent },
          { path: 'tipos/detalle/4', component: DummyComponent },
          { path: 'recursos/editar/123', component: DummyComponent },
          { path: 'recursos/nuevo', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: TipoService, useValue: tipoService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    tipoService.getById.calls.reset();
    tipoService.create.calls.reset();
    tipoService.update.calls.reset();
    localStorage.clear();
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
      expect(component.tipoId()).toBeNull();
      expect(component.nombre()).toBe('');
      expect(component.imagen()).toBe('');
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    });

    it('should validate required nombre', () => {
      component.nombre.set('');
      component.onSubmit();

      expect(component.error()).toBe('El nombre es obligatorio');
      expect(tipoService.create).not.toHaveBeenCalled();
    });

    it('should create tipo successfully', fakeAsync(() => {
      component.nombre.set('Nuevo Tipo');
      tipoService.create.and.returnValue(of(mockTipoCreado));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(tipoService.create).toHaveBeenCalledWith({
        nombre: 'Nuevo Tipo',
        imagen: ''
      });
      expect(router.navigate).toHaveBeenCalledWith(['/tipos/detalle', '4']);
    }));

    it('should create tipo with imagen', fakeAsync(() => {
      component.nombre.set('Tipo con Imagen');
      component.imagen.set('data:image/png;base64,abc123def456');
      tipoService.create.and.returnValue(of({ id: '5', nombre: 'Tipo con Imagen' }));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      const llamado = tipoService.create.calls.mostRecent();
      expect(llamado.args[0].imagen).toBe('abc123def456');
      expect(router.navigate).toHaveBeenCalled();
    }));

    it('should handle 400 error when nombre already exists', fakeAsync(() => {
      component.nombre.set('PDF');
      const errorMessage = 'Ya existe un tipo con el nombre \'PDF\'';
      tipoService.create.and.returnValue(throwError(() => ({ status: 400, error: errorMessage })));

      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe(errorMessage);
    }));

    it('should handle generic create error', fakeAsync(() => {
      component.nombre.set('Nuevo Tipo');
      tipoService.create.and.returnValue(throwError(() => ({ status: 500 })));

      component.onSubmit();
      tick();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al crear el tipo');
    }));
  });

  describe('Edit Mode', () => {
    describe('with tipo having imagen', () => {
      beforeEach(() => {
        setupEditMode(mockTipo);
      });

      it('should be in edit mode', () => {
        expect(component.esEdicion()).toBe(true);
        expect(component.tipoId()).toBe('1');
      });

      it('should load tipo data', () => {
        expect(component.nombre()).toBe('PDF');
        expect(component.imagen()).toBe('data:image/jpeg;base64,base64imagedata');
      });
    });

    describe('with predeterminado tipo without imagen', () => {
      beforeEach(() => {
        setupEditMode(mockTipoPredeterminadoSinImagen);
      });

      it('should load predeterminado tipo with assets image', () => {
        expect(component.nombre()).toBe('ePub');
        expect(component.imagen()).toBe('assets/images/ePub.png');
      });
    });

    describe('with no predeterminado tipo without imagen', () => {
      beforeEach(() => {
        setupEditMode(mockTipoNoPredeterminado);
      });

      it('should load tipo with empty imagen', () => {
        expect(component.nombre()).toBe('Personalizado');
        expect(component.imagen()).toBe('');
      });
    });

    describe('update functionality', () => {
      beforeEach(() => {
        setupEditMode(mockTipo);
      });

      it('should update tipo successfully keeping existing imagen', fakeAsync(() => {
        component.nombre.set('PDF Actualizado');
        tipoService.update.and.returnValue(of({ id: '1', nombre: 'PDF Actualizado' }));
        spyOn(router, 'navigate');

        component.onSubmit();
        tick();

        expect(tipoService.update).toHaveBeenCalledWith('1', {
          nombre: 'PDF Actualizado',
          imagen: 'base64imagedata'
        });
        expect(router.navigate).toHaveBeenCalledWith(['/tipos/detalle', '1']);
      }));

      it('should update tipo with new imagen', fakeAsync(() => {
        component.imagen.set('data:image/png;base64,nuevaImagen123');
        tipoService.update.and.returnValue(of({ id: '1', nombre: 'PDF' }));
        spyOn(router, 'navigate');

        component.onSubmit();
        tick();

        const llamado = tipoService.update.calls.mostRecent();
        expect(llamado.args[1].imagen).toBe('nuevaImagen123');
      }));

      it('should update tipo and remove imagen when imagen is cleared', fakeAsync(() => {
        component.nombre.set('PDF Actualizado');
        component.eliminarImagen();
        tipoService.update.and.returnValue(of({ id: '1', nombre: 'PDF Actualizado' }));
        spyOn(router, 'navigate');

        component.onSubmit();
        tick();

        expect(tipoService.update).toHaveBeenCalledWith('1', {
          nombre: 'PDF Actualizado',
          imagen: ''
        });
        expect(router.navigate).toHaveBeenCalledWith(['/tipos/detalle', '1']);
      }));

      it('should not send assets image to backend', fakeAsync(() => {
        component.imagen.set('assets/images/PDF.png');
        tipoService.update.and.returnValue(of({ id: '1', nombre: 'PDF' }));
        spyOn(router, 'navigate');

        component.onSubmit();
        tick();

        const llamado = tipoService.update.calls.mostRecent();
        expect(llamado.args[1].imagen).toBe('');
      }));

      it('should handle update error', fakeAsync(() => {
        component.nombre.set('PDF Actualizado');
        tipoService.update.and.returnValue(throwError(() => ({ status: 500 })));

        component.onSubmit();
        tick();

        expect(component.loading()).toBe(false);
        expect(component.error()).toBe('Error al actualizar el tipo');
      }));

      it('should handle 400 error on update', fakeAsync(() => {
        component.nombre.set('PDF');
        const errorMessage = 'Ya existe un tipo con el nombre \'PDF\'';
        tipoService.update.and.returnValue(throwError(() => ({ status: 400, error: errorMessage })));

        component.onSubmit();
        tick();

        expect(component.error()).toBe(errorMessage);
      }));
    });

    describe('error handling in cargarTipo', () => {
      it('should handle error when loading tipo fails', () => {
        tipoService.getById.and.returnValue(throwError(() => new Error('Error')));

        const mockActivatedRoute = {
          snapshot: {
            paramMap: {
              get: jasmine.createSpy('get').and.returnValue('1')
            }
          }
        };
        TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

        fixture = TestBed.createComponent(FormularioTipoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.error()).toBe('Error al cargar el tipo');
        expect(component.loading()).toBe(false);
      });
    });
  });

  describe('Return to Recurso functionality', () => {
    it('should initialize returnToRecurso from localStorage', () => {
      localStorage.setItem('returnToRecurso', 'true');
      localStorage.setItem('recursoId', '123');
      setupCreateMode();

      expect(component.returnToRecurso()).toBe(true);
      expect(component.recursoIdRetorno()).toBe('123');
    });

    it('should navigate back to recurso edit after creating tipo', fakeAsync(() => {
      localStorage.setItem('returnToRecurso', 'true');
      localStorage.setItem('recursoId', '123');
      setupCreateMode();

      component.nombre.set('Tipo desde recurso');
      tipoService.create.and.returnValue(of({ id: '4', nombre: 'Tipo desde recurso' }));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/recursos/editar', '123']);
      expect(localStorage.getItem('returnToRecurso')).toBeNull();
      expect(localStorage.getItem('recursoId')).toBeNull();
    }));

    it('should navigate to recursos/nuevo if no recursoId', fakeAsync(() => {
      localStorage.setItem('returnToRecurso', 'true');
      localStorage.removeItem('recursoId');
      setupCreateMode();

      component.nombre.set('Tipo desde recurso nuevo');
      tipoService.create.and.returnValue(of({ id: '4', nombre: 'Tipo desde recurso nuevo' }));
      spyOn(router, 'navigate');

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/recursos/nuevo']);
    }));
  });

  describe('Image handling', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    describe('getImagenUrl', () => {
      it('should return null when imagen is null', () => {
        expect(component.getImagenUrl(null)).toBeNull();
      });

      it('should return null when imagen is undefined', () => {
        expect(component.getImagenUrl(undefined)).toBeNull();
      });

      it('should return http URL as is', () => {
        const url = 'https://example.com/image.jpg';
        expect(component.getImagenUrl(url)).toBe(url);
      });

      it('should return data URL as is', () => {
        const dataUrl = 'data:image/png;base64,abc123';
        expect(component.getImagenUrl(dataUrl)).toBe(dataUrl);
      });

      it('should convert base64 string to data URL', () => {
        const base64 = 'abc123def456';
        expect(component.getImagenUrl(base64)).toBe('data:image/jpeg;base64,abc123def456');
      });
    });

    describe('onFileSelected', () => {
      it('should handle file selection and convert to base64', fakeAsync(() => {
        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        const event = { target: { files: [file] } } as any;
        const readerSpy = spyOn(FileReader.prototype, 'readAsDataURL');

        component.onFileSelected(event);

        expect(readerSpy).toHaveBeenCalled();
      }));

      it('should not process when no file selected', () => {
        const event = { target: { files: [] } } as any;
        const readerSpy = spyOn(FileReader.prototype, 'readAsDataURL');

        component.onFileSelected(event);

        expect(readerSpy).not.toHaveBeenCalled();
      });
    });

    describe('eliminarImagen', () => {
      it('should clear imagen', () => {
        component.imagen.set('some-image');
        component.eliminarImagen();
        expect(component.imagen()).toBe('');
      });
    });

    describe('abrirSelectorArchivo', () => {
      it('should open file selector', () => {
        const clickSpy = jasmine.createSpy('click');
        const mockInput = { click: clickSpy };
        spyOn(document, 'getElementById').and.returnValue(mockInput as any);

        component.abrirSelectorArchivo();

        expect(clickSpy).toHaveBeenCalled();
      });

      it('should not throw when input not found', () => {
        spyOn(document, 'getElementById').and.returnValue(null);

        expect(() => component.abrirSelectorArchivo()).not.toThrow();
      });
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      setupCreateMode();
    });

    it('should render title for create mode', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title.textContent).toContain('AÑADIR TIPO');
    });

    it('should render nombre input', () => {
      const input = fixture.debugElement.nativeElement.querySelector('input[name="nombre"]');
      expect(input).toBeTruthy();
    });

    it('should render edit image button', () => {
      const editButton = fixture.debugElement.nativeElement.querySelector('.btn-edit-imagen');
      expect(editButton).toBeTruthy();
    });

    it('should render submit button', () => {
      const submitButton = fixture.debugElement.nativeElement.querySelector('.btn-guardar');
      expect(submitButton).toBeTruthy();
    });

    it('should show loading state when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const loading = fixture.debugElement.nativeElement.querySelector('.loading');
      expect(loading).toBeTruthy();
    });

    it('should show error state when error', () => {
      component.error.set('Error de prueba');
      fixture.detectChanges();

      const error = fixture.debugElement.nativeElement.querySelector('.error');
      expect(error).toBeTruthy();
    });
  });

  describe('Edit mode template', () => {
    beforeEach(() => {
      setupEditMode(mockTipo);
    });

    it('should render title for edit mode', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title.textContent).toContain('EDITAR TIPO');
    });
  });

});
