import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TitleService } from '../../service/title.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-header-lumoapp',
  standalone: true,
  imports: [RouterModule, CommonModule],
  providers: [AuthService],
  templateUrl: './header-lumoapp.component.html',
  styleUrls: ['./header-lumoapp.component.css']
})
export class HeaderLumoappComponent implements OnInit {
  logo: string = '/logo_3.png';
  titulo: string = 'Início';
  profile: string = '/app/profile.png';
  isProfileClicked: boolean = false;

  constructor(private router: Router, private titleService: TitleService, private authService: AuthService) { }

  ngOnInit(): void {
    this.titulo = this.titleService.getTitulo();
  }

  alternaProfiel(): void {
    this.isProfileClicked = !this.isProfileClicked;
  }

  logout():void {
    console.log('logout');
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

}