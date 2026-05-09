import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { AuthGuard } from './core/guards/auth-guard';
import { MainLayoutComponent } from './features/layout/main-layout/main-layout';
import { ListaRecursosComponent } from './features/recursos/lista-recursos/lista-recursos';
import { FormularioRecursoComponent } from './features/recursos/formulario-recurso/formulario-recurso';
import { PerfilComponent } from './features/usuario/perfil/perfil';
import { CambiarContrasenaComponent } from './features/usuario/cambiar-contrasena/cambiar-contrasena';

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
      { path: '', redirectTo: '/recursos', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'recursos' }
];
