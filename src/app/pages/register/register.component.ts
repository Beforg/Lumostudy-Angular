import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterForm } from '../../models/register.form';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../shared/input/input.component';
import { ButtonComponent } from "../../shared/button/button.component";
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, InputComponent, ButtonComponent],
  providers: [AuthService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm!: FormGroup<RegisterForm>;
  logo: string = '/logo_2.png';

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {
    this.registerForm = new FormGroup({
      nome: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      confirmEmail: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  register(): void {
      if (this.registerForm.valid) {
          const user: User = new User(
            'none',
            this.registerForm.get('nome')?.value,
            this.registerForm.get('email')?.value,
            'none'
          )
          this.authService.cadastro(user, this.registerForm.get('password')?.value).subscribe({
            next: (response) => {
              this.toastr.success('Usuário cadastrado com sucesso!');
              setTimeout(() => {
                this.router.navigate(['/auth']);
              }, 2000)
            },
            error: (error) => {
              this.toastr.error('Erro ao cadastrar usuário');
            }
          });
      } else {
        this.toastr.error('Preencha todos os campos corretamente', 'Erro');
      }
  }
}
