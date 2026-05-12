import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './busqueda.html',
  styleUrls: ['./busqueda.css']
})
// Componente para la barra de búsqueda:
export class BusquedaComponent {

  buscar = output<string>();
  busquedaAvanzada = output<void>();

  terminoBusqueda = signal('');

  onBuscar(): void {
    this.buscar.emit(this.terminoBusqueda());
  }

  limpiar(): void {
    this.terminoBusqueda.set('');
    this.buscar.emit('');
  }

  onBusquedaAvanzada(): void {
    this.busquedaAvanzada.emit();
  }

}
