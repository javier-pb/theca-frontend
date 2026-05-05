import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaRecursos } from './lista-recursos/lista-recursos';
import { FormularioRecurso } from './formulario-recurso/formulario-recurso';
import { DetalleRecurso } from './detalle-recurso/detalle-recurso';

const routes: Routes = [
  {
    path: '',
    component: ListaRecursos
  },
  {
    path: 'nuevo',
    component: FormularioRecurso
  },
  {
    path: 'editar/:id',
    component: FormularioRecurso
  },
  {
    path: 'detalle/:id',
    component: DetalleRecurso
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
// Módulo de enrutamiento para la sección de recursos:
export class RecursosRoutingModule { }
