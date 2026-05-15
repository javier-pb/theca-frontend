import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { DetalleTipoComponent } from './detalle-tipo';
import { TipoService, Tipo } from '../../../core/services/tipo';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el detalle de un tipo:
describe('DetalleTipoComponent', () => {
  let component: DetalleTipoComponent;
  let fixture: ComponentFixture<DetalleTipoComponent>;
  let tipoService: jasmine.SpyObj<TipoService>;
  let router: Router;

  const mockTipo: Tipo = {
    id: '1',
    nombre: 'PDF',
    imagen: 'base64imagedata',
    esPredeterminado: true,
    fechaModificacion: '2026-05-15T10:00:00',
    estadoSincronizacion: 'PENDIENTE',
    usuarioId: 'user123'
  };

  const mockTipoSinImagen: Tipo = {
    id: '2',
    nombre: 'ePub',
    imagen: null,
    esPredeterminado: true,
    usuarioId: 'user123'
  };

  const mockRecursos = [
    { id: '1', titulo: 'Recurso con PDF' },
    { id: '2', titulo: 'Otro Recurso' }
  ];

  const setupComponent = (id: string | null = '1') => {
    const mockActivatedRoute = {
      params: id ? of({ id }) : of({})
    };

    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

    fixture = TestBed.createComponent(DetalleTipoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  };

  beforeEach(async () => {
    tipoService = jasmine.createSpyObj('TipoService', [
      'getById', 'getRecursosAsociados', 'delete'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        DetalleTipoComponent,
        RouterTestingModule.withRoutes([
          { path: 'tipos', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: TipoService, useValue: tipoService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    tipoService.getById.calls.reset();
    tipoService.getRecursosAsociados.calls.reset();
    tipoService.delete.calls.reset();
  });

  describe('Component Creation with valid ID', () => {
    let componentInstance: DetalleTipoComponent;

    beforeEach(() => {
      tipoService.getById.and.returnValue(of(mockTipo));
      tipoService.getRecursosAsociados.and.returnValue(of(mockRecursos));

      const mockActivatedRoute = {
        params: of({ id: '1' })
      };

      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

      const newFixture = TestBed.createComponent(DetalleTipoComponent);
      componentInstance = newFixture.componentInstance;
    });

    it('should initialize with default values', () => {
      expect(componentInstance.tipo()).toBeNull();
      expect(componentInstance.recursos()).toEqual([]);
      expect(componentInstance.loading()).toBe(true);
      expect(componentInstance.error()).toBe('');
      expect(componentInstance.mostrarModal()).toBe(false);
    });
  });

  describe('Data Loading', () => {
    beforeEach(() => {
      tipoService.getById.and.returnValue(of(mockTipo));
      tipoService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      setupComponent('1');
      fixture.detectChanges();
    });

    it('should load tipo successfully', () => {
      expect(tipoService.getById).toHaveBeenCalledWith('1');
      expect(component.tipo()).toEqual(mockTipo);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    });

    it('should load recursos asociados successfully', () => {
      expect(tipoService.getRecursosAsociados).toHaveBeenCalledWith('1');
      expect(component.recursos().length).toBe(2);
      expect(component.recursos()[0].titulo).toBe('Recurso con PDF');
    });
  });

  describe('Component Creation without ID', () => {
    beforeEach(() => {
      setupComponent(null);
      fixture.detectChanges();
    });

    it('should show error when no id is provided', () => {
      expect(component.error()).toBe('ID de tipo no encontrado');
      expect(component.loading()).toBe(false);
      expect(component.tipo()).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle error when loading tipo fails', () => {
      tipoService.getById.and.returnValue(throwError(() => new Error('Error')));
      setupComponent('1');
      fixture.detectChanges();

      expect(component.error()).toBe('Error al cargar el tipo');
      expect(component.loading()).toBe(false);
      expect(component.tipo()).toBeNull();
    });

    it('should handle error when loading recursos fails', () => {
      tipoService.getById.and.returnValue(of(mockTipo));
      tipoService.getRecursosAsociados.and.returnValue(throwError(() => new Error('Error')));
      setupComponent('1');
      fixture.detectChanges();

      expect(component.recursos()).toEqual([]);
    });
  });

  describe('getImagenUrl', () => {
    beforeEach(() => {
      tipoService.getById.and.returnValue(of(mockTipo));
      tipoService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      setupComponent('1');
      fixture.detectChanges();
    });

    it('should return empty string when tipo is null', () => {
      expect(component.getImagenUrl(null)).toBe('');
    });

    it('should return data URL when tipo has base64 imagen', () => {
      const result = component.getImagenUrl(mockTipo);
      expect(result).toBe('data:image/jpeg;base64,base64imagedata');
    });

    it('should return http URL as is', () => {
      const tipoConHttp = { ...mockTipo, imagen: 'https://example.com/image.jpg' };
      const result = component.getImagenUrl(tipoConHttp);
      expect(result).toBe('https://example.com/image.jpg');
    });

    it('should return data URL as is', () => {
      const tipoConDataUrl = { ...mockTipo, imagen: 'data:image/png;base64,abc123' };
      const result = component.getImagenUrl(tipoConDataUrl);
      expect(result).toBe('data:image/png;base64,abc123');
    });

    it('should return assets image for predeterminado tipo without imagen', () => {
      const result = component.getImagenUrl(mockTipoSinImagen);
      expect(result).toBe('assets/images/ePub.png');
    });

    it('should return empty string for non-predeterminado tipo without imagen', () => {
      const tipoNoPredeterminado = { ...mockTipo, esPredeterminado: false, imagen: null };
      const result = component.getImagenUrl(tipoNoPredeterminado);
      expect(result).toBe('');
    });
  });

  describe('Delete functionality', () => {
    beforeEach(() => {
      tipoService.getById.and.returnValue(of(mockTipo));
      tipoService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      setupComponent('1');
      fixture.detectChanges();
    });

    it('should open modal when confirmarEliminar is called', () => {
      component.confirmarEliminar();
      expect(component.mostrarModal()).toBe(true);
    });

    it('should close modal when cerrarModal is called', () => {
      component.mostrarModal.set(true);
      component.cerrarModal();
      expect(component.mostrarModal()).toBe(false);
    });

    it('should delete tipo successfully', fakeAsync(() => {
      spyOn(router, 'navigate');
      tipoService.delete.and.returnValue(of(undefined));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(tipoService.delete).toHaveBeenCalledWith('1');
      expect(router.navigate).toHaveBeenCalledWith(['/tipos']);
    }));

    it('should handle error when deleting tipo', fakeAsync(() => {
      tipoService.delete.and.returnValue(throwError(() => ({ status: 500 })));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(component.error()).toBe('Error al eliminar el tipo');
      expect(component.loading()).toBe(false);
      expect(component.mostrarModal()).toBe(false);
    }));

    it('should handle 400 error when deleting predeterminado tipo', fakeAsync(() => {
      const errorMessage = 'No se puede eliminar un tipo predeterminado';
      tipoService.delete.and.returnValue(throwError(() => ({ status: 400, error: errorMessage })));

      component.confirmarEliminar();
      component.eliminar();
      tick();

      expect(component.error()).toBe(errorMessage);
      expect(component.loading()).toBe(false);
      expect(component.mostrarModal()).toBe(false);
    }));

    it('should not delete when tipo has no id', () => {
      component.tipo.set({ ...mockTipo, id: undefined });
      component.eliminar();

      expect(tipoService.delete).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      tipoService.getById.and.returnValue(of(mockTipo));
      tipoService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      setupComponent('1');
      fixture.detectChanges();
    });

    it('should unsubscribe from route params on destroy', () => {
      const subscriptionSpy = spyOn(component['routeSubscription']!, 'unsubscribe');
      component.ngOnDestroy();
      expect(subscriptionSpy).toHaveBeenCalled();
    });
  });

  describe('Template rendering', () => {
    beforeEach(() => {
      tipoService.getById.and.returnValue(of(mockTipo));
      tipoService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      setupComponent('1');
      fixture.detectChanges();
    });

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('DETALLE DEL TIPO');
    });

    it('should display tipo nombre', () => {
      const nombreElement = fixture.debugElement.nativeElement.querySelector('.info-group:nth-child(2) .info-value');
      expect(nombreElement.textContent).toContain('PDF');
    });

    it('should display number of recursos', () => {
      const numeroElement = fixture.debugElement.nativeElement.querySelector('.info-group:nth-child(3) .info-value');
      expect(numeroElement.textContent).toContain('2');
    });

    it('should display recursos list', () => {
      const recursosList = fixture.debugElement.nativeElement.querySelectorAll('.recurso-link');
      expect(recursosList.length).toBe(2);
      expect(recursosList[0].textContent).toContain('Recurso con PDF');
    });

    it('should render editar button', () => {
      const editarBtn = fixture.debugElement.query(By.css('.btn-editar'));
      expect(editarBtn).toBeTruthy();
      expect(editarBtn.nativeElement).toBeTruthy();
    });

    it('should render eliminar button', () => {
      const eliminarBtn = fixture.debugElement.nativeElement.querySelector('.btn-eliminar');
      expect(eliminarBtn).toBeTruthy();
    });

    it('should show loading state when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const loading = fixture.debugElement.nativeElement.querySelector('.loading');
      expect(loading).toBeTruthy();
    });

    it('should show error state when error', () => {
      component.loading.set(false);
      component.error.set('Error de prueba');
      fixture.detectChanges();

      const error = fixture.debugElement.nativeElement.querySelector('.error');
      expect(error).toBeTruthy();
      expect(error.textContent).toContain('Error de prueba');
    });
  });

  describe('Modal template', () => {
    beforeEach(() => {
      tipoService.getById.and.returnValue(of(mockTipo));
      tipoService.getRecursosAsociados.and.returnValue(of(mockRecursos));
      setupComponent('1');
      fixture.detectChanges();
    });

    it('should not show modal when mostrarModal is false', () => {
      component.mostrarModal.set(false);
      fixture.detectChanges();

      const modal = fixture.debugElement.nativeElement.querySelector('.modal-overlay');
      expect(modal).toBeFalsy();
    });

    it('should show modal when mostrarModal is true', () => {
      component.mostrarModal.set(true);
      fixture.detectChanges();

      const modal = fixture.debugElement.nativeElement.querySelector('.modal-overlay');
      expect(modal).toBeTruthy();
    });

    it('should call cerrarModal when clicking cancel button', () => {
      spyOn(component, 'cerrarModal');
      component.mostrarModal.set(true);
      fixture.detectChanges();

      const cancelBtn = fixture.debugElement.query(By.css('.btn-cancelar'));
      cancelBtn.triggerEventHandler('click', null);

      expect(component.cerrarModal).toHaveBeenCalled();
    });

    it('should call eliminar when clicking confirm button', () => {
      spyOn(component, 'eliminar');
      component.mostrarModal.set(true);
      fixture.detectChanges();

      const confirmBtn = fixture.debugElement.query(By.css('.btn-confirmar'));
      confirmBtn.triggerEventHandler('click', null);

      expect(component.eliminar).toHaveBeenCalled();
    });
  });

});
