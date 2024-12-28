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
  constructor(private authService: AuthService, private routerLink: Router, private toastr: ToastrService) {
    this.authForm = new FormGroup<AuthForm>({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      remember: new FormControl(false)
    });
  }

  ngOnInit(): void {
    // if (this.authService.isLogged()) {
    //   this.routerLink.navigate(['/app/home']);
    // }
  }

  login(): void {
    if (this.authForm.valid) {
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
  } else{
    this.toastr.error('Preencha os campos corretamente!');
}
  } 

}
