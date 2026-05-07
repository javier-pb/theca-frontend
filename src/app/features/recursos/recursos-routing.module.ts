import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaRecursosComponent } from './lista-recursos/lista-recursos';
import { FormularioRecursoComponent } from './formulario-recurso/formulario-recurso';
import { DetalleRecursoComponent } from './detalle-recurso/detalle-recurso';

const routes: Routes = [
  {
    path: '',
    component: ListaRecursosComponent
  },
  {
    path: 'nuevo',
    component: FormularioRecursoComponent
  },
  {
    path: 'editar/:id',
    component: FormularioRecursoComponent
  },
  {
    path: 'detalle/:id',
    component: DetalleRecursoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
// Módulo de enrutamiento para la sección de recursos:
export class RecursosRoutingModule { }
