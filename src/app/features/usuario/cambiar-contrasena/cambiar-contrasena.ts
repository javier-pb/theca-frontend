import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { UsuarioService } from '../../../core/services/usuario';

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cambiar-contrasena.html',
  styleUrls: ['./cambiar-contrasena.css']
})
export class CambiarContrasenaComponent {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  contrasenaActual = signal('');
  nuevaContrasena = signal('');
  repetirContrasena = signal('');

  loading = signal(false);
  mensajeExito = signal('');
  errorGeneral = signal('');

  errorContrasenaActual = signal('');
  errorNuevaContrasena = signal('');
  errorRepetirContrasena = signal('');

  validarCampos(): boolean {
    let esValido = true;

    this.errorContrasenaActual.set('');
    this.errorNuevaContrasena.set('');
    this.errorRepetirContrasena.set('');
    this.errorGeneral.set('');

    // Validar contraseña actual:
    if (!this.contrasenaActual()) {
      this.errorContrasenaActual.set('La contraseña actual es obligatoria');
      esValido = false;
    }

    // Validar nueva contraseña:
    if (!this.nuevaContrasena()) {
      this.errorNuevaContrasena.set('La nueva contraseña es obligatoria');
      esValido = false;
    } else if (this.nuevaContrasena().length < 6) {
      this.errorNuevaContrasena.set('La nueva contraseña debe tener al menos 6 caracteres');
      esValido = false;
    }

    // Validar que coincidan las contraseñas:
    if (this.nuevaContrasena() !== this.repetirContrasena()) {
      this.errorRepetirContrasena.set('Las contraseñas no coinciden');
      esValido = false;
    }

    // Validar que la nueva sea diferente a la actual:
    if (this.nuevaContrasena() && this.contrasenaActual() &&
        this.nuevaContrasena() === this.contrasenaActual()) {
      this.errorNuevaContrasena.set('La nueva contraseña debe ser diferente a la actual');
      esValido = false;
    }

    return esValido;
  }

  onSubmit(): void {
    if (!this.validarCampos()) {
      return;
    }

    this.loading.set(true);
    this.mensajeExito.set('');
    this.errorGeneral.set('');

    this.usuarioService.cambiarContrasena({
      contrasenaActual: this.contrasenaActual(),
      nuevaContrasena: this.nuevaContrasena()
    }).subscribe({
      next: (response: string) => {
        this.loading.set(false);
        this.mensajeExito.set(response || 'Contraseña cambiada exitosamente');

        this.contrasenaActual.set('');
        this.nuevaContrasena.set('');
        this.repetirContrasena.set('');

        setTimeout(() => {
          this.router.navigate(['/perfil']);
        }, 2000);
      },
      error: (err) => {
        this.loading.set(false);

        if (err.error && typeof err.error === 'string') {
          this.errorGeneral.set(err.error);
        } else if (err.status === 400) {
          this.errorGeneral.set('Contraseña actual incorrecta');
        } else {
          this.errorGeneral.set('Error al cambiar la contraseña');
        }
      }
    });
  }

}
