import { TestBed } from '@angular/core/testing';

import { RecursoService } from './recurso';

// Test unitario para el servicio de recursos:
describe('RecursoService', () => {

  let service: RecursoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecursoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
