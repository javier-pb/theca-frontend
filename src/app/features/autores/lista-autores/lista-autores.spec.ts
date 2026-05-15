import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { ListaAutoresComponent } from './lista-autores';
import { AutorService, Autor } from '../../../core/services/autor';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para la lista de autores:
describe('ListaAutoresComponent', () => {

  let component: ListaAutoresComponent;
  let fixture: ComponentFixture<ListaAutoresComponent>;
  let autorService: jasmine.SpyObj<AutorService>;
  let router: Router;

  const mockAutores: Autor[] = [
    { id: '1', nombre: 'Gabriel García Márquez' },
    { id: '2', nombre: 'Miguel de Cervantes' },
    { id: '3', nombre: 'Isabel Allende' },
    { id: '4', nombre: '123 Anónimo' },
    { id: '5', nombre: 'Anónimo Especial' }
  ];

  beforeEach(() => {
    autorService = jasmine.createSpyObj('AutorService', ['getAll', 'delete']);
    autorService.getAll.and.returnValue(of(mockAutores));

    TestBed.configureTestingModule({
      imports: [
        ListaAutoresComponent,
        RouterTestingModule.withRoutes([
          { path: 'autores/detalle/1', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: AutorService, useValue: autorService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaAutoresComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    autorService.getAll.calls.reset();
    autorService.delete.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.autores()).toEqual([]);
      expect(component.autoresFiltrados()).toEqual([]);
      expect(component.terminoBusqueda()).toBe('');
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
      expect(component.grupos()).toEqual([]);
    });
  });

  describe('cargarAutores', () => {
    it('should load autores successfully', fakeAsync(() => {
      component.cargarAutores();
      tick();

      expect(autorService.getAll).toHaveBeenCalled();
      expect(component.autores().length).toBe(5);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    }));

    it('should handle error when loading autores', fakeAsync(() => {
      autorService.getAll.and.returnValue(throwError(() => new Error('Error')));

      component.cargarAutores();
      tick();

      expect(component.autores()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar los autores');
    }));
  });

  describe('ngOnInit', () => {
    it('should call cargarAutores on init', () => {
      spyOn(component, 'cargarAutores');
      component.ngOnInit();
      expect(component.cargarAutores).toHaveBeenCalled();
    });
  });

  describe('ordenarAlfabeticamente', () => {
    it('should sort autores alphabetically', () => {
      const desordenadas = [
        { id: '3', nombre: 'Zeta' },
        { id: '1', nombre: 'Alfa' },
        { id: '2', nombre: 'Beta' }
      ];
      const ordenadas = component.ordenarAlfabeticamente(desordenadas as Autor[]);

      expect(ordenadas[0].nombre).toBe('Alfa');
      expect(ordenadas[1].nombre).toBe('Beta');
      expect(ordenadas[2].nombre).toBe('Zeta');
    });
  });

  describe('onBuscar', () => {
    it('should update terminoBusqueda and call filtrarAutores', () => {
      spyOn(component, 'filtrarAutores');

      component.onBuscar('Gabriel');

      expect(component.terminoBusqueda()).toBe('Gabriel');
      expect(component.filtrarAutores).toHaveBeenCalled();
    });
  });

  describe('filtrarAutores', () => {
    beforeEach(() => {
      component.autores.set(mockAutores);
    });

    it('should show all autores when termino is empty', () => {
      component.terminoBusqueda.set('');
      component.filtrarAutores();

      expect(component.autoresFiltrados().length).toBe(5);
    });

    it('should filter autores by name', () => {
      component.terminoBusqueda.set('Gabriel');
      component.filtrarAutores();

      expect(component.autoresFiltrados().length).toBe(1);
      expect(component.autoresFiltrados()[0].nombre).toBe('Gabriel García Márquez');
    });

    it('should filter autores by partial name', () => {
      component.terminoBusqueda.set('Cervantes');
      component.filtrarAutores();

      expect(component.autoresFiltrados().length).toBe(1);
      expect(component.autoresFiltrados()[0].nombre).toBe('Miguel de Cervantes');
    });

    it('should be case insensitive', () => {
      component.terminoBusqueda.set('gabriel');
      component.filtrarAutores();

      expect(component.autoresFiltrados().length).toBe(1);
    });

    it('should return empty array when no matches', () => {
      component.terminoBusqueda.set('Inexistente');
      component.filtrarAutores();

      expect(component.autoresFiltrados().length).toBe(0);
    });
  });

  describe('agruparPorLetra', () => {
    beforeEach(() => {
      component.autoresFiltrados.set(mockAutores);
    });

    it('should group autores by first letter', () => {
      component.agruparPorLetra();

      const grupos = component.grupos();
      expect(grupos.length).toBeGreaterThan(0);
    });

    it('should include group for "Anónimo" for autores with non-letter first char', () => {
      component.autoresFiltrados.set([
        { id: '1', nombre: '123 Test' },
        { id: '2', nombre: '456 Otro' }
      ]);
      component.agruparPorLetra();

      const grupoAnonimo = component.grupos().find(g => g.letra === 'Anónimo');
      expect(grupoAnonimo).toBeTruthy();
      expect(grupoAnonimo?.autores.length).toBe(2);
    });

    it('should sort groups alphabetically', () => {
      component.autoresFiltrados.set([
        { id: '1', nombre: 'Zeta' },
        { id: '2', nombre: 'Alfa' },
        { id: '3', nombre: 'Beta' }
      ]);
      component.agruparPorLetra();

      const letras = component.grupos().map(g => g.letra);
      expect(letras[0]).toBe('A');
      expect(letras[1]).toBe('B');
      expect(letras[2]).toBe('Z');
    });
  });

  describe('abrirBusquedaAvanzada', () => {
    it('should log message', () => {
      const consoleSpy = spyOn(console, 'log');
      component.abrirBusquedaAvanzada();
      expect(consoleSpy).toHaveBeenCalledWith('Búsqueda avanzada - Pendiente de implementar');
    });
  });

  describe('irADetalle', () => {
    it('should navigate to autor detalle', () => {
      spyOn(router, 'navigate');

      component.irADetalle('1');

      expect(router.navigate).toHaveBeenCalledWith(['/autores/detalle', '1']);
    });
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      component.cargarAutores();
      tick();
      fixture.detectChanges();
    }));

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('AUTORES');
    });

    it('should render add button', () => {
      const addButton = fixture.debugElement.nativeElement.querySelector('.btn-anadir');
      expect(addButton).toBeTruthy();
    });

    it('should render busqueda component', () => {
      const busquedaComponent = fixture.debugElement.query(By.css('app-busqueda'));
      expect(busquedaComponent).toBeTruthy();
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

    it('should show empty state when no autores', () => {
      component.autores.set([]);
      component.autoresFiltrados.set([]);
      component.loading.set(false);
      component.error.set('');
      fixture.detectChanges();

      const empty = fixture.debugElement.nativeElement.querySelector('.empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('No hay autores');
    });
  });

});
