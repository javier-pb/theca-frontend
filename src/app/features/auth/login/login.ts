import { Component } from '@angular/core';
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
// Componente para la página de login:
export class LoginComponent {

  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Método para manejar el envío del formulario de login:
  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: (response) => {
          this.authService.saveToken(response.token);
          this.loading = false;
          this.router.navigate(['/recursos']);
        },
        error: () => {
          this.error = 'Credenciales inválidas';
          this.loading = false;
        }
      });
  }

}
