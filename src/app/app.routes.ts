import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { MenuLateralComponent } from './features/layout/menu-lateral/menu-lateral';
import { AuthGuard } from './core/guards/auth-guard';

// Rutas de la aplicación:
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '',
    component: MenuLateralComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'recursos',
        loadChildren: () => import('./features/recursos/recursos-module').then(m => m.RecursosModule)
      },
      {
        path: 'categorias',
        loadChildren: () => import('./features/categorias/categorias-module').then(m => m.CategoriasModule)
      },
      {
        path: 'etiquetas',
        loadChildren: () => import('./features/etiquetas/etiquetas-module').then(m => m.EtiquetasModule)
      },
      {
        path: 'autores',
        loadChildren: () => import('./features/autores/autores-module').then(m => m.AutoresModule)
      },
      {
        path: '',
        redirectTo: 'recursos',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'recursos'
  }
];
