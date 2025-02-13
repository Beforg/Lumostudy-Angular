import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterForm } from '../../models/register.form';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../shared/input/input.component';
import { ButtonComponent } from "../../shared/button/button.component";
import { AuthService } from '../../service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../models/user';
import { ToastrService } from 'ngx-toastr';
import { FooterComponent } from '../../components/footer/footer.component';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, InputComponent, ButtonComponent, RouterModule],
  providers: [AuthService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm!: FormGroup<RegisterForm>;
  logo: string = '/logo4.png';
  banner: string = '/app/materias-bg.png';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {
    this.registerForm = new FormGroup({
      nome: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      confirmEmail: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      userNickName: new FormControl(''),
    });
  }

  register(): void {
    if (this.registerForm.valid) {
      if (this.isLoading) {
        this.toastr.info("Processando...")
      }
      if (this.registerForm.get('email')?.value !== this.registerForm.get('confirmEmail')?.value) {
        this.toastr.error('Os emails não são iguais');
        return;
      } else if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
        this.toastr.error('As senhas não são iguais');
        return;
      }
      this.isLoading = true
      const user: User = new User(
        'none',
        this.registerForm.get('nome')?.value,
        this.registerForm.get('email')?.value,
        'none',
        this.registerForm.get('userNickName')?.value,
        0,
        '',
      )
      this.authService.cadastro(user, this.registerForm.get('password')?.value).subscribe({
        next: (response) => {
          this.toastr.success('Usuário cadastrado com sucesso! Email enviado para ativação da conta.');


          setTimeout(() => {
            this.router.navigate(['/auth']);
          }, 3000)
        },
        error: (error) => {
          this.toastr.error('Erro ao cadastrar usuário');
          this.isLoading = false;
        }
      });
    } else {
      this.toastr.error('Preencha todos os campos corretamente');
    }
  }
}
