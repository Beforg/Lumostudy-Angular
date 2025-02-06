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

  private user: User | null = null;
  private headers!: { Authorization: string };
  readonly APIURL: string = 'http://localhost:8080/rees';  
  constructor(private http: HttpClient, private authService: AuthService) { 
    this.user = this.authService.getUsuarioAtual();
    this.headers = { Authorization: `Bearer ${this.user?.getToken()}` };
  }

  listarConteudo(codConteudo: string): Observable<any> {
    return this.http.get(`${this.APIURL}/conteudo/${codConteudo}`, { headers: this.headers }).pipe(tap(response => {
      console.log("Conteúdo listado.", response);
    }));
  }

  listarRegistrosDeEstudo(page:number): Observable<Rees[]> {
    return this.http.get<{content: Rees[]}>(`${this.APIURL}/listar/${this.user?.getCod()}/page?page=${page}`, {headers: this.headers }).pipe(tap(response =>{
      console.log("Registros de estudo recebidos.", response);
    }), map(response => {
      return response.content;
    }))
  }

  listarTodosRegistrosDeEstudo(): Observable<Rees[]> {
    return this.http.get<Rees[]>(`${this.APIURL}/listar/${this.user?.getCod()}`, { headers: this.headers }).pipe(tap(response =>{
      console.log("Registros de estudo recebidos.", response);
    }))
  }

  listarRegistrosDeEstudoPorData(page:number, data: string): Observable<Rees[]> {
    return this.http.get<{content: Rees[]}>(`${this.APIURL}/listar/${this.user?.getCod()}/${data}/page?page=${page}`, { headers: this.headers }).pipe(tap(response =>{
      console.log(`Registros recebidos da data ${data}:`, response);
    }), map(response => {
      return response.content;
    }))
  }

  excluirRegistroDeEstudo(codRegistro: string): Observable<any> {
    return this.http.delete(`${this.APIURL}/excluir/${codRegistro}`, { headers: this.headers }).pipe(tap(response => {
      console.log("Registro de estudo excluído.", response);
    }));
  }

  editarRegistroDeEstudo(rees: Rees): Observable<Rees> {
    return this.http.put<Rees>(`${this.APIURL}/editar`, {
      codRegistro: rees.codRegistro,
      conteudo: rees.conteudo,
      descricao: rees.descricao,
      codMateria: rees.codMateria,
    }, { headers: this.headers }).pipe(tap(response => {
      console.log("Registro de estudo editado.", response);
    }));
  }


  registrarEstudo(data: any): Observable<Rees> {
    return this.http.post<Rees>(`${this.APIURL}/cadastrar/${this.user?.getCod()}`, {
      tempo: data.tempo,
      conteudo: data.conteudo,
      descricao: data.descricao,
      codMateria: data.codMateria,
      pontuacao: data.pontuacao
    }, { headers: this.headers }).pipe(
      tap(response => {
        console.log("Estudo registrado.", response);
      }) );
  }

  editarConteudo(codMateria: string, oldName: string, newName: string): Observable<void> {
    return this.http.put<void>(`${this.APIURL}/editar/conteudo`, {cod: codMateria, oldName: oldName, newName: newName}, { headers: this.headers }).pipe(tap(response => {
      console.log("Conteúdo editado.", response);
    }));
  }
}
