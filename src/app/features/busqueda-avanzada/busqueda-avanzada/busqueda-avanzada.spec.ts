import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BusquedaComponent } from '../../../shared/busqueda/busqueda';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el componente de búsqueda:
describe('BusquedaComponent', () => {

  let component: BusquedaComponent;
  let fixture: ComponentFixture<BusquedaComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BusquedaComponent,
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'busqueda-avanzada', component: DummyComponent },
          { path: 'busqueda-avanzada/autores', component: DummyComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BusquedaComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty termino', () => {
      expect(component.termino()).toBe('');
    });
  });

  describe('Input rutaBusquedaAvanzada', () => {
    it('should have default value "/busqueda-avanzada"', () => {
      expect(component.rutaBusquedaAvanzada()).toBe('/busqueda-avanzada');
    });

    it('should accept custom value', () => {
      fixture.componentRef.setInput('rutaBusquedaAvanzada', '/busqueda-avanzada/autores');
      fixture.detectChanges();
      expect(component.rutaBusquedaAvanzada()).toBe('/busqueda-avanzada/autores');
    });
  });

  describe('onBuscar', () => {
    it('should emit buscar event with current termino', () => {
      spyOn(component.buscar, 'emit');
      component.termino.set('test query');

      component.onBuscar();

      expect(component.buscar.emit).toHaveBeenCalledWith('test query');
    });

    it('should emit empty string when termino is empty', () => {
      spyOn(component.buscar, 'emit');
      component.termino.set('');

      component.onBuscar();

      expect(component.buscar.emit).toHaveBeenCalledWith('');
    });
  });

  describe('limpiar', () => {
    it('should reset termino to empty string', () => {
      component.termino.set('some text');

      component.limpiar();

      expect(component.termino()).toBe('');
    });

    it('should emit buscar event with empty string', () => {
      spyOn(component.buscar, 'emit');
      component.termino.set('some text');

      component.limpiar();

      expect(component.buscar.emit).toHaveBeenCalledWith('');
    });
  });

  describe('onBusquedaAvanzada', () => {
    it('should navigate to default route when no custom route provided', () => {
      spyOn(router, 'navigate');
      component.onBusquedaAvanzada();
      expect(router.navigate).toHaveBeenCalledWith(['/busqueda-avanzada']);
    });

    it('should navigate to custom route when provided', () => {
      spyOn(router, 'navigate');
      fixture.componentRef.setInput('rutaBusquedaAvanzada', '/busqueda-avanzada/autores');
      fixture.detectChanges();

      component.onBusquedaAvanzada();
      expect(router.navigate).toHaveBeenCalledWith(['/busqueda-avanzada/autores']);
    });
  });

  describe('Template rendering', () => {
    it('should render search input', () => {
      const input = fixture.debugElement.nativeElement.querySelector('.search-input');
      expect(input).toBeTruthy();
    });

    it('should update termino when input changes', fakeAsync(() => {
      const input = fixture.debugElement.nativeElement.querySelector('.search-input');
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      tick();

      expect(component.termino()).toBe('new value');
    }));

    it('should call onBuscar when Enter key is pressed in input', () => {
      spyOn(component, 'onBuscar');
      const input = fixture.debugElement.nativeElement.querySelector('.search-input');

      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

      expect(component.onBuscar).toHaveBeenCalled();
    });

    it('should show clear button when termino is not empty', () => {
      component.termino.set('text');
      fixture.detectChanges();

      const clearButton = fixture.debugElement.nativeElement.querySelector('.btn-limpiar');
      expect(clearButton).toBeTruthy();
    });

    it('should not show clear button when termino is empty', () => {
      component.termino.set('');
      fixture.detectChanges();

      const clearButton = fixture.debugElement.nativeElement.querySelector('.btn-limpiar');
      expect(clearButton).toBeFalsy();
    });

    it('should call limpiar when clear button is clicked', () => {
      spyOn(component, 'limpiar');
      component.termino.set('text');
      fixture.detectChanges();

      const clearButton = fixture.debugElement.nativeElement.querySelector('.btn-limpiar');
      expect(clearButton).toBeTruthy();
      clearButton.click();
      expect(component.limpiar).toHaveBeenCalled();
    });

    it('should call onBusquedaAvanzada when btn-busqueda-avanzada is clicked', () => {
      spyOn(component, 'onBusquedaAvanzada');
      const advancedButton = fixture.debugElement.nativeElement.querySelector('.btn-busqueda-avanzada');
      expect(advancedButton).toBeTruthy();
      advancedButton.click();
      expect(component.onBusquedaAvanzada).toHaveBeenCalled();
    });

    it('should render lupa icon with correct src and alt', () => {
      const icon = fixture.debugElement.nativeElement.querySelector('.icon-lupa');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('src')).toBe('assets/images/Lupa.png');
      expect(icon.getAttribute('alt')).toBe('Buscar');
    });
  });

});
