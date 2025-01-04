import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../models/user';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContaService {

  private readonly API = 'http://localhost:8080/conta';
  private user!: User | null;
  private headers!: {Authorization: string};

  constructor(private http: HttpClient, private authService: AuthService) {
    this.user = this.authService.getUsuarioAtual();
    this.headers = {Authorization: `Bearer ${this.user?.getToken()}`};

   }

   uploadFoto(foto: File): Observable<any> {
    const data = new FormData();
    data.append('foto', foto, foto.name);
    return this.http.post(`${this.API}/${this.user?.getCod()}/foto`, data, {headers: this.headers}).pipe(
      map(response => {
        console.log("Foto enviada.", response);
        return response;
      })
    );
   }

   getImage(): Observable<any> {
    return this.http.get(`${this.API}/img/${this.user?.getCod()}`, {headers: this.headers, responseType: 'blob'}).pipe(
      map(response => {
        console.log("Foto recebida.", response);
        return response;
      })
    );
   }
   
}
