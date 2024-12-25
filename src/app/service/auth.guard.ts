import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  canActivate(): boolean {
    if (this.authService.getUsuarioAtual() != null) {
      console.log('Usuário logado');
      return true;
    } else {
      this.router.navigate(['/auth']);
      this.toastr.error('Você precisa estar logado para acessar essa página');
      return false;
    }
  }
}