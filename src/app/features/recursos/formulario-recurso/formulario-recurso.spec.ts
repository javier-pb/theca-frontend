import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioRecurso } from './formulario-recurso';

// Test unitario para el formulario de recurso:
describe('FormularioRecurso', () => {

  let component: FormularioRecurso;
  let fixture: ComponentFixture<FormularioRecurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioRecurso],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioRecurso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
