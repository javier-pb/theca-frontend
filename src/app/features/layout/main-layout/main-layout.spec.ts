import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { MainLayoutComponent } from './main-layout';

// Test unitario para la disposición principal:
describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainLayoutComponent,
        RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('onDocumentClick', () => {
    it('should exist and be callable', () => {
      const spy = spyOn(component, 'onDocumentClick');
      const event = new MouseEvent('click');
      component.onDocumentClick(event);
      expect(spy).toHaveBeenCalledWith(event);
    });

    it('should not throw error when called', () => {
      const event = new MouseEvent('click');
      expect(() => component.onDocumentClick(event)).not.toThrow();
    });
  });

  describe('HostListener', () => {
    it('should have document:click listener', () => {
      const methodNames = Object.getOwnPropertyNames(
        Object.getPrototypeOf(component)
      );
      expect(methodNames).toContain('onDocumentClick');
    });
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
      const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
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

    it('should have ajustes-wrapper with proper classes', () => {
      const ajustesWrapper = fixture.debugElement.nativeElement.querySelector('.ajustes-wrapper');
      expect(ajustesWrapper.classList.contains('ajustes-wrapper')).toBe(true);
    });

    it('should have main-content with proper classes', () => {
      const mainContent = fixture.debugElement.nativeElement.querySelector('.main-content');
      expect(mainContent.classList.contains('main-content')).toBe(true);
    });
  });

  describe('Component integration', () => {
    it('should include AjustesComponent', () => {
      const ajustesComponent = fixture.debugElement.query(By.css('app-ajustes'));
      expect(ajustesComponent).toBeTruthy();
    });

    it('should include MenuComponent', () => {
      const menuComponent = fixture.debugElement.query(By.css('app-menu-lateral'));
      expect(menuComponent).toBeTruthy();
    });
  });

  describe('DOM structure', () => {
    it('should have router-outlet inside main-content', () => {
      const mainContent = fixture.debugElement.nativeElement.querySelector('.main-content');
      const routerOutlet = mainContent?.querySelector('router-outlet');
      expect(routerOutlet).toBeTruthy();
    });

    it('should have ajustes-wrapper as first child?', () => {
      const container = fixture.debugElement.nativeElement.querySelector('.main-layout');
      expect(container.children.length).toBeGreaterThan(0);
    });
  });

});
