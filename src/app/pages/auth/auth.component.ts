import { Component, OnInit } from '@angular/core';
import { AuthForm } from '../../models/auth.form';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from "../../shared/input/input.component";
import { CommonModule } from '@angular/common';
import { ButtonComponent } from "../../shared/button/button.component";
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { LoginResponse } from '../../models/login.response';
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [InputComponent, ReactiveFormsModule, CommonModule, RouterModule, ButtonComponent, RouterLink, FooterComponent],
  providers: [AuthService],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit{
  authForm!: FormGroup<AuthForm>;
  logo: string = '/logo_2.png';
  logo2: string = '/logo.png';
  isRecuperarSenha: boolean = false;
  title: string = 'Login';
  labelEmail: string = 'Email';
  labelEsqueciSenha: string = 'Esqueci minha senha';

  constructor(private authService: AuthService, private routerLink: Router, private toastr: ToastrService) {
    this.authForm = new FormGroup<AuthForm>({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      remember: new FormControl(false)
    });
  }

  ngOnInit(): void {
    if (this.authService.isLogged()) {
      this.routerLink.navigate(['/app/home']);
    }
    console.log(this.authService.isLogged());
  }
  
  exibeRecuperarSenha(): void {
    if (this.isRecuperarSenha) {
      this.title = 'Recuperar senha';
      this.labelEmail = 'Insira seu email para recuperar a senha';
      this.labelEsqueciSenha = 'Voltar para login';
    } else {
      this.title = 'Login';
      this.labelEmail = 'Email';
      this.labelEsqueciSenha = 'Esqueci minha senha';
    }
  }

  login(): void {
    if (this.authForm.valid && !this.isRecuperarSenha) {
      this.authService.login(this.authForm.value.email, this.authForm.value.password).subscribe({
        next: () => {
          this.toastr.success('Login efetuado com sucesso!'),
          setTimeout(() => {
            this.routerLink.navigate(['/app/home']);
          }, 2500);

        },
        error: (error) => {
          this.toastr.error('Usuário ou senha inválidos!');
      }
    });
   } 
    else if (this.isRecuperarSenha) {
        this.recuperarSenha();
      }  
     else {
    this.toastr.error('Preencha os campos corretamente!');
  }
} 

recuperarSenha(): void {
  this.authService.recuperarSenha(this.authForm.value.email).subscribe({
    next: () => {
      this.toastr.success('Email enviado com sucesso!'),
      setTimeout(() => {
        this.routerLink.navigate(['/auth']);
      }, 2500);
      this.authForm.reset();
    },
    error: () => {
      this.toastr.error('Email não encontrado!');
    }
  });
}

}
