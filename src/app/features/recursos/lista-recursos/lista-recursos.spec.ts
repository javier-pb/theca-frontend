import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaRecursos } from './lista-recursos';

// Test unitario para la lista de recursos:
describe('ListaRecursos', () => {

  let component: ListaRecursos;
  let fixture: ComponentFixture<ListaRecursos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaRecursos],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaRecursos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
