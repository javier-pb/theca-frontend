import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { delay, of, throwError } from 'rxjs';

import { ModalEtiquetaComponent } from './modal-etiqueta';
import { EtiquetaService } from '../../../core/services/etiqueta';

// Test unirario para el modal de etiquetas:
describe('ModalEtiquetaComponent', () => {
  let component: ModalEtiquetaComponent;
  let fixture: ComponentFixture<ModalEtiquetaComponent>;
  let etiquetaService: jasmine.SpyObj<EtiquetaService>;

  const mockEtiqueta = {
    id: '1',
    nombre: 'Angular'
  };

  beforeEach(async () => {
    etiquetaService = jasmine.createSpyObj('EtiquetaService', ['create', 'update']);

    await TestBed.configureTestingModule({
      imports: [ModalEtiquetaComponent, HttpClientTestingModule],
      providers: [
        { provide: EtiquetaService, useValue: etiquetaService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalEtiquetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    etiquetaService.create.calls.reset();
    etiquetaService.update.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.modo).toBe('crear');
      expect(component.etiqueta).toBeNull();
      expect(component.nombre()).toBe('');
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('should set nombre when in edit mode with etiqueta', () => {
      component.modo = 'editar';
      component.etiqueta = mockEtiqueta;
      component.ngOnInit();

      expect(component.nombre()).toBe('Angular');
    });

    it('should not set nombre when in create mode', () => {
      component.modo = 'crear';
      component.etiqueta = mockEtiqueta;
      component.ngOnInit();

      expect(component.nombre()).toBe('');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.nombre.set('React');
    });

    describe('Create mode', () => {
      beforeEach(() => {
        component.modo = 'crear';
      });

      it('should call create service when nombre is valid', fakeAsync(() => {
        etiquetaService.create.and.returnValue(of({ id: '2', nombre: 'React' }));
        spyOn(component.guardado, 'emit');

        component.onSubmit();
        tick();

        expect(etiquetaService.create).toHaveBeenCalledWith({ nombre: 'React' });
        expect(component.guardado.emit).toHaveBeenCalled();
        expect(component.loading()).toBe(false);
      }));

      it('should show error when nombre is empty', () => {
        component.nombre.set('');

        component.onSubmit();

        expect(component.error()).toBe('El nombre es obligatorio');
        expect(etiquetaService.create).not.toHaveBeenCalled();
      });

      it('should set loading to true during submission', () => {
        component.nombre.set('React');
        etiquetaService.create.and.returnValue(of({ id: '2', nombre: 'React' }).pipe(delay(100)));

        component.onSubmit();

        expect(component.loading()).toBe(true);
      });

      it('should handle error with status 400', fakeAsync(() => {
        etiquetaService.create.and.returnValue(throwError(() => ({
          status: 400,
          error: 'Ya existe una etiqueta con el nombre \'React\''
        })));

        component.onSubmit();
        tick();

        expect(component.loading()).toBe(false);
        expect(component.error()).toBe('Ya existe una etiqueta con el nombre \'React\'');
      }));

      it('should handle generic creation error', fakeAsync(() => {
        etiquetaService.create.and.returnValue(throwError(() => ({ status: 500 })));

        component.onSubmit();
        tick();

        expect(component.loading()).toBe(false);
        expect(component.error()).toBe('Error al crear la etiqueta');
      }));
    });

    describe('Edit mode', () => {
      beforeEach(() => {
        component.modo = 'editar';
        component.etiqueta = mockEtiqueta;
      });

      it('should call update service when nombre is valid', fakeAsync(() => {
        etiquetaService.update.and.returnValue(of({ id: '1', nombre: 'Angular 17' }));
        spyOn(component.guardado, 'emit');

        component.onSubmit();
        tick();

        expect(etiquetaService.update).toHaveBeenCalledWith('1', { nombre: 'React' });
        expect(component.guardado.emit).toHaveBeenCalled();
        expect(component.loading()).toBe(false);
      }));

      it('should show error when nombre is empty', () => {
        component.nombre.set('');

        component.onSubmit();

        expect(component.error()).toBe('El nombre es obligatorio');
        expect(etiquetaService.update).not.toHaveBeenCalled();
      });

      it('should handle error with status 400', fakeAsync(() => {
        etiquetaService.update.and.returnValue(throwError(() => ({
          status: 400,
          error: 'Ya existe una etiqueta con el nombre \'React\''
        })));

        component.onSubmit();
        tick();

        expect(component.loading()).toBe(false);
        expect(component.error()).toBe('Ya existe una etiqueta con el nombre \'React\'');
      }));

      it('should handle generic update error', fakeAsync(() => {
        etiquetaService.update.and.returnValue(throwError(() => ({ status: 500 })));

        component.onSubmit();
        tick();

        expect(component.loading()).toBe(false);
        expect(component.error()).toBe('Error al actualizar la etiqueta');
      }));
    });
  });

  describe('cancelar', () => {
    it('should emit cerrar event', () => {
      spyOn(component.cerrar, 'emit');

      component.cancelar();

      expect(component.cerrar.emit).toHaveBeenCalled();
    });
  });

  describe('Template rendering', () => {
    it('should render title for create mode', () => {
      component.modo = 'crear';
      fixture.detectChanges();

      const title = fixture.debugElement.nativeElement.querySelector('.modal-title');
      expect(title.textContent).toContain('AÑADIR ETIQUETA');
    });

    it('should render title for edit mode', () => {
      component.modo = 'editar';
      fixture.detectChanges();

      const title = fixture.debugElement.nativeElement.querySelector('.modal-title');
      expect(title.textContent).toContain('EDITAR ETIQUETA');
    });

    it('should render nombre input', () => {
      const input = fixture.debugElement.nativeElement.querySelector('input');
      expect(input).toBeTruthy();
      expect(input.placeholder).toBe('Nombre de la etiqueta');
    });

    it('should bind nombre to input value', fakeAsync(() => {
      component.nombre.set('Test');
      fixture.detectChanges();
      tick();

      const input = fixture.debugElement.nativeElement.querySelector('input');
      expect(input.value).toBe('Test');
    }));

    it('should render submit button', () => {
      const button = fixture.debugElement.nativeElement.querySelector('.btn-guardar');
      expect(button).toBeTruthy();
    });

    it('should update button text for create mode', () => {
      component.modo = 'crear';
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector('.btn-guardar');
      expect(button.textContent).toContain('Añadir etiqueta');
    });

    it('should update button text for edit mode', () => {
      component.modo = 'editar';
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector('.btn-guardar');
      expect(button.textContent).toContain('Actualizar etiqueta');
    });

    it('should disable button when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector('.btn-guardar');
      expect(button.disabled).toBe(true);
    });

    it('should show loading text on button when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const button = fixture.debugElement.nativeElement.querySelector('.btn-guardar');
      expect(button.textContent).toContain('Guardando...');
    });

    it('should show error message when error is set', () => {
      component.error.set('Error de prueba');
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.nativeElement.querySelector('.error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toContain('Error de prueba');
    });

    it('should call onSubmit when enter key is pressed in input', () => {
      spyOn(component, 'onSubmit');
      const input = fixture.debugElement.nativeElement.querySelector('input');

      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should call onSubmit when submit button is clicked', () => {
      spyOn(component, 'onSubmit');
      const button = fixture.debugElement.nativeElement.querySelector('.btn-guardar');

      button.click();

      expect(component.onSubmit).toHaveBeenCalled();
    });
  });

});
