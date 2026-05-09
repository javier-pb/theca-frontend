import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { UsuarioService } from '../../../core/services/usuario';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
// Componente para mostrar el perfil del usuario:
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  usuario = signal<{ nombre: string; correo: string; fechaCreacion: string } | null>(null);
  loading = signal(true);
  error = signal('');

  mostrarModalEliminar = signal(false);
  contrasenaConfirmacion = signal('');
  eliminando = signal(false);
  errorEliminar = signal('');

  ngOnInit(): void {
    this.cargarPerfil();
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  cargarPerfil(): void {
    this.loading.set(true);
    this.error.set('');

    this.usuarioService.getPerfil().subscribe({
      next: (data) => {
        this.usuario.set({
          nombre: data.nombre,
          correo: data.correo,
          fechaCreacion: this.formatearFecha(data.fechaCreacion)
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.error.set('Error al cargar el perfil');
        this.loading.set(false);
      }
    });
  }

  irCambiarContrasena(): void {
    this.router.navigate(['/cambiar-contrasena']);
  }

  abrirModalEliminar(): void {
    this.mostrarModalEliminar.set(true);
    this.contrasenaConfirmacion.set('');
    this.errorEliminar.set('');
  }

  cerrarModal(): void {
    this.mostrarModalEliminar.set(false);
    this.contrasenaConfirmacion.set('');
    this.errorEliminar.set('');
  }

  confirmarEliminarCuenta(): void {
    if (!this.contrasenaConfirmacion()) {
      this.errorEliminar.set('Debes introducir tu contraseña');
      return;
    }

    this.eliminando.set(true);
    this.errorEliminar.set('');

    this.usuarioService.eliminarCuenta(this.contrasenaConfirmacion()).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.eliminando.set(false);
        this.errorEliminar.set(err.error?.message || 'Error al eliminar la cuenta. Contraseña incorrecta.');
      }
    });
  }

}
