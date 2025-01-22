import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../../components/footer/footer.component";
import { InputComponent } from "../../shared/input/input.component";
import { ButtonComponent } from "../../shared/button/button.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

export interface ResetPasswordForm {
  password: FormControl;
  confirmPassword: FormControl;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FooterComponent, InputComponent, ButtonComponent, ReactiveFormsModule],
  providers: [AuthService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup<ResetPasswordForm>;
  token!: string;

  constructor (
    private authService: AuthService, 
    private toastrService: ToastrService,
    private activatedRoute: ActivatedRoute,
    private route: Router) {
    this.resetPasswordForm = new FormGroup<ResetPasswordForm>({
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', Validators.required),
    }, { validators: this.validatePassword as ValidatorFn });
  }

  ngOnInit(): void {
    this.token = this.activatedRoute.snapshot.paramMap.get('token')!;
  }

  validatePassword(control: AbstractControl) {
    const fg = control as FormGroup;
    const password = fg.get('password');
    const confirmPassword = fg.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value ? null : { notSame: true };
  }

  resetarSenha() {
    if (this.resetPasswordForm.valid && this.resetPasswordForm.value.password === this.resetPasswordForm.value.confirmPassword) {
      this.authService.resetarSenha(this.resetPasswordForm.value.password, this.token).subscribe({
        next: () => {
          this.toastrService.success('Senha alterada com sucesso!');
          this.authService.logout();
          this.route.navigate(['/auth']);
        },
        error: (error) => {
          this.toastrService.error('Erro ao alterar a senha!', error);

        }
      });
    }
  }

}
