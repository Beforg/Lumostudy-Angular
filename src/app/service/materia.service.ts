import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Materia } from '../models/materia';
import { User } from '../models/user';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class MateriaService {
  private user: User | null = null;
  private headers!: {Authorization: string};
  readonly APIURL: string = 'http://localhost:8080/materia';

  constructor(private http: HttpClient, private authService: AuthService) {
      this.user = this.authService.getUsuarioAtual();
      this.headers = {Authorization: `Bearer ${this.user?.getToken()}`};
   }
   
   getMaterias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(`${this.APIURL}/listar/${this.user?.getCod()}`, {headers: this.headers}).pipe(tap(response => {
      console.log("Matérias recebidas.", response)
    }
    ));
   }

   getMateriasPaginadas(pag: number): Observable<Materia[]> {
    return this.http.get<{ content: Materia[]}>(`${this.APIURL}/listar/${this.user?.getCod()}/page?page=${pag}`, { headers: this.headers }).pipe(
      tap(response => {
        console.log("Matérias recebidas.", response);
      }),
      map(response => response.content)
    );
   }

   getCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.APIURL}/categorias/${this.user?.getCod()}`, {headers: this.headers}).pipe(tap(response => {
      console.log("Conteúdos recebidos.", response)
    }));
   }

   cadastrarMateria(materia: Materia): Observable<any> {
      return this.http.post<Materia>(`${this.APIURL}/cadastrar/${this.user?.getCod()}`,
        {
          nome: materia.nome,
          categoria: materia.categoria
        }
      , {headers: this.headers}).pipe(tap(response => {
        console.log("Matéria cadastrada.", response)
      }));
   }

   atualizarMateria(nome: string, categoria: string, cod: string): Observable<Materia> {
    return this.http.put<Materia>(`${this.APIURL}/editar`, {
      cod: cod,
      nome: nome,
      categoria: categoria
    }, { headers: this.headers }).pipe(tap(response => {
      console.log("Matéria atualizada.", response);
    }));
  }
   excluirMateria(cod: string) {
    return this.http.delete(`${this.APIURL}/excluir/${cod}`, { headers: this.headers }).pipe(tap(response => {
      console.log("Matéria excluída.", response)}));
   }
}
