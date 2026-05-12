import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { ListaEtiquetasComponent } from './lista-etiquetas';
import { EtiquetaService, Etiqueta } from '../../../core/services/etiqueta';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

// Test unitario para la lista de etiquetas:
describe('ListaEtiquetasComponent', () => {

  let component: ListaEtiquetasComponent;
  let fixture: ComponentFixture<ListaEtiquetasComponent>;
  let etiquetaService: jasmine.SpyObj<EtiquetaService>;
  let router: Router;

  const mockEtiquetas: Etiqueta[] = [
    { id: '1', nombre: 'Angular' },
    { id: '2', nombre: 'TypeScript' },
    { id: '3', nombre: 'JavaScript' },
    { id: '4', nombre: 'React' }
  ];

  beforeEach(() => {
    etiquetaService = jasmine.createSpyObj('EtiquetaService', ['getAll', 'delete']);
    etiquetaService.getAll.and.returnValue(of(mockEtiquetas));

    TestBed.configureTestingModule({
      imports: [
        ListaEtiquetasComponent,
        RouterTestingModule.withRoutes([
          { path: 'etiquetas/detalle/1', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: EtiquetaService, useValue: etiquetaService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaEtiquetasComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    etiquetaService.getAll.calls.reset();
    etiquetaService.delete.calls.reset();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.etiquetas()).toEqual([]);
      expect(component.etiquetasFiltradas()).toEqual([]);
      expect(component.terminoBusqueda()).toBe('');
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
      expect(component.showModal()).toBe(false);
    });
  });

  describe('cargarEtiquetas', () => {
    it('should load etiquetas successfully', fakeAsync(() => {
      component.cargarEtiquetas();
      tick();

      expect(etiquetaService.getAll).toHaveBeenCalled();
      expect(component.etiquetas().length).toBe(4);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    }));

    it('should handle error when loading etiquetas', fakeAsync(() => {
      etiquetaService.getAll.and.returnValue(throwError(() => new Error('Error')));

      component.cargarEtiquetas();
      tick();

      expect(component.etiquetas()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar las etiquetas');
    }));
  });

  describe('ngOnInit', () => {
    it('should call cargarEtiquetas on init', () => {
      spyOn(component, 'cargarEtiquetas');
      component.ngOnInit();
      expect(component.cargarEtiquetas).toHaveBeenCalled();
    });
  });

  describe('ordenarAlfabeticamente', () => {
    it('should sort etiquetas alphabetically', () => {
      const desordenadas = [
        { id: '3', nombre: 'Zeta' },
        { id: '1', nombre: 'Alfa' },
        { id: '2', nombre: 'Beta' }
      ];
      const ordenadas = component.ordenarAlfabeticamente(desordenadas as Etiqueta[]);

      expect(ordenadas[0].nombre).toBe('Alfa');
      expect(ordenadas[1].nombre).toBe('Beta');
      expect(ordenadas[2].nombre).toBe('Zeta');
    });
  });

  describe('onBuscar', () => {
    it('should update terminoBusqueda and call filtrarEtiquetas', () => {
      spyOn(component, 'filtrarEtiquetas');

      component.onBuscar('Angular');

      expect(component.terminoBusqueda()).toBe('Angular');
      expect(component.filtrarEtiquetas).toHaveBeenCalled();
    });
  });

  describe('filtrarEtiquetas', () => {
    beforeEach(() => {
      component.etiquetas.set(mockEtiquetas);
    });

    it('should show all etiquetas when termino is empty', () => {
      component.terminoBusqueda.set('');
      component.filtrarEtiquetas();

      expect(component.etiquetasFiltradas().length).toBe(4);
    });

    it('should filter etiquetas by name', () => {
      component.terminoBusqueda.set('Angular');
      component.filtrarEtiquetas();

      expect(component.etiquetasFiltradas().length).toBe(1);
      expect(component.etiquetasFiltradas()[0].nombre).toBe('Angular');
    });

    it('should filter etiquetas by partial name', () => {
      component.terminoBusqueda.set('Script');
      component.filtrarEtiquetas();

      expect(component.etiquetasFiltradas().length).toBe(2);
      expect(component.etiquetasFiltradas()[0].nombre).toBe('TypeScript');
    });

    it('should be case insensitive', () => {
      component.terminoBusqueda.set('angular');
      component.filtrarEtiquetas();

      expect(component.etiquetasFiltradas().length).toBe(1);
    });

    it('should return empty array when no matches', () => {
      component.terminoBusqueda.set('Inexistente');
      component.filtrarEtiquetas();

      expect(component.etiquetasFiltradas().length).toBe(0);
    });
  });

  describe('abrirBusquedaAvanzada', () => {
    it('should log message', () => {
      const consoleSpy = spyOn(console, 'log');
      component.abrirBusquedaAvanzada();
      expect(consoleSpy).toHaveBeenCalledWith('Búsqueda avanzada - Pendiente de implementar');
    });
  });

  describe('abrirModalCrear', () => {
    it('should open create modal', () => {
      component.abrirModalCrear();

      expect(component.modalModo()).toBe('crear');
      expect(component.etiquetaSeleccionada()).toBeNull();
      expect(component.showModal()).toBe(true);
    });
  });

  describe('abrirModalEditar', () => {
    it('should open edit modal with selected etiqueta', () => {
      const etiqueta = mockEtiquetas[0];
      component.abrirModalEditar(etiqueta);

      expect(component.modalModo()).toBe('editar');
      expect(component.etiquetaSeleccionada()).toEqual(etiqueta);
      expect(component.showModal()).toBe(true);
    });
  });

  describe('cerrarModal', () => {
    it('should close modal and clear selected etiqueta', () => {
      component.showModal.set(true);
      component.etiquetaSeleccionada.set(mockEtiquetas[0]);
      component.cerrarModal();

      expect(component.showModal()).toBe(false);
      expect(component.etiquetaSeleccionada()).toBeNull();
    });
  });

  describe('onGuardado', () => {
    it('should close modal and reload etiquetas', () => {
      spyOn(component, 'cargarEtiquetas');
      component.showModal.set(true);
      component.onGuardado();

      expect(component.showModal()).toBe(false);
      expect(component.cargarEtiquetas).toHaveBeenCalled();
    });
  });

  describe('irADetalle', () => {
    it('should navigate to etiqueta detalle', () => {
      spyOn(router, 'navigate');

      component.irADetalle('1');

      expect(router.navigate).toHaveBeenCalledWith(['/etiquetas/detalle', '1']);
    });
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      component.cargarEtiquetas();
      tick();
      fixture.detectChanges();
    }));

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('ETIQUETAS');
    });

    it('should render add button', () => {
      const addButton = fixture.debugElement.nativeElement.querySelector('.btn-anadir');
      expect(addButton).toBeTruthy();
    });

    it('should render busqueda component', () => {
      const busquedaComponent = fixture.debugElement.query(By.css('app-busqueda'));
      expect(busquedaComponent).toBeTruthy();
    });

    it('should render etiquetas grid', () => {
      const grid = fixture.debugElement.nativeElement.querySelector('.etiquetas-grid');
      expect(grid).toBeTruthy();
    });

    it('should render 4 etiqueta cards', () => {
      const cards = fixture.debugElement.nativeElement.querySelectorAll('.etiqueta-card');
      expect(cards.length).toBe(4);
    });

    it('should display etiqueta nombre with # symbol', () => {
      const primeraEtiqueta = fixture.debugElement.nativeElement.querySelector('.etiqueta-nombre');
      expect(primeraEtiqueta.textContent).toContain('#Angular');
    });

    it('should not show edit button in list', () => {
      const editButtons = fixture.debugElement.nativeElement.querySelectorAll('.btn-editar');
      expect(editButtons.length).toBe(0);
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
    });

    it('should show empty state when no etiquetas', () => {
      component.etiquetas.set([]);
      component.etiquetasFiltradas.set([]);
      component.loading.set(false);
      component.error.set('');
      fixture.detectChanges();

      const empty = fixture.debugElement.nativeElement.querySelector('.empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('No hay etiquetas');
    });
  });

  describe('Modal template', () => {
    beforeEach(fakeAsync(() => {
      component.cargarEtiquetas();
      tick();
      fixture.detectChanges();
    }));

    it('should not show modal when showModal is false', () => {
      component.showModal.set(false);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-modal-etiqueta'));
      expect(modal).toBeFalsy();
    });

    it('should show modal when showModal is true', () => {
      component.showModal.set(true);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-modal-etiqueta'));
      expect(modal).toBeTruthy();
    });
  });

});
