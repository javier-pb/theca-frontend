import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AjustesComponent } from '../ajustes/ajustes';
import { MenuComponent } from '../menu/menu';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, AjustesComponent, MenuComponent],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
// Componente para el layout principal:
export class MainLayoutComponent {}
