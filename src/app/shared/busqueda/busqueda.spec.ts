import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { BusquedaComponent } from './busqueda';
import { GlobalSearchService, SearchResult } from '../../core/services/global-search';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para el componente de búsqueda:
describe('BusquedaComponent', () => {

  let component: BusquedaComponent;
  let fixture: ComponentFixture<BusquedaComponent>;
  let router: Router;
  let globalSearchService: jasmine.SpyObj<GlobalSearchService>;

  const mockResultados: SearchResult[] = [
    { id: '1', titulo: 'El Quijote', tipo: 'recurso', ruta: '/recursos/detalle/1', autores: 'Miguel de Cervantes' },
    { id: '2', titulo: 'Literatura', tipo: 'categoria', ruta: '/categorias/detalle/2' }
  ];

  beforeEach(async () => {
    globalSearchService = jasmine.createSpyObj('GlobalSearchService', ['buscar']);
    globalSearchService.buscar.and.returnValue(of(mockResultados));

    await TestBed.configureTestingModule({
      imports: [
        BusquedaComponent,
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'busqueda-avanzada', component: DummyComponent },
          { path: 'busqueda-avanzada/autores', component: DummyComponent },
          { path: 'recursos/detalle/1', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: GlobalSearchService, useValue: globalSearchService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BusquedaComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    globalSearchService.buscar.calls.reset();
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

  describe('Búsqueda reactiva', () => {
    it('should not search when termino has less than 2 characters', fakeAsync(() => {
      component.termino.set('a');
      fixture.detectChanges(); // 🔴 Forzar detección de cambios
      tick(400);
      expect(globalSearchService.buscar).not.toHaveBeenCalled();
      expect(component.resultados()).toEqual([]);
      expect(component.mostrarDropdown()).toBe(false);
      discardPeriodicTasks();
    }));

    it('should search when termino has 2 or more characters', fakeAsync(() => {
      component.termino.set('qu');
      fixture.detectChanges();
      tick(400);

      expect(globalSearchService.buscar).toHaveBeenCalledWith('qu');
      expect(component.resultados()).toEqual(mockResultados);
      expect(component.mostrarDropdown()).toBe(true);
      discardPeriodicTasks();
    }));

    it('should debounce search when typing quickly', fakeAsync(() => {
      component.termino.set('q');
      fixture.detectChanges();
      tick(100);
      component.termino.set('qu');
      fixture.detectChanges();
      tick(100);
      component.termino.set('que');
      fixture.detectChanges();
      tick(100);
      component.termino.set('quel');
      fixture.detectChanges();
      tick(400);

      expect(globalSearchService.buscar).toHaveBeenCalledTimes(1);
      expect(globalSearchService.buscar).toHaveBeenCalledWith('quel');
      discardPeriodicTasks();
    }));

    it('should clear resultados when termino becomes empty', fakeAsync(() => {
      component.termino.set('test');
      fixture.detectChanges();
      tick(400);
      expect(component.resultados().length).toBe(2);

      component.termino.set('');
      fixture.detectChanges();
      tick(400);

      expect(component.resultados()).toEqual([]);
      expect(component.mostrarDropdown()).toBe(false);
      discardPeriodicTasks();
    }));
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
      component.resultados.set(mockResultados);
      component.mostrarDropdown.set(true);

      component.limpiar();

      expect(component.termino()).toBe('');
      expect(component.resultados()).toEqual([]);
      expect(component.mostrarDropdown()).toBe(false);
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

    it('should close dropdown before navigating', () => {
      component.mostrarDropdown.set(true);
      spyOn(router, 'navigate');

      component.onBusquedaAvanzada();

      expect(component.mostrarDropdown()).toBe(false);
    });
  });

  describe('seleccionarResultado', () => {
    it('should navigate to resultado ruta', () => {
      spyOn(router, 'navigate');
      const resultado = mockResultados[0];

      component.seleccionarResultado(resultado);

      expect(router.navigate).toHaveBeenCalledWith([resultado.ruta]);
      expect(component.termino()).toBe('');
      expect(component.resultados()).toEqual([]);
      expect(component.mostrarDropdown()).toBe(false);
    });
  });

  describe('realizarBusqueda - error handling', () => {
    it('should handle error when search fails', fakeAsync(() => {
      globalSearchService.buscar.and.returnValue(throwError(() => new Error('Error')));

      component.termino.set('test');
      fixture.detectChanges();
      tick(400);

      expect(component.resultados()).toEqual([]);
      expect(component.buscando()).toBe(false);
      expect(component.mostrarDropdown()).toBe(false);
      discardPeriodicTasks();
    }));
  });

  describe('Template rendering', () => {
    it('should render search input with class search-input', () => {
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

    it('should show clear button when termino is not empty', fakeAsync(() => {
      component.termino.set('text');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const clearButton = fixture.debugElement.nativeElement.querySelector('.btn-limpiar');
      expect(clearButton).toBeTruthy();
      expect(clearButton.textContent).toContain('✕');
    }));

    it('should not show clear button when termino is empty', () => {
      component.termino.set('');
      fixture.detectChanges();

      const clearButton = fixture.debugElement.nativeElement.querySelector('.btn-limpiar');
      expect(clearButton).toBeFalsy();
    });

    it('should call limpiar when clear button is clicked', fakeAsync(() => {
      spyOn(component, 'limpiar');
      component.termino.set('text');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const clearButton = fixture.debugElement.nativeElement.querySelector('.btn-limpiar');
      expect(clearButton).toBeTruthy();
      clearButton.click();

      expect(component.limpiar).toHaveBeenCalled();
    }));

    it('should call onBusquedaAvanzada when advanced button is clicked', () => {
      spyOn(component, 'onBusquedaAvanzada');
      const advancedButton = fixture.debugElement.nativeElement.querySelector('.btn-busqueda-avanzada');
      expect(advancedButton).toBeTruthy();
      advancedButton.click();
      expect(component.onBusquedaAvanzada).toHaveBeenCalled();
    });

    it('should render lupa icon', () => {
      const icon = fixture.debugElement.nativeElement.querySelector('.icon-lupa');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('src')).toBe('assets/images/Lupa.png');
      expect(icon.getAttribute('alt')).toBe('Buscar');
    });

    it('should show dropdown when there are resultados', fakeAsync(() => {
      component.termino.set('qu');
      fixture.detectChanges();
      tick(400);
      fixture.detectChanges();

      const dropdown = fixture.debugElement.nativeElement.querySelector('.search-dropdown');
      expect(dropdown).toBeTruthy();
      discardPeriodicTasks();
    }));

    it('should show loading indicator when buscando is true', () => {
      component.buscando.set(true);
      component.mostrarDropdown.set(true);
      fixture.detectChanges();

      const loading = fixture.debugElement.nativeElement.querySelector('.dropdown-loading');
      expect(loading).toBeTruthy();
      expect(loading.textContent).toContain('Buscando...');
    });
  });

});
