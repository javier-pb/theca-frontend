import { Component } from '@angular/core';
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
// Componente para la página de registro:
export class RegisterComponent {

  nombre = '';
  correo = '';
  contrasena = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Método para manejar el envío del formulario de registro:
  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.register({ nombre: this.nombre, correo: this.correo, contrasena: this.contrasena })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.error = err.error || 'Error al registrarse';
          this.loading = false;
        }
      });
  }

}
