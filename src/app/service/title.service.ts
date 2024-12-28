import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  titulo!: string;
  constructor(private router: Router, private titleService: Title) { 
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.alterarTitulo(event.urlAfterRedirects);
    } );
  }

  alterarTitulo(url: string): void {
    if (url.includes('/app/estudar')) {
      this.titulo = 'Estudar';
    } else if (url.includes('/app/materias')) {
      this.titulo = 'Matérias';
    } else if (url.includes('/app/cronograma')) {
      this.titulo = 'Cronograma';
    } else if (url.includes('/app/historico')) {
      this.titulo = 'Histórico';
    } else if (url.includes('/app/profile')) {
      this.titulo = 'Perfil';
    } else if (url.includes('/app/home')) {
      this.titulo = 'Início';
    }
  }

  getTitulo(): string {
    return this.titulo;
  }
}
