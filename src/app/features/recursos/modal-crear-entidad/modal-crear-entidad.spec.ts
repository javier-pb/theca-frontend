import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { ModalCrearEntidadComponent } from './modal-crear-entidad';
import { AutorService } from '../../../core/services/autor';
import { CategoriaService } from '../../../core/services/categoria';
import { TipoService } from '../../../core/services/tipo';
import { EtiquetaService } from '../../../core/services/etiqueta';

describe('ModalCrearEntidadComponent', () => {
  let component: ModalCrearEntidadComponent;
  let fixture: ComponentFixture<ModalCrearEntidadComponent>;
  let autorService: jasmine.SpyObj<AutorService>;
  let categoriaService: jasmine.SpyObj<CategoriaService>;
  let tipoService: jasmine.SpyObj<TipoService>;
  let etiquetaService: jasmine.SpyObj<EtiquetaService>;

  const mockEntidadCreada = { id: '123', nombre: 'Nueva Entidad' };

  beforeEach(async () => {
    autorService = jasmine.createSpyObj('AutorService', ['create']);
    categoriaService = jasmine.createSpyObj('CategoriaService', ['create']);
    tipoService = jasmine.createSpyObj('TipoService', ['create']);
    etiquetaService = jasmine.createSpyObj('EtiquetaService', ['create']);

    autorService.create.and.returnValue(of(mockEntidadCreada));
    categoriaService.create.and.returnValue(of(mockEntidadCreada));
    tipoService.create.and.returnValue(of(mockEntidadCreada));
    etiquetaService.create.and.returnValue(of(mockEntidadCreada));

    await TestBed.configureTestingModule({
      imports: [ModalCrearEntidadComponent, FormsModule],
      providers: [
        { provide: AutorService, useValue: autorService },
        { provide: CategoriaService, useValue: categoriaService },
        { provide: TipoService, useValue: tipoService },
        { provide: EtiquetaService, useValue: etiquetaService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCrearEntidadComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    autorService.create.calls.reset();
    categoriaService.create.calls.reset();
    tipoService.create.calls.reset();
    etiquetaService.create.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.nombre()).toBe('');
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    });
  });

  describe('Input tipo', () => {
    it('should accept tipo="autor"', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      fixture.detectChanges();
      expect(component.tipo()).toBe('autor');
    });

    it('should accept tipo="categoria"', () => {
      fixture.componentRef.setInput('tipo', 'categoria');
      fixture.detectChanges();
      expect(component.tipo()).toBe('categoria');
    });

    it('should accept tipo="tipo"', () => {
      fixture.componentRef.setInput('tipo', 'tipo');
      fixture.detectChanges();
      expect(component.tipo()).toBe('tipo');
    });

    it('should accept tipo="etiqueta"', () => {
      fixture.componentRef.setInput('tipo', 'etiqueta');
      fixture.detectChanges();
      expect(component.tipo()).toBe('etiqueta');
    });
  });

  describe('titulo method', () => {
    it('should return "autor" for tipo="autor"', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      fixture.detectChanges();
      expect(component.titulo()).toBe('autor');
    });

    it('should return "categoría" for tipo="categoria"', () => {
      fixture.componentRef.setInput('tipo', 'categoria');
      fixture.detectChanges();
      expect(component.titulo()).toBe('categoría');
    });

    it('should return "tipo" for tipo="tipo"', () => {
      fixture.componentRef.setInput('tipo', 'tipo');
      fixture.detectChanges();
      expect(component.titulo()).toBe('tipo');
    });

    it('should return "etiqueta" for tipo="etiqueta"', () => {
      fixture.componentRef.setInput('tipo', 'etiqueta');
      fixture.detectChanges();
      expect(component.titulo()).toBe('etiqueta');
    });

    it('should return "entidad" for default case', () => {
      fixture.componentRef.setInput('tipo', 'unknown');
      fixture.detectChanges();
      expect(component.titulo()).toBe('entidad');
    });
  });

  describe('cerrar', () => {
    it('should emit cerrarModal event', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      fixture.detectChanges();

      spyOn(component.cerrarModal, 'emit');
      component.cerrar();

      expect(component.cerrarModal.emit).toHaveBeenCalled();
    });
  });

  describe('guardar - Autor', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('tipo', 'autor');
      fixture.detectChanges();
    });

    it('should create autor with nombre', fakeAsync(() => {
      component.nombre.set('Miguel de Cervantes');
      spyOn(component.entidadCreada, 'emit');
      spyOn(component.cerrarModal, 'emit');

      component.guardar();
      tick();

      expect(autorService.create).toHaveBeenCalledWith({ nombre: 'Miguel de Cervantes' });
      expect(component.entidadCreada.emit).toHaveBeenCalledWith(mockEntidadCreada);
      expect(component.cerrarModal.emit).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    }));

    it('should not create if nombre is empty', () => {
      component.nombre.set('');
      component.guardar();

      expect(autorService.create).not.toHaveBeenCalled();
    });

    it('should handle error when create fails', fakeAsync(() => {
      autorService.create.and.returnValue(throwError(() => ({ status: 500, error: 'Error' })));
      component.nombre.set('Autor Test');
      spyOn(component.entidadCreada, 'emit');
      spyOn(component.cerrarModal, 'emit');

      component.guardar();
      tick();

      expect(component.entidadCreada.emit).not.toHaveBeenCalled();
      expect(component.cerrarModal.emit).not.toHaveBeenCalled();
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al crear el autor');
    }));

    it('should handle 400 error with custom message', fakeAsync(() => {
      const errorMessage = 'Ya existe un autor con ese nombre';
      autorService.create.and.returnValue(throwError(() => ({ status: 400, error: errorMessage })));
      component.nombre.set('Autor Test');

      component.guardar();
      tick();

      expect(component.error()).toBe(errorMessage);
    }));
  });

  describe('guardar - Categoria', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('tipo', 'categoria');
      fixture.detectChanges();
    });

    it('should create categoria with nombre', fakeAsync(() => {
      component.nombre.set('Literatura');
      spyOn(component.entidadCreada, 'emit');

      component.guardar();
      tick();

      expect(categoriaService.create).toHaveBeenCalledWith({ nombre: 'Literatura' });
      expect(component.entidadCreada.emit).toHaveBeenCalled();
    }));

    it('should handle error with correct entity name', fakeAsync(() => {
      categoriaService.create.and.returnValue(throwError(() => ({ status: 500 })));
      component.nombre.set('Categoria Test');

      component.guardar();
      tick();

      expect(component.error()).toBe('Error al crear la categoría');
    }));
  });

  describe('guardar - Tipo', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('tipo', 'tipo');
      fixture.detectChanges();
    });

    it('should create tipo with nombre', fakeAsync(() => {
      component.nombre.set('PDF');
      spyOn(component.entidadCreada, 'emit');

      component.guardar();
      tick();

      expect(tipoService.create).toHaveBeenCalledWith({ nombre: 'PDF' });
      expect(component.entidadCreada.emit).toHaveBeenCalled();
    }));

    it('should handle error with correct entity name', fakeAsync(() => {
      tipoService.create.and.returnValue(throwError(() => ({ status: 500 })));
      component.nombre.set('Tipo Test');

      component.guardar();
      tick();

      expect(component.error()).toBe('Error al crear el tipo');
    }));
  });

  describe('guardar - Etiqueta', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('tipo', 'etiqueta');
      fixture.detectChanges();
    });

    it('should create etiqueta with nombre', fakeAsync(() => {
      component.nombre.set('Barroco');
      spyOn(component.entidadCreada, 'emit');

      component.guardar();
      tick();

      expect(etiquetaService.create).toHaveBeenCalledWith({ nombre: 'Barroco' });
      expect(component.entidadCreada.emit).toHaveBeenCalled();
    }));

    it('should handle error with correct entity name (feminine)', fakeAsync(() => {
      etiquetaService.create.and.returnValue(throwError(() => ({ status: 500 })));
      component.nombre.set('Etiqueta Test');

      component.guardar();
      tick();

      expect(component.error()).toBe('Error al crear la etiqueta');
    }));
  });

  describe('Template rendering', () => {
    it('should display correct title for autor', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      fixture.detectChanges();

      const title = fixture.debugElement.nativeElement.querySelector('h3');
      expect(title.textContent).toContain('Crear autor');
    });

    it('should display correct title for categoria', () => {
      fixture.componentRef.setInput('tipo', 'categoria');
      fixture.detectChanges();

      const title = fixture.debugElement.nativeElement.querySelector('h3');
      expect(title.textContent).toContain('Crear categoría');
    });

    it('should display correct title for tipo', () => {
      fixture.componentRef.setInput('tipo', 'tipo');
      fixture.detectChanges();

      const title = fixture.debugElement.nativeElement.querySelector('h3');
      expect(title.textContent).toContain('Crear tipo');
    });

    it('should display correct title for etiqueta', () => {
      fixture.componentRef.setInput('tipo', 'etiqueta');
      fixture.detectChanges();

      const title = fixture.debugElement.nativeElement.querySelector('h3');
      expect(title.textContent).toContain('Crear etiqueta');
    });

    it('should display input with correct placeholder for autor', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      fixture.detectChanges();

      const input = fixture.debugElement.nativeElement.querySelector('input');
      // El placeholder es "Autor" (con primera letra mayúscula)
      expect(input.placeholder).toBe('Autor');
    });

    it('should display input with correct placeholder for categoria', () => {
      fixture.componentRef.setInput('tipo', 'categoria');
      fixture.detectChanges();

      const input = fixture.debugElement.nativeElement.querySelector('input');
      expect(input.placeholder).toBe('Categoría');
    });

    it('should display input with correct placeholder for tipo', () => {
      fixture.componentRef.setInput('tipo', 'tipo');
      fixture.detectChanges();

      const input = fixture.debugElement.nativeElement.querySelector('input');
      expect(input.placeholder).toBe('Tipo');
    });

    it('should display input with correct placeholder for etiqueta', () => {
      fixture.componentRef.setInput('tipo', 'etiqueta');
      fixture.detectChanges();

      const input = fixture.debugElement.nativeElement.querySelector('input');
      expect(input.placeholder).toBe('Etiqueta');
    });

    it('should bind nombre to input', fakeAsync(() => {
      fixture.componentRef.setInput('tipo', 'autor');
      fixture.detectChanges();

      const input = fixture.debugElement.nativeElement.querySelector('input');
      input.value = 'Test Autor';
      input.dispatchEvent(new Event('input'));

      expect(component.nombre()).toBe('Test Autor');
    }));

    it('should show error message when error exists', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      component.error.set('Error de prueba');
      fixture.detectChanges();

      const errorElement = fixture.debugElement.nativeElement.querySelector('.error-mensaje');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Error de prueba');
    });

    it('should not show error message when no error', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      component.error.set('');
      fixture.detectChanges();

      const errorElement = fixture.debugElement.nativeElement.querySelector('.error-mensaje');
      expect(errorElement).toBeFalsy();
    });

    it('should disable crear button when nombre is empty', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      component.nombre.set('');
      fixture.detectChanges();

      const crearButton = fixture.debugElement.nativeElement.querySelector('.btn-crear');
      expect(crearButton.disabled).toBe(true);
    });

    it('should enable crear button when nombre is not empty', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      component.nombre.set('Test');
      fixture.detectChanges();

      const crearButton = fixture.debugElement.nativeElement.querySelector('.btn-crear');
      expect(crearButton.disabled).toBe(false);
    });

    it('should show loading text when loading is true', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      component.loading.set(true);
      fixture.detectChanges();

      const crearButton = fixture.debugElement.nativeElement.querySelector('.btn-crear');
      expect(crearButton.textContent).toContain('Creando...');
    });

    it('should close modal when clicking cancelar button', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      fixture.detectChanges();

      spyOn(component.cerrarModal, 'emit');
      const cancelButton = fixture.debugElement.nativeElement.querySelector('.btn-cancelar');
      cancelButton.click();

      expect(component.cerrarModal.emit).toHaveBeenCalled();
    });

    it('should close modal when clicking overlay', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      fixture.detectChanges();

      spyOn(component.cerrarModal, 'emit');
      const overlay = fixture.debugElement.nativeElement.querySelector('.modal-overlay');
      overlay.click();

      expect(component.cerrarModal.emit).toHaveBeenCalled();
    });

    it('should not close modal when clicking inside modal content', () => {
      fixture.componentRef.setInput('tipo', 'autor');
      fixture.detectChanges();

      spyOn(component.cerrarModal, 'emit');
      const modalContent = fixture.debugElement.nativeElement.querySelector('.modal-content');
      modalContent.click();

      expect(component.cerrarModal.emit).not.toHaveBeenCalled();
    });

    it('should call guardar when pressing Enter in input', fakeAsync(() => {
      fixture.componentRef.setInput('tipo', 'autor');
      component.nombre.set('Test Autor');
      fixture.detectChanges();

      spyOn(component, 'guardar');
      const input = fixture.debugElement.nativeElement.querySelector('input');
      const event = new KeyboardEvent('keyup', { key: 'Enter' });
      input.dispatchEvent(event);

      expect(component.guardar).toHaveBeenCalled();
    }));
  });
});
