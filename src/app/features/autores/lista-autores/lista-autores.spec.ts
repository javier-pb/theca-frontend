import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { ListaAutoresComponent } from './lista-autores';
import { AutorService, Autor } from '../../../core/services/autor';
import { RecursoService } from '../../../core/services/recurso';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para la lista de autores:
describe('ListaAutoresComponent', () => {

  let component: ListaAutoresComponent;
  let fixture: ComponentFixture<ListaAutoresComponent>;
  let autorService: jasmine.SpyObj<AutorService>;
  let recursoService: jasmine.SpyObj<RecursoService>;
  let router: Router;

  const mockAutores: Autor[] = [
    { id: '1', nombre: 'Gabriel García Márquez' },
    { id: '2', nombre: 'Miguel de Cervantes' },
    { id: '3', nombre: 'Isabel Allende' },
    { id: '4', nombre: '123 Anónimo' },
    { id: '5', nombre: 'Anónimo Especial' }
  ];

  const mockRecursosConSinAutor = [
    { id: '1', titulo: 'Recurso con autor', autores: [{ id: '1' }] },
    { id: '2', titulo: 'Recurso sin autor 1', autores: [] },
    { id: '3', titulo: 'Recurso sin autor 2', autores: null }
  ];

  const mockRecursosTodosConAutor = [
    { id: '1', titulo: 'Recurso 1', autores: [{ id: '1' }] },
    { id: '2', titulo: 'Recurso 2', autores: [{ id: '2' }] }
  ];

  beforeEach(() => {
    autorService = jasmine.createSpyObj('AutorService', ['getAll']);
    recursoService = jasmine.createSpyObj('RecursoService', ['getAll']);

    autorService.getAll.and.returnValue(of(mockAutores));
    recursoService.getAll.and.returnValue(of(mockRecursosConSinAutor));

    TestBed.configureTestingModule({
      imports: [
        ListaAutoresComponent,
        RouterTestingModule.withRoutes([
          { path: 'autores/detalle/1', component: DummyComponent },
          { path: 'autores/detalle/anonimo', component: DummyComponent },
          { path: 'busqueda-avanzada/autores', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: AutorService, useValue: autorService },
        { provide: RecursoService, useValue: recursoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaAutoresComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    autorService.getAll.calls.reset();
    recursoService.getAll.calls.reset();
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
      expect(component.mostrarAnonimo()).toBe(false);
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

  describe('verificarRecursosSinAutor', () => {
    it('should set mostrarAnonimo to true when there are recursos sin autor', () => {
      recursoService.getAll.and.returnValue(of(mockRecursosConSinAutor));
      component.verificarRecursosSinAutor();
      expect(component.mostrarAnonimo()).toBe(true);
    });

    it('should set mostrarAnonimo to false when all recursos have autor', () => {
      recursoService.getAll.and.returnValue(of(mockRecursosTodosConAutor));
      component.verificarRecursosSinAutor();
      expect(component.mostrarAnonimo()).toBe(false);
    });

    it('should handle error when loading recursos', () => {
      recursoService.getAll.and.returnValue(throwError(() => new Error('Error')));
      const consoleSpy = spyOn(console, 'error');
      component.verificarRecursosSinAutor();
      expect(consoleSpy).toHaveBeenCalled();
      expect(component.mostrarAnonimo()).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should call cargarAutores and verificarRecursosSinAutor on init', () => {
      spyOn(component, 'cargarAutores');
      spyOn(component, 'verificarRecursosSinAutor');
      component.ngOnInit();
      expect(component.cargarAutores).toHaveBeenCalled();
      expect(component.verificarRecursosSinAutor).toHaveBeenCalled();
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
    it('should navigate to busqueda-avanzada/autores', () => {
      spyOn(router, 'navigate');
      component.abrirBusquedaAvanzada();
      expect(router.navigate).toHaveBeenCalledWith(['/busqueda-avanzada/autores']);
    });
  });

  describe('irADetalle', () => {
    it('should navigate to autor detalle', () => {
      spyOn(router, 'navigate');
      component.irADetalle('1');
      expect(router.navigate).toHaveBeenCalledWith(['/autores/detalle', '1']);
    });
  });

  describe('irAAnonimo', () => {
    it('should navigate to anonimo detalle', () => {
      spyOn(router, 'navigate');
      component.irAAnonimo();
      expect(router.navigate).toHaveBeenCalledWith(['/autores/detalle/anonimo']);
    });
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      component.cargarAutores();
      component.verificarRecursosSinAutor();
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
      component.mostrarAnonimo.set(false);
      component.loading.set(false);
      component.error.set('');
      fixture.detectChanges();

      const empty = fixture.debugElement.nativeElement.querySelector('.empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('No hay autores');
    });

    it('should show anonimo card when mostrarAnonimo is true', () => {
      component.mostrarAnonimo.set(true);
      fixture.detectChanges();

      const anonimoCard = fixture.debugElement.nativeElement.querySelector('.anonimo-card');
      expect(anonimoCard).toBeTruthy();
      expect(anonimoCard.textContent).toContain('Anónimo');
    });

    it('should not show anonimo card when mostrarAnonimo is false', () => {
      component.mostrarAnonimo.set(false);
      fixture.detectChanges();

      const anonimoCard = fixture.debugElement.nativeElement.querySelector('.anonimo-card');
      expect(anonimoCard).toBeFalsy();
    });
  });

});
