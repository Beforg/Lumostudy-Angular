import { Component, OnInit } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { ButtonComponent } from "../../shared/button/button.component";
import { ContaService } from '../../service/conta.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth.service';
import { User } from '../../models/user';

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
  fotoUrl!: string;
  usuario!: User | null;
  

  constructor(private contaService: ContaService, private toastrService: ToastrService, private authService: AuthService) { 

  }

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioAtual();
    if (localStorage.getItem('usuarioFoto') != '') {
      const foto = localStorage.getItem('usuarioFoto');
      if (foto) {
        this.fotoUrl = this.criarUrlFoto(foto);
        console.log(this.fotoUrl);
      }
    }
  }

  criarUrlFoto(foto: string): string {
    return `data:image/png;base64,${foto}`;
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
        this.toastrService.success('Imagem atualizada com sucesso');
      }, error => {
        this.toastrService.error('Erro ao atualizar imagem');
        console.log(error);
      })
    } else {
      this.toastrService.error('Selecione uma imagem para fazer o upload');
    }
  }	
}
