import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CategoriaTreeItemComponent } from './categoria-tree-item';
import { Categoria } from '../../../core/services/categoria';

// Test unitario para CategoriaTreeItemComponent:
describe('CategoriaTreeItemComponent', () => {
  let component: CategoriaTreeItemComponent;
  let fixture: ComponentFixture<CategoriaTreeItemComponent>;

  const mockCategoria: Categoria = {
    id: '1',
    nombre: 'Categoría Padre',
    categoriaPadreId: undefined
  };

  const mockSubcategorias: Categoria[] = [
    { id: '2', nombre: 'Subcategoría 1', categoriaPadreId: '1' },
    { id: '3', nombre: 'Subcategoría 2', categoriaPadreId: '1' }
  ];

  const mockCategorias: Categoria[] = [
    mockCategoria,
    ...mockSubcategorias
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaTreeItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaTreeItemComponent);
    component = fixture.componentInstance;

    component.categoria = mockCategoria;
    component.categorias = mockCategorias;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should have categoria input', () => {
      expect(component.categoria).toEqual(mockCategoria);
    });

    it('should have categorias input', () => {
      expect(component.categorias).toEqual(mockCategorias);
    });
  });

  describe('subcategorias computed', () => {
    it('should return subcategorias filtered by categoriaPadreId', () => {
      const subcategorias = component.subcategorias();
      expect(subcategorias.length).toBe(2);
      expect(subcategorias[0].nombre).toBe('Subcategoría 1');
      expect(subcategorias[1].nombre).toBe('Subcategoría 2');
    });

    it('should return empty array when no subcategorias', () => {
      const categoriaSinHijos: Categoria = {
        id: '4',
        nombre: 'Categoría Sin Hijos',
        categoriaPadreId: undefined
      };
      const categorias = [categoriaSinHijos];

      const nuevaFixture = TestBed.createComponent(CategoriaTreeItemComponent);
      const nuevoComponent = nuevaFixture.componentInstance;
      nuevoComponent.categoria = categoriaSinHijos;
      nuevoComponent.categorias = categorias;

      const subcategorias = nuevoComponent.subcategorias();
      expect(subcategorias.length).toBe(0);
    });
  });

  describe('hasChildren computed', () => {
    it('should return true when has subcategorias', () => {
      expect(component.hasChildren()).toBe(true);
    });

    it('should return false when has no subcategorias', () => {
      const categoriaSinHijos: Categoria = {
        id: '4',
        nombre: 'Categoría Sin Hijos',
        categoriaPadreId: undefined
      };

      const nuevaFixture = TestBed.createComponent(CategoriaTreeItemComponent);
      const nuevoComponent = nuevaFixture.componentInstance;
      nuevoComponent.categoria = categoriaSinHijos;
      nuevoComponent.categorias = [];

      expect(nuevoComponent.hasChildren()).toBe(false);
    });
  });

  describe('toggleExpand', () => {
    it('should toggle expanded signal when has children', () => {
      expect(component.expanded()).toBe(false);

      component.toggleExpand();
      expect(component.expanded()).toBe(true);

      component.toggleExpand();
      expect(component.expanded()).toBe(false);
    });

    it('should not toggle when has no children', () => {
      const categoriaSinHijos: Categoria = {
        id: '4',
        nombre: 'Categoría Sin Hijos',
        categoriaPadreId: undefined
      };

      const nuevaFixture = TestBed.createComponent(CategoriaTreeItemComponent);
      const nuevoComponent = nuevaFixture.componentInstance;
      nuevoComponent.categoria = categoriaSinHijos;
      nuevoComponent.categorias = [];

      expect(nuevoComponent.expanded()).toBe(false);
      nuevoComponent.toggleExpand();
      expect(nuevoComponent.expanded()).toBe(false);
    });
  });

  describe('irADetalle', () => {
    it('should emit abrirDetalle event with categoria id', () => {
      spyOn(component.abrirDetalle, 'emit');

      component.irADetalle('1');

      expect(component.abrirDetalle.emit).toHaveBeenCalledWith('1');
    });
  });

  describe('Template rendering', () => {
    it('should render the categoria nombre', () => {
      const nombreElement = fixture.debugElement.nativeElement.querySelector('.category-name');
      expect(nombreElement).toBeTruthy();
      expect(nombreElement.textContent).toContain('Categoría Padre');
    });

    it('should render expand icon when has children', () => {
      const expandIcon = fixture.debugElement.nativeElement.querySelector('.expand-icon');
      expect(expandIcon).toBeTruthy();
      expect(expandIcon.classList).toContain('visible');
    });

    it('should not render expand icon when has no children', () => {
      const categoriaSinHijos: Categoria = {
        id: '4',
        nombre: 'Categoría Sin Hijos',
        categoriaPadreId: undefined
      };

      const nuevaFixture = TestBed.createComponent(CategoriaTreeItemComponent);
      const nuevoComponent = nuevaFixture.componentInstance;
      nuevoComponent.categoria = categoriaSinHijos;
      nuevoComponent.categorias = [];
      nuevaFixture.detectChanges();

      const expandIcon = nuevaFixture.debugElement.nativeElement.querySelector('.expand-icon');
      expect(expandIcon).toBeTruthy();
      expect(expandIcon.classList.contains('visible')).toBe(false);
    });

    it('should call irADetalle when clicking on category-name', () => {
      spyOn(component, 'irADetalle');

      const nombreElement = fixture.debugElement.query(By.css('.category-name'));
      nombreElement.triggerEventHandler('click', null);

      expect(component.irADetalle).toHaveBeenCalledWith('1');
    });

    it('should call toggleExpand when clicking on tree-item-content', () => {
      spyOn(component, 'toggleExpand');

      const contentElement = fixture.debugElement.query(By.css('.tree-item-content'));
      contentElement.triggerEventHandler('click', null);

      expect(component.toggleExpand).toHaveBeenCalled();
    });

    it('should show subcategorias when expanded', () => {
      component.expanded.set(true);
      fixture.detectChanges();

      const subcategorias = fixture.debugElement.nativeElement.querySelectorAll('.subcategorias .tree-item');
      expect(subcategorias.length).toBe(2);
    });

    it('should not show subcategorias when collapsed', () => {
      component.expanded.set(false);
      fixture.detectChanges();

      const subcategorias = fixture.debugElement.nativeElement.querySelector('.subcategorias');
      expect(subcategorias).toBeFalsy();
    });
  });

});
