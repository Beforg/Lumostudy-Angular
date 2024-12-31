import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cronograma } from '../models/cronograma';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { tap, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class CronogramaService {
  private user!: User | null;
  private headers!: { Authorization: string };
  private readonly API = 'http://localhost:8080/cronograma';
  constructor(private http: HttpClient, private authService: AuthService) {
    this.user = this.authService.getUsuarioAtual();
    this.headers = { Authorization: `Bearer ${this.user?.getToken()}` };
  }

  cadastrar(cronograma: Cronograma): Observable<Cronograma> {
    return this.http.post<Cronograma>(`${this.API}/cadastrar/${this.user?.getCod()}`,
      {
        data: cronograma.data,
        conteudo: cronograma.conteudo,
        descricao: cronograma.descricao,
        materiaCod: cronograma.materiaCod
      }, { headers: this.headers }).pipe(tap(response => {
        console.log("Cronograma cadastrado.", response);
      }, map(response => {
        return response;
      })));
  }
  listar(): Observable<Cronograma[]> {

    return this.http.get<Cronograma[]>(`${this.API}/listar/${this.user?.getCod()}`, { headers: this.headers }).pipe(tap(response => {
      console.log("Cronogramas recebidos.", response);
    }), map(response => {
      return response;
    }));
  }

    listarCronogramaDeHoje(page:number): Observable<Cronograma[]> {
      return this.http.get<{content: Cronograma[]}>(`${this.API}/listar/daily/${this.user?.getCod()}/page?page=${page}`, { headers: this.headers }).pipe(tap(response =>{
        console.log("Registros de estudo recebidos.", response);
      }), map(response => {
        return response.content;
      }))
    }

    listarCronogramaPorData(page:number, data: String): Observable<Cronograma[]> {
      return this.http.get<{content: Cronograma[]}>(`${this.API}/listar/${this.user?.getCod()}/${data}/page?page=${page}`, { headers: this.headers }).pipe(tap(response =>{
        console.log(`Estudos recebidos da data: ${data}`, response);
      }), map(response => {
        return response.content;
      }))
    }

    listarCronogramaAtrasados(page:number): Observable<Cronograma[]> {
      return this.http.get<{content: Cronograma[]}>(`${this.API}/listar/atrasados/${this.user?.getCod()}/page?page=${page}`, { headers: this.headers }).pipe(tap(response =>{
        console.log("Registros de estudo recebidos.", response);
      }), map(response => {
        return response.content;
      }))
    }

    concluirItemCronograma(cod: string, isConcluido: boolean): Observable<Cronograma> {
      return this.http.put<Cronograma>(`${this.API}/concluir`, {
        cod: cod,
        concluido: isConcluido
      }, {headers: this.headers}).pipe(tap((response: Cronograma) => {
        console.log("Item atualizado", response)
      }))
    }

  editar(cronograma: Cronograma): Observable<Cronograma> {
    return this.http.put<Cronograma>(`${this.API}/editar/${this.user?.getCod()}`, {
      cod: cronograma.cod,
      data: cronograma.data,
      conteudo: cronograma.conteudo,
      descricao: cronograma.descricao,
      materiaCod: cronograma.materiaCod,
      concluido: cronograma.concluido
    }, { headers: this.headers }).pipe(
      tap(response => {
      console.log("Cronograma editado.", response);
      }), 
      map(response => {
      return response;
    }))
  }

  excluir(cod: string): Observable<Cronograma> {
    return this.http.delete<Cronograma>(`${this.API}/excluir/${cod}`, { headers: this.headers }).pipe(
      tap(response => {
      console.log("Cronograma excluído.", response);
      }), 
      map(response => {
      return response;
      }))
  }
}
