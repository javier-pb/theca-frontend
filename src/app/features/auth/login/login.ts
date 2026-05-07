import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
// Componente para el inicio de sesión de usuarios:
export class LoginComponent {
  username = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  errorUsername = signal('');
  errorPassword = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  validarCampos(): boolean {
    let esValido = true;

    // Se limpina los errores previos:
    this.errorUsername.set('');
    this.errorPassword.set('');
    this.error.set('');

    // Se manejan las validaciiones del backend:
    if (!this.username().trim()) {
      this.errorUsername.set('El usuario es obligatorio');
      esValido = false;
    }

    if (!this.password()) {
      this.errorPassword.set('La contraseña es obligatoria');
      esValido = false;
    }

    return esValido;
  }

  onSubmit(): void {
    // Se limpian los mensajes anteriores:
    this.errorUsername.set('');
    this.errorPassword.set('');
    this.error.set('');

    // Se validan los campos antes de enviar:
    if (!this.validarCampos()) {
      return;
    }

    this.loading.set(true);

    this.authService.login({
      username: this.username(),
      password: this.password()
    }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.loading.set(false);
        this.router.navigate(['/recursos']);
      },
      error: () => {
        this.error.set('Credenciales inválidas');
        this.loading.set(false);
      }
    });
  }

}
