import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css']
})
// Componente para el menú:
export class MenuComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Método para verificar si una ruta pertenece a la sección actual:
  isActive(route: string): boolean {
    const currentUrl = this.router.url;

    const secciones: { [key: string]: string } = {
      '/recursos': '/recursos',
      '/categorias': '/categorias',
      '/etiquetas': '/etiquetas',
      '/autores': '/autores',
      '/tipos': '/tipos'
    };

    const seccionBase = secciones[route];
    if (!seccionBase) return false;

    return currentUrl.startsWith(seccionBase);
  }

}
