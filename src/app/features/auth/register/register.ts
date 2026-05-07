import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
// Componente para el registro de usuarios:
export class RegisterComponent {

  nombre = signal('');
  correo = signal('');
  contrasena = signal('');
  repetirContrasena = signal('');

  loading = signal(false);

  errorNombre = signal('');
  errorEmail = signal('');
  errorContrasena = signal('');
  errorPasswordMatch = signal('');
  errorGeneral = signal('');

  mensajeExito = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Se valida el formato del correo electrónico:
  validarEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  validarCampos(): boolean {
    let esValido = true;

    // Se limpian loserrores previos:
    this.errorNombre.set('');
    this.errorEmail.set('');
    this.errorContrasena.set('');
    this.errorPasswordMatch.set('');
    this.errorGeneral.set('');

    // Se valida el nombre de usuario (3-50 caracteres):
    if (!this.nombre()) {
      this.errorNombre.set('El nombre es obligatorio');
      esValido = false;
    } else if (this.nombre().length < 3) {
      this.errorNombre.set('El nombre debe tener al menos 3 caracteres');
      esValido = false;
    } else if (this.nombre().length > 50) {
      this.errorNombre.set('El nombre no puede superar los 50 caracteres');
      esValido = false;
    }

    // Se valida el formato del correo electrónico:
    if (!this.correo()) {
      this.errorEmail.set('El correo electrónico es obligatorio');
      esValido = false;
    } else if (!this.validarEmail(this.correo())) {
      this.errorEmail.set('El correo electrónico debe ser válido');
      esValido = false;
    }

    // Se valida la contraseña (mínimo 6 caracteres):
    if (!this.contrasena()) {
      this.errorContrasena.set('La contraseña es obligatoria');
      esValido = false;
    } else if (this.contrasena().length < 6) {
      this.errorContrasena.set('La contraseña debe tener al menos 6 caracteres');
      esValido = false;
    }

    // Se valida que las contraseñas coinciden:
    if (this.contrasena() !== this.repetirContrasena()) {
      this.errorPasswordMatch.set('Las contraseñas introducidas no coinciden');
      esValido = false;
    }

    return esValido;
  }

  onSubmit(): void {
    // Se limpian los mensajes anteriores:
    this.errorNombre.set('');
    this.errorEmail.set('');
    this.errorContrasena.set('');
    this.errorPasswordMatch.set('');
    this.errorGeneral.set('');
    this.mensajeExito.set('');

    // Se validan los campos:
    if (!this.validarCampos()) {
      return;
    }

    this.loading.set(true);

    this.authService.register({
      nombre: this.nombre(),
      correo: this.correo(),
      contrasena: this.contrasena()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.mensajeExito.set('¡Usuario registrado con éxito!');

        // Se redirige al login después de 2 segundos:
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading.set(false);

        let mensaje = '';
        if (err.error && typeof err.error === 'string') {
          mensaje = err.error;
        } else if (err.message) {
          mensaje = err.message;
        }

        // Se manejan los errores del backend:
        if (mensaje.includes('usuario ya existe') || mensaje.includes('nombre')) {
          this.errorGeneral.set('El nombre de usuario no está disponible');
        } else if (mensaje.includes('correo') || mensaje.includes('email')) {
          this.errorGeneral.set('El correo electrónico ya se encuentra registrado');
        } else {
          this.errorGeneral.set('Error al registrarse');
        }
      }
    });
  }

}
