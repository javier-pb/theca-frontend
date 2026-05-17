import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

import { ListaTiposComponent } from './lista-tipos';
import { TipoService, Tipo } from '../../../core/services/tipo';
import { BusquedaComponent } from '../../../shared/busqueda/busqueda';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  template: '<div class="mock-busqueda"></div>'
})
class MockBusquedaComponent {}

// Test unitario para la lista de tipos:
describe('ListaTiposComponent', () => {
  let component: ListaTiposComponent;
  let fixture: ComponentFixture<ListaTiposComponent>;
  let tipoService: jasmine.SpyObj<TipoService>;
  let router: Router;

  const mockTipos: Tipo[] = [
    { id: '1', nombre: 'PDF', imagen: 'base64imagedata', esPredeterminado: true },
    { id: '2', nombre: 'ePub', imagen: null, esPredeterminado: true },
    { id: '3', nombre: 'Documento', imagen: null, esPredeterminado: true },
    { id: '4', nombre: 'Hoja de cálculo', imagen: null, esPredeterminado: true },
    { id: '5', nombre: 'Enlace', imagen: null, esPredeterminado: true },
    { id: '6', nombre: 'Personalizado', imagen: null, esPredeterminado: false }
  ];

  const mockTiposDesordenados: Tipo[] = [
    { id: '3', nombre: 'Zeta', esPredeterminado: false },
    { id: '1', nombre: 'Alfa', esPredeterminado: false },
    { id: '2', nombre: 'Beta', esPredeterminado: false }
  ];

  beforeEach(async () => {
    tipoService = jasmine.createSpyObj('TipoService', ['getAll']);

    await TestBed.configureTestingModule({
      imports: [
        ListaTiposComponent,
        RouterTestingModule.withRoutes([
          { path: 'tipos/detalle/1', component: Component },
          { path: 'busqueda-avanzada/tipos', component: Component }
        ])
      ],
      providers: [
        { provide: TipoService, useValue: tipoService }
      ]
    })
    .overrideComponent(ListaTiposComponent, {
      remove: { imports: [BusquedaComponent] },
      add: { imports: [MockBusquedaComponent] }
    })
    .compileComponents();
  });

  afterEach(() => {
    tipoService.getAll.calls.reset();
  });

  describe('Component Creation', () => {
    let componentInstance: ListaTiposComponent;

    beforeEach(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      componentInstance = fixture.componentInstance;
      router = TestBed.inject(Router);
    });

    it('should create the component', () => {
      expect(componentInstance).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(componentInstance.tipos()).toEqual([]);
      expect(componentInstance.tiposFiltrados()).toEqual([]);
      expect(componentInstance.terminoBusqueda()).toBe('');
      expect(componentInstance.loading()).toBe(true);
      expect(componentInstance.error()).toBe('');
    });
  });

  describe('cargarTipos', () => {
    it('should load tipos successfully', fakeAsync(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(tipoService.getAll).toHaveBeenCalled();
      expect(component.tipos().length).toBe(6);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    }));

    it('should sort tipos alphabetically', fakeAsync(() => {
      tipoService.getAll.and.returnValue(of(mockTiposDesordenados));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.tipos()[0].nombre).toBe('Alfa');
      expect(component.tipos()[1].nombre).toBe('Beta');
      expect(component.tipos()[2].nombre).toBe('Zeta');
    }));

    it('should handle error when loading tipos', fakeAsync(() => {
      tipoService.getAll.and.returnValue(throwError(() => new Error('Error')));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.tipos()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Error al cargar los tipos');
    }));
  });

  describe('ngOnInit', () => {
    it('should call cargarTipos on init', () => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      const spy = spyOn(component, 'cargarTipos');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('ordenarAlfabeticamente', () => {
    beforeEach(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should sort tipos alphabetically', () => {
      const desordenados = [
        { id: '3', nombre: 'Zeta' },
        { id: '1', nombre: 'Alfa' },
        { id: '2', nombre: 'Beta' }
      ] as Tipo[];
      const ordenados = component.ordenarAlfabeticamente(desordenados);

      expect(ordenados[0].nombre).toBe('Alfa');
      expect(ordenados[1].nombre).toBe('Beta');
      expect(ordenados[2].nombre).toBe('Zeta');
    });
  });

  describe('onBuscar', () => {
    beforeEach(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should update terminoBusqueda and call filtrarTipos', () => {
      spyOn(component, 'filtrarTipos');
      component.onBuscar('PDF');
      expect(component.terminoBusqueda()).toBe('PDF');
      expect(component.filtrarTipos).toHaveBeenCalled();
    });
  });

  describe('filtrarTipos', () => {
    beforeEach(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      component.cargarTipos();
    });

    it('should show all tipos when termino is empty', () => {
      component.terminoBusqueda.set('');
      component.filtrarTipos();
      expect(component.tiposFiltrados().length).toBe(6);
    });

    it('should filter tipos by name', () => {
      component.terminoBusqueda.set('PDF');
      component.filtrarTipos();
      expect(component.tiposFiltrados().length).toBe(1);
      expect(component.tiposFiltrados()[0].nombre).toBe('PDF');
    });

    it('should filter tipos by partial name', () => {
      component.terminoBusqueda.set('Hoja');
      component.filtrarTipos();
      expect(component.tiposFiltrados().length).toBe(1);
      expect(component.tiposFiltrados()[0].nombre).toBe('Hoja de cálculo');
    });

    it('should be case insensitive', () => {
      component.terminoBusqueda.set('pdf');
      component.filtrarTipos();
      expect(component.tiposFiltrados().length).toBe(1);
      expect(component.tiposFiltrados()[0].nombre).toBe('PDF');
    });

    it('should return empty array when no matches', () => {
      component.terminoBusqueda.set('Inexistente');
      component.filtrarTipos();
      expect(component.tiposFiltrados().length).toBe(0);
    });
  });

  describe('abrirBusquedaAvanzada', () => {
    beforeEach(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    it('should navigate to busqueda-avanzada/tipos', () => {
      spyOn(router, 'navigate');
      component.abrirBusquedaAvanzada();
      expect(router.navigate).toHaveBeenCalledWith(['/busqueda-avanzada/tipos']);
    });
  });

  describe('irADetalle', () => {
    beforeEach(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    it('should navigate to tipo detalle', () => {
      spyOn(router, 'navigate');
      component.irADetalle('1');
      expect(router.navigate).toHaveBeenCalledWith(['/tipos/detalle', '1']);
    });
  });

  describe('getImagenUrl', () => {
    beforeEach(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should return data URL when tipo has base64 imagen', () => {
      const tipoConImagen = { id: '1', nombre: 'PDF', imagen: 'base64data', esPredeterminado: true } as Tipo;
      const result = component.getImagenUrl(tipoConImagen);
      expect(result).toBe('data:image/jpeg;base64,base64data');
    });

    it('should return http URL as is', () => {
      const tipoConHttp = { id: '1', nombre: 'PDF', imagen: 'https://example.com/image.jpg', esPredeterminado: true } as Tipo;
      const result = component.getImagenUrl(tipoConHttp);
      expect(result).toBe('https://example.com/image.jpg');
    });

    it('should return data URL as is', () => {
      const tipoConDataUrl = { id: '1', nombre: 'PDF', imagen: 'data:image/png;base64,abc123', esPredeterminado: true } as Tipo;
      const result = component.getImagenUrl(tipoConDataUrl);
      expect(result).toBe('data:image/png;base64,abc123');
    });

    it('should return assets image for predeterminado tipo without imagen', () => {
      const tipoPredeterminado = { id: '2', nombre: 'ePub', imagen: null, esPredeterminado: true } as Tipo;
      const result = component.getImagenUrl(tipoPredeterminado);
      expect(result).toBe('assets/images/ePub.png');
    });

    it('should return assets image for Hoja de cálculo', () => {
      const tipoHojaCalculo = { id: '4', nombre: 'Hoja de cálculo', imagen: null, esPredeterminado: true } as Tipo;
      const result = component.getImagenUrl(tipoHojaCalculo);
      expect(result).toBe('assets/images/Hoja de cálculo.png');
    });

    it('should return empty string for non-predeterminado tipo without imagen', () => {
      const tipoNoPredeterminado = { id: '6', nombre: 'Personalizado', imagen: null, esPredeterminado: false } as Tipo;
      const result = component.getImagenUrl(tipoNoPredeterminado);
      expect(result).toBe('');
    });
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }));

    it('should render title', () => {
      const title = fixture.debugElement.nativeElement.querySelector('.page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('TIPOS');
    });

    it('should render add button', () => {
      const addButton = fixture.debugElement.nativeElement.querySelector('.btn-anadir');
      expect(addButton).toBeTruthy();
    });

    it('should render tipos grid', () => {
      const grid = fixture.debugElement.nativeElement.querySelector('.tipos-grid');
      expect(grid).toBeTruthy();
    });

    it('should render 6 tipo cards', () => {
      const cards = fixture.debugElement.nativeElement.querySelectorAll('.tipo-card');
      expect(cards.length).toBe(6);
    });

    it('should display tipo nombre on each card', () => {
      const nombres = fixture.debugElement.nativeElement.querySelectorAll('.card-nombre');
      expect(nombres.length).toBe(6);
      const nombresTexto = Array.from(nombres).map((el: any) => el.textContent);
      expect(nombresTexto).toContain('PDF');
      expect(nombresTexto).toContain('ePub');
      expect(nombresTexto).toContain('Documento');
    });

    it('should render images for tipos', () => {
      const images = fixture.debugElement.nativeElement.querySelectorAll('.tipo-img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should show loading state when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const loading = fixture.debugElement.nativeElement.querySelector('.loading');
      expect(loading).toBeTruthy();
      expect(loading.textContent).toContain('Cargando tipos...');
    });

    it('should show error state when error', () => {
      component.loading.set(false);
      component.error.set('Error de prueba');
      fixture.detectChanges();

      const error = fixture.debugElement.nativeElement.querySelector('.error');
      expect(error).toBeTruthy();
      expect(error.textContent).toContain('Error de prueba');
    });

    it('should show empty state when no tipos', () => {
      component.tipos.set([]);
      component.tiposFiltrados.set([]);
      component.loading.set(false);
      component.error.set('');
      fixture.detectChanges();

      const empty = fixture.debugElement.nativeElement.querySelector('.empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('No hay tipos');
    });

    it('should show no results message when search returns empty', () => {
      component.terminoBusqueda.set('Inexistente');
      component.filtrarTipos();
      fixture.detectChanges();

      const empty = fixture.debugElement.nativeElement.querySelector('.empty');
      expect(empty).toBeTruthy();
      expect(empty.textContent).toContain('No se encontraron tipos');
    });

    it('should call irADetalle when card is clicked', () => {
      spyOn(component, 'irADetalle');
      const firstCard = fixture.debugElement.query(By.css('.tipo-card'));
      firstCard.triggerEventHandler('click', null);
      expect(component.irADetalle).toHaveBeenCalled();
    });
  });

  describe('Filtered view', () => {
    beforeEach(fakeAsync(() => {
      tipoService.getAll.and.returnValue(of(mockTipos));
      fixture = TestBed.createComponent(ListaTiposComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }));

    it('should show filtered results when searching', () => {
      component.onBuscar('PDF');
      fixture.detectChanges();

      const cards = fixture.debugElement.nativeElement.querySelectorAll('.tipo-card');
      expect(cards.length).toBe(1);
      expect(cards[0].textContent).toContain('PDF');
    });
  });

});
