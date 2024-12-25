import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TitleService } from '../../service/title.service';

@Component({
  selector: 'app-header-lumoapp',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header-lumoapp.component.html',
  styleUrls: ['./header-lumoapp.component.css']
})
export class HeaderLumoappComponent implements OnInit {
  logo: string = '/logo_3.png';
  titulo: string = 'Início';

  constructor(private router: Router, private titleService: TitleService) { }

  ngOnInit(): void {
    this.titulo = this.titleService.getTitulo();
  }

}