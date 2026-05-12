import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { BusquedaComponent } from './busqueda';

// Test unitario para el componente de búsqueda:
describe('BusquedaComponent', () => {
  let component: BusquedaComponent;
  let fixture: ComponentFixture<BusquedaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(BusquedaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty terminoBusqueda', () => {
      expect(component.terminoBusqueda()).toBe('');
    });
  });

  describe('onBuscar', () => {
    it('should emit buscar event with current terminoBusqueda', () => {
      spyOn(component.buscar, 'emit');
      component.terminoBusqueda.set('test query');

      component.onBuscar();

      expect(component.buscar.emit).toHaveBeenCalledWith('test query');
    });

    it('should emit empty string when terminoBusqueda is empty', () => {
      spyOn(component.buscar, 'emit');
      component.terminoBusqueda.set('');

      component.onBuscar();

      expect(component.buscar.emit).toHaveBeenCalledWith('');
    });
  });

  describe('limpiar', () => {
    it('should reset terminoBusqueda to empty string', () => {
      component.terminoBusqueda.set('some text');

      component.limpiar();

      expect(component.terminoBusqueda()).toBe('');
    });

    it('should emit buscar event with empty string', () => {
      spyOn(component.buscar, 'emit');
      component.terminoBusqueda.set('some text');

      component.limpiar();

      expect(component.buscar.emit).toHaveBeenCalledWith('');
    });
  });

  describe('onBusquedaAvanzada', () => {
    it('should emit busquedaAvanzada event', () => {
      spyOn(component.busquedaAvanzada, 'emit');

      component.onBusquedaAvanzada();

      expect(component.busquedaAvanzada.emit).toHaveBeenCalled();
    });
  });

  describe('Template rendering', () => {
    it('should render search input', () => {
      const input = fixture.debugElement.nativeElement.querySelector('.search-input');
      expect(input).toBeTruthy();
    });

    it('should update terminoBusqueda when input changes', fakeAsync(() => {
      const input = fixture.debugElement.nativeElement.querySelector('.search-input');
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      tick();

      expect(component.terminoBusqueda()).toBe('new value');
    }));

    it('should call onBuscar when search button is clicked', () => {
      spyOn(component, 'onBuscar');
      const searchButton = fixture.debugElement.nativeElement.querySelector('.btn-lupa');

      searchButton.click();

      expect(component.onBuscar).toHaveBeenCalled();
    });

    it('should call onBuscar when Enter key is pressed in input', () => {
      spyOn(component, 'onBuscar');
      const input = fixture.debugElement.nativeElement.querySelector('.search-input');

      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

      expect(component.onBuscar).toHaveBeenCalled();
    });

    it('should show clear button when terminoBusqueda is not empty', () => {
      component.terminoBusqueda.set('text');
      fixture.detectChanges();

      const clearButton = fixture.debugElement.nativeElement.querySelector('.btn-limpiar');
      expect(clearButton).toBeTruthy();
    });

    it('should not show clear button when terminoBusqueda is empty', () => {
      component.terminoBusqueda.set('');
      fixture.detectChanges();

      const clearButton = fixture.debugElement.nativeElement.querySelector('.btn-limpiar');
      expect(clearButton).toBeFalsy();
    });

    it('should call limpiar when clear button is clicked', () => {
      spyOn(component, 'limpiar');
      component.terminoBusqueda.set('text');
      fixture.detectChanges();

      const clearButton = fixture.debugElement.nativeElement.querySelector('.btn-limpiar');
      clearButton.click();

      expect(component.limpiar).toHaveBeenCalled();
    });

    it('should call onBusquedaAvanzada when advanced search button is clicked', () => {
      spyOn(component, 'onBusquedaAvanzada');
      const advancedButton = fixture.debugElement.nativeElement.querySelector('.btn-busqueda-avanzada');

      advancedButton.click();

      expect(component.onBusquedaAvanzada).toHaveBeenCalled();
    });

    it('should render search icon', () => {
      const icon = fixture.debugElement.nativeElement.querySelector('.icon-lupa');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('src')).toBe('assets/images/Lupa.png');
      expect(icon.getAttribute('alt')).toBe('Buscar');
    });
  });

});
