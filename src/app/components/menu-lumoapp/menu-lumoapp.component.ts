import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

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
  estudar: string = '/app/estudar.png';
  materia: string = '/app/materia.png';
  inicioAtivo: string = '/app/inicio-ativo.png';
  cronomgramaAtivo: string = '/app/cronograma-ativo.png';
  estudarAtivo: string = '/app/estudar-ativo.png';
  materiaAtivo: string = '/app/materias-ativo.png';

  constructor(private router: Router) {

  }

  isAtivo(rota: string) {
    return this.router.url === rota;
  }	

  getIconeAtivo(route: string, icoPadrao: string, icoAtivo: string) {
    return this.isAtivo(route) ? icoAtivo : icoPadrao;
  }

}
