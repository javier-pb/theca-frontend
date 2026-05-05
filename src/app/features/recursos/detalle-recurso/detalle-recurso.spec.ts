import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleRecurso } from './detalle-recurso';

// Test unitario para el detalle de recurso:
describe('DetalleRecurso', () => {

  let component: DetalleRecurso;
  let fixture: ComponentFixture<DetalleRecurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleRecurso],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleRecurso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
