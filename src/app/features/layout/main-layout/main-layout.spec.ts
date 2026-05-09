import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

import { MainLayoutComponent } from './main-layout';
import { AjustesComponent } from '../ajustes/ajustes';
import { MenuComponent } from '../menu/menu';

@Component({ selector: 'app-ajustes', template: '<div>Mock Ajustes</div>' })
class MockAjustesComponent {}

@Component({ selector: 'app-menu-lateral', template: '<div>Mock Menu</div>' })
class MockMenuComponent {}

// Test unitario para el componente MainLayoutComponent:
describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainLayoutComponent,
        RouterTestingModule
      ],
    })
    .overrideComponent(MainLayoutComponent, {
      remove: { imports: [AjustesComponent, MenuComponent] },
      add: { imports: [MockAjustesComponent, MockMenuComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Template rendering', () => {
    it('should render the main layout container', () => {
      const container = fixture.debugElement.nativeElement.querySelector('.main-layout');
      expect(container).toBeTruthy();
    });

    it('should have ajustes wrapper div', () => {
      const ajustesWrapper = fixture.debugElement.nativeElement.querySelector('.ajustes-wrapper');
      expect(ajustesWrapper).toBeTruthy();
    });

    it('should render app-ajustes component', () => {
      const ajustesComponent = fixture.debugElement.query(By.css('app-ajustes'));
      expect(ajustesComponent).toBeTruthy();
    });

    it('should render main content area', () => {
      const mainContent = fixture.debugElement.nativeElement.querySelector('.main-content');
      expect(mainContent).toBeTruthy();
    });

    it('should render router outlet inside main content', () => {
      const routerOutlet = fixture.debugElement.nativeElement.querySelector('router-outlet');
      expect(routerOutlet).toBeTruthy();
    });

    it('should render app-menu-lateral component', () => {
      const menuComponent = fixture.debugElement.query(By.css('app-menu-lateral'));
      expect(menuComponent).toBeTruthy();
    });
  });

  describe('Layout structure', () => {
    it('should have correct CSS classes', () => {
      const container = fixture.debugElement.nativeElement.querySelector('.main-layout');
      expect(container.classList.contains('main-layout')).toBe(true);
    });

    it('should have ajustes-wrapper positioned for floating button', () => {
      const ajustesWrapper = fixture.debugElement.nativeElement.querySelector('.ajustes-wrapper');
      expect(ajustesWrapper).toBeTruthy();
    });
  });

  describe('Component integration', () => {
    it('should include AjustesComponent', () => {
      const mockAjustes = fixture.debugElement.query(By.css('app-ajustes'));
      expect(mockAjustes).toBeTruthy();
      expect(mockAjustes.nativeElement.textContent).toContain('Mock Ajustes');
    });

    it('should include MenuComponent', () => {
      const mockMenu = fixture.debugElement.query(By.css('app-menu-lateral'));
      expect(mockMenu).toBeTruthy();
      expect(mockMenu.nativeElement.textContent).toContain('Mock Menu');
    });
  });

});
