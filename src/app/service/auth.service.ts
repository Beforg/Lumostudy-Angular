import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user';
import { RegistrerDTO } from '../models/register.dto';
import { LoginResponse } from '../models/login.response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   
  private readonly API = 'http://localhost:8080/auth'

  constructor(private httpClient: HttpClient, private cookieService: CookieService) {

   }

   login(email: string, senha: string): Observable<LoginResponse> {
      return this.httpClient.post<LoginResponse>(`${this.API}/login`, { email, senha }).pipe(tap((response) => {
          const user = new User(response.cod, response.nome, response.email, response.token);
          this.cookieService.set('usuarioAtual', JSON.stringify(user), { secure: true, sameSite: 'Strict' });
      }));
   }

   cadastro(user: User, password: string): Observable<RegistrerDTO> {
      const dto: RegistrerDTO = {
          email: user.getEmail(),
          senha: password,
          nome: user.getNome()
      }
      return this.httpClient.post<RegistrerDTO>(`${this.API}/registrar`, dto).pipe();
   }

   getUsuarioAtual(): User | null {
      const usuarioJson = this.cookieService.get('usuarioAtual');
      if (usuarioJson) {
            const usuario = JSON.parse(usuarioJson);
            
            return new User(usuario.cod, usuario.nome, usuario.email, usuario.token);
      }
      return null;
   }

   isLogged(): boolean {
      return this.cookieService.check('usuarioAtual');
   }

   logout(): void {
      this.cookieService.delete('usuarioAtual', '/app');
      this.cookieService.delete('usuarioAtual', '/');
   }
}
