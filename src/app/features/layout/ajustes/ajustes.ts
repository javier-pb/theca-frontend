import { Component, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ajustes.html',
  styleUrls: ['./ajustes.css']
})
export class AjustesComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  menuAbierto = false;

  // Cerrar menú con ESC:
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.menuAbierto && event.key === 'Escape') {
      this.cerrarMenu();
    }
  }

  // Cerrar menú al hacer clic fuera:
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.menuAbierto && !this.elementRef.nativeElement.contains(event.target)) {
      this.cerrarMenu();
    }
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  irPerfil(): void {
    this.cerrarMenu();
    this.router.navigate(['/perfil']);
  }

  irCambiarContrasena(): void {
    this.cerrarMenu();
    this.router.navigate(['/cambiar-contrasena']);
  }

  cerrarSesion(): void {
    this.cerrarMenu();

    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

}
