import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { Rees } from '../models/rees';
import { AuthService } from './auth.service';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ReesService {

  user: User | null = null;
  readonly APIURL: string = 'http://localhost:8080/rees';  
  constructor(private http: HttpClient, private authService: AuthService) { 
    this.user = this.authService.getUsuarioAtual();
  }

  listarConteudo(codConteudo: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    });
    return this.http.get(`${this.APIURL}/conteudo/${codConteudo}`, { headers }).pipe(tap(response => {
      console.log("Conteúdo listado.", response);
    
    }), map(response => {
      return response;
    }));
  }

  listarRegistrosDeEstudo(page:number): Observable<Rees[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    })
    return this.http.get<{content: Rees[]}>(`${this.APIURL}/listar/${this.user?.getCod()}/page?page=${page}`, { headers }).pipe(tap(response =>{
      console.log("Registros de estudo recebidos.", response);
    }), map(response => {
      return response.content;
    }))
  }

  listarTodosRegistrosDeEstudo(): Observable<Rees[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    })
    return this.http.get<Rees[]>(`${this.APIURL}/listar/${this.user?.getCod()}`, { headers }).pipe(tap(response =>{
      console.log("Registros de estudo recebidos.", response);
    }), map(response => {
      return response;
    }))
  }

  listarRegistrosDeEstudoPorData(page:number, data: string): Observable<Rees[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    })
    return this.http.get<{content: Rees[]}>(`${this.APIURL}/listar/${this.user?.getCod()}/${data}/page?page=${page}`, { headers }).pipe(tap(response =>{
      console.log(`Registros recebidos da data ${data}:`, response);
    }), map(response => {
      return response.content;
    }))
  }

  excluirRegistroDeEstudo(codRegistro: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    });
    return this.http.delete(`${this.APIURL}/excluir/${codRegistro}`, { headers }).pipe(tap(response => {
      console.log("Registro de estudo excluído.", response);
    }), map(response => {
      return response;
    }));
  }

  editarRegistroDeEstudo(rees: Rees): Observable<Rees> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    });
    return this.http.put<Rees>(`${this.APIURL}/editar`, {
      codRegistro: rees.codRegistro,
      conteudo: rees.conteudo,
      descricao: rees.descricao,
      codMateria: rees.codMateria,
    }, { headers }).pipe(tap(response => {
      console.log("Registro de estudo editado.", response);
    }), map(response => {
      return response;
    }));
  }


  registrarEstudo(data: any): Observable<Rees> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    });
    return this.http.post<Rees>(`${this.APIURL}/cadastrar/${this.user?.getCod()}`, {
      tempo: data.tempo,
      conteudo: data.conteudo,
      descricao: data.descricao,
      codMateria: data.codMateria,
      pontuacao: data.pontuacao
    }, { headers }).pipe(
      tap(response => {
        console.log("Estudo registrado.", response);
      }),
      map(response => {
        return response;
      })
    );
  }
}
