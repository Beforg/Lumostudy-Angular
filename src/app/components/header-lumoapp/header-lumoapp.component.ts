import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TitleService } from '../../service/title.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { ContaService } from '../../service/conta.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-header-lumoapp',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterLink],
  providers: [AuthService, ContaService],
  templateUrl: './header-lumoapp.component.html',
  styleUrls: ['./header-lumoapp.component.css']
})
export class HeaderLumoappComponent implements OnInit {
  logo: string = '/logo_3.png';
  titulo: string = 'Início';
  profile!: SafeUrl | undefined;
  profileExpire!: string | null;
  isProfileClicked: boolean = false;


  constructor(private router: Router, private titleService: TitleService, private authService: AuthService, private contaService: ContaService, private sanitizer: DomSanitizer) { 
    this.carregaFotoUsuario();
  }

  ngOnInit(): void {
    this.titulo = this.titleService.getTitulo();
    this.carregaFotoUsuario();
  }

  carregaFotoUsuario(): void {
    const usuarioFoto = this.getItemWithExpiry('usuarioFoto');
    if (!usuarioFoto) {
      this.contaService.getImage().subscribe(response => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            this.setItemWithExpiry('usuarioFoto', reader.result as string, 24 * 60 * 60 * 1000); // 24 horas
            this.profile = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
          } else {
            this.profile = '/app/profile.png';
          }
        };
        reader.readAsDataURL(response);
      });
    } else {
      this.profile = this.sanitizer.bypassSecurityTrustUrl(usuarioFoto);
      console.log("Foto carregada do cache.");
    }
  }

  setItemWithExpiry(key: string, value: string, time: number): void {
    
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + time,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  getItemWithExpiry(key: string): string | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
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