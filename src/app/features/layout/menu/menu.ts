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

  // Método para verificar si una ruta está activa:
  isActive(route: string): boolean {
    return this.router.url === route;
  }

}
