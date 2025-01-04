import { Component, OnInit } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { ButtonComponent } from "../../shared/button/button.component";
import { ContaService } from '../../service/conta.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth.service';
import { User } from '../../models/user';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderLumoappComponent, MenuLumoappComponent, ButtonComponent],
  providers: [ContaService, AuthService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileImgDefault: string = '/app/profile.png';
  imagemSelecionada: File | null = null;
  fotoUrl!: SafeUrl | undefined;
  fotoExpire!: string | null;
  usuario!: User | null;
  

  constructor(private contaService: ContaService, private toastrService: ToastrService, private sanitizer: DomSanitizer, private authService: AuthService) { 
    this.usuario = this.authService.getUsuarioAtual();
  }

  ngOnInit(): void {
    this.contaService.getImage().subscribe(blob => {
      const imgUrl = URL.createObjectURL(blob);
      this.fotoUrl = this.sanitizer.bypassSecurityTrustUrl(imgUrl);
    });
  }

  selecionarImagem(event: Event): void {
    const selecionado = event.target as HTMLInputElement;
    if (selecionado.files && selecionado.files.length > 0) {
      this.imagemSelecionada = selecionado.files[0];
    } 
  }

  uploadFoto(): void {
    if (this.imagemSelecionada) {
      this.contaService.uploadFoto(this.imagemSelecionada).subscribe(response => {
        this.toastrService.success('Foto alterada com sucesso, aguarde a atualização');
        const valueStr = localStorage.getItem('usuarioFoto');
        localStorage.removeItem('usuarioFoto');
        const value = valueStr ? JSON.parse(valueStr) : null;
        const item: object = {
          value: value.value,
          expiry: new Date().getTime() + 60000 // 60s para atualizar a imagem
        }
    
        localStorage.setItem('usuarioFoto', JSON.stringify(item));
      }, error => {
        this.toastrService.error('Erro ao atualizar imagem');
        console.log(error);
      })
    } else {
      this.toastrService.error('Selecione uma imagem para fazer o upload');
    }
  }	
}
