import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-lumoapp',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './menu-lumoapp.component.html',
  styleUrl: './menu-lumoapp.component.css'
})
export class MenuLumoappComponent {
  inicio: string = '/app/inicio.png';
  historico: string = '/app/historico.png';
  cronograma: string = '/app/cronograma.png';
  ranking: string = '/app/ranking.png';
  estudar: string = '/app/estudar.png';
  materia: string = '/app/materia.png';
  estatistica: string = '/app/estatistica.png';
}
