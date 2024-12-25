import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cronograma } from '../models/cronograma';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { tap, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class CronogramaService {

  private readonly API = 'http://localhost:8080/cronograma';
  constructor(private http: HttpClient, private authService: AuthService) {

  }

  cadastrar(cronograma: Cronograma): Observable<Cronograma> {
    const user = this.authService.getUsuarioAtual();
    const headers = { Authorization: `Bearer ${user?.getToken()}` };
    return this.http.post<Cronograma>(`${this.API}/cadastrar/${user?.getCod()}`,
      {
        data: cronograma.data,
        conteudo: cronograma.conteudo,
        descricao: cronograma.descricao,
        materiaCod: cronograma.materiaCod
      }, { headers }).pipe(tap(response => {
        console.log("Cronograma cadastrado.", response);
      }, map(response => {
        return response;
      })));
  }
  listar(): Observable<Cronograma[]> {
    const user = this.authService.getUsuarioAtual();
    const headers = { Authorization: `Bearer ${user?.getToken()}` };
    return this.http.get<Cronograma[]>(`${this.API}/listar/${user?.getCod()}`, { headers }).pipe(tap(response => {
      console.log("Cronogramas recebidos.", response);
    }), map(response => {
      return response;
    }));
  }

    listarCronogramaDeHoje(page:number): Observable<Cronograma[]> {
      const user = this.authService.getUsuarioAtual();
      const headers = { Authorization: `Bearer ${user?.getToken()}` };
      return this.http.get<{content: Cronograma[]}>(`${this.API}/listar/daily/${user?.getCod()}/page?page=${page}`, { headers }).pipe(tap(response =>{
        console.log("Registros de estudo recebidos.", response);
      }), map(response => {
        return response.content;
      }))
    }

    listarCronogramaAtrasados(page:number): Observable<Cronograma[]> {
      const user = this.authService.getUsuarioAtual();
      const headers = { Authorization: `Bearer ${user?.getToken()}` };
      return this.http.get<{content: Cronograma[]}>(`${this.API}/listar/atrasados/${user?.getCod()}/page?page=${page}`, { headers }).pipe(tap(response =>{
        console.log("Registros de estudo recebidos.", response);
      }), map(response => {
        return response.content;
      }))
    }

    concluirItemCronograma(cod: string, isConcluido: boolean): Observable<Cronograma> {
      const user = this.authService.getUsuarioAtual();
      const headers = { Authorization: `Bearer ${user?.getToken()}` };
      return this.http.put<Cronograma>(`${this.API}/concluir`, {
        cod: cod,
        concluido: isConcluido
      }, {headers}).pipe(tap((response: Cronograma) => {
        console.log("Item atualizado", response)
      }))
    }

  editar(cronograma: Cronograma): Observable<Cronograma> {
    const user = this.authService.getUsuarioAtual();
    const headers = { Authorization: `Bearer ${user?.getToken()}` };
    return this.http.put<Cronograma>(`${this.API}/editar/${user?.getCod()}`, {
      cod: cronograma.cod,
      data: cronograma.data,
      conteudo: cronograma.conteudo,
      descricao: cronograma.descricao,
      materiaCod: cronograma.materiaCod,
      concluido: cronograma.concluido
    }, { headers }).pipe(tap(response => {
      console.log("Cronograma editado.", response);
    }), map(response => {
      return response;
    }))
  }

  excluir(cod: string): Observable<Cronograma> {
    const user = this.authService.getUsuarioAtual();
    const headers = { Authorization: `Bearer ${user?.getToken()}` }
    return this.http.delete<Cronograma>(`${this.API}/excluir/${cod}`, { headers }).pipe(tap(response => {
      console.log("Cronograma excluído.", response);
    }), map(response => {
      return response;
    }))
  }
}
