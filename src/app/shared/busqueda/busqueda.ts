import { Component, signal, output, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './busqueda.html',
  styleUrls: ['./busqueda.css']
})
// Componente compartido para la búsqueda:
export class BusquedaComponent {

  private router = inject(Router);

  buscar = output<string>();
  busquedaAvanzada = output<void>();

  rutaBusquedaAvanzada = input<string>('/busqueda-avanzada');

  termino = signal('');

  onBuscar(): void {
    this.buscar.emit(this.termino());
  }

  onBusquedaAvanzada(): void {
    this.router.navigate([this.rutaBusquedaAvanzada()]);
  }

  limpiar(): void {
    this.termino.set('');
    this.buscar.emit('');
  }

}
