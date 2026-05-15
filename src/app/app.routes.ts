import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { AuthGuard } from './core/guards/auth-guard';
import { MainLayoutComponent } from './features/layout/main-layout/main-layout';
import { ListaRecursosComponent } from './features/recursos/lista-recursos/lista-recursos';
import { FormularioRecursoComponent } from './features/recursos/formulario-recurso/formulario-recurso';
import { PerfilComponent } from './features/usuario/perfil/perfil';
import { CambiarContrasenaComponent } from './features/usuario/cambiar-contrasena/cambiar-contrasena';
import { DetalleRecursoComponent } from './features/recursos/detalle-recurso/detalle-recurso';
import { ListaCategoriasComponent } from './features/categorias/lista-categorias/lista-categorias';
import { FormularioCategoriaComponent } from './features/categorias/formulario-categoria/formulario-categoria';
import { DetalleCategoriaComponent } from './features/categorias/detalle-categoria/detalle-categoria';
import { ListaEtiquetasComponent } from './features/etiquetas/lista-etiquetas/lista-etiquetas';
import { DetalleEtiquetaComponent } from './features/etiquetas/detalle-etiqueta/detalle-etiqueta';
import { ListaAutoresComponent } from './features/autores/lista-autores/lista-autores';
import { DetalleAutorComponent } from './features/autores/detalle-autor/detalle-autor';
import { FormularioAutorComponent } from './features/autores/formulario-autor/formulario-autor';

// Rutas de la aplicación:
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'perfil', component: PerfilComponent },
      { path: 'cambiar-contrasena', component: CambiarContrasenaComponent },

      { path: 'recursos', component: ListaRecursosComponent },
      { path: 'recursos/nuevo', component: FormularioRecursoComponent },
      { path: 'recursos/editar/:id', component: FormularioRecursoComponent },
      { path: 'recursos/detalle/:id', component: DetalleRecursoComponent },

      { path: 'categorias', component: ListaCategoriasComponent },
      { path: 'categorias/nuevo', component: FormularioCategoriaComponent },
      { path: 'categorias/editar/:id', component: FormularioCategoriaComponent },
      { path: 'categorias/detalle/:id', component: DetalleCategoriaComponent },

      { path: 'etiquetas', component: ListaEtiquetasComponent },
      { path: 'etiquetas/detalle/:id', component: DetalleEtiquetaComponent },

      { path: 'autores', component: ListaAutoresComponent },
      { path: 'autores/nuevo', component: FormularioAutorComponent },
      { path: 'autores/editar/:id', component: FormularioAutorComponent },
      { path: 'autores/detalle/:id', component: DetalleAutorComponent },

      { path: '', redirectTo: '/recursos', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'recursos' }
];
