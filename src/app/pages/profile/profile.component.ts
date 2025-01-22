import { Component, OnInit } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { ButtonComponent } from "../../shared/button/button.component";
import { ContaService } from '../../service/conta.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth.service';
import { User } from '../../models/user';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { UpdateUserForm } from '../../models/updateUser.form';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from "../../shared/input/input.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderLumoappComponent, MenuLumoappComponent, ButtonComponent, CommonModule, ReactiveFormsModule, InputComponent],
  providers: [ContaService, AuthService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  updateUserForm!: FormGroup<UpdateUserForm>;
  profileImgDefault: string = '/app/profile.png';
  edit: string = '/app/edit.png';
  isNovaSenha: boolean = false;
  type: string = '';
  imagemSelecionada: File | null = null;
  updateLabel!: string;
  fotoUrl!: SafeUrl | undefined;
  fotoExpire!: string | null;
  usuario!: User | null;
  isEditando: boolean = false;
  isExcluirConta: boolean = false;

  constructor(private contaService: ContaService, private toastrService: ToastrService, private sanitizer: DomSanitizer, private authService: AuthService) { 
    this.usuario = this.authService.getUsuarioAtual();
    this.updateUserForm = new FormGroup({
      type: new FormControl('', Validators.required),
      value: new FormControl('', Validators.required),
      password: new FormControl('',Validators.required)
    })
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

  getPontuacaoFormatada(): number {
    const pontuacaoFormatada = this.usuario?.getPontuacao();
    return pontuacaoFormatada ? parseFloat(pontuacaoFormatada.toFixed(2)) : 0;
  }

  editarPerfil(): void {
    if (this.updateUserForm.valid) {
      const type = this.updateUserForm.get('type')?.value;
      const value = this.updateUserForm.get('value')?.value;
      const password = this.updateUserForm.get('password')?.value;
      if (confirm("Alterar informações do perfil?")) {
        this.contaService.updateConta(type, value, password).subscribe({
          next: (response) => {
            this.toastrService.success('Perfil atualizado com sucesso! Faça login para continuar');
            this.isEditando = false;
            this.updateUserForm.reset();
            this.isNovaSenha = false;
            setTimeout(() => {
              this.authService.logout();
            }, 5000);
          },
          error: (error) => {
            this.toastrService.error('Erro ao atualizar perfil');
            console.log(error);
          }
        });
      }
    } else {
      this.toastrService.error('Preencha todos os campos corretamente');
    }
  }

  excluirConta(): void {
    if (this.updateUserForm.get('value')?.value === "Excluir") {
      this.toastrService.info('Conta excluída com sucesso');
    } else {
      this.toastrService.error('Digite "Excluir" para confirmar a exclusão da conta');
    }
  }

  abrirEdicao(type: string): void {
    this.isEditando = true
    this.updateUserForm.get('type')?.setValue(type);
    this.setValidators(type);
    if (type === 'username') {
      this.updateLabel = 'Trocar Nome de usuário';

    }
    else if (type === 'email') {
      this.updateLabel = 'Trocar Email';
    } 
    else if (type === 'password') {
      this.isNovaSenha = true;
      this.updateLabel = 'Trocar Senha';
    } else {
      this.updateLabel = 'Exclusão da Conta';
      this.updateUserForm.reset();
      this.isExcluirConta = true;
    }

  }

  setValidators(type: string) {
    if (type === 'email') {
      this.updateUserForm.get('value')?.setValidators([Validators.required, Validators.email]);
    } else if (type === 'password') {
      this.updateUserForm.get('value')?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      this.updateUserForm.get('value')?.setValidators(Validators.required);
    }
    this.updateUserForm.get('value')?.updateValueAndValidity();
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
