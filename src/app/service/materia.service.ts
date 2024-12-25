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
  readonly APIURL: string = 'http://localhost:8080/materia';

  constructor(private http: HttpClient, private authService: AuthService) {
      this.user = this.authService.getUsuarioAtual();
   }
   
   getMaterias(): Observable<Materia[]> {
    const cod = this.user?.getCod()
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    })
    return this.http.get<Materia[]>(`${this.APIURL}/listar/${cod}`, {headers}) //add subscrip
   }

   getMateriasPaginadas(pag: number): Observable<Materia[]> {
    const cod = this.user?.getCod();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    })
    return this.http.get<{ content: Materia[]}>(`${this.APIURL}/listar/${cod}/page?page=${pag}`, { headers }).pipe(
      tap(response => {
        console.log("Matérias recebidas.", response);
      }),
      map(response => response.content)
    );
   }

   getCategorias(): Observable<string[]> {
    const cod = this.user?.getCod()
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    })
    return this.http.get<string[]>(`${this.APIURL}/categorias/${cod}`, {headers}).pipe(tap(response => {
      console.log("Conteúdos recebidos.", response)
    }), map(response => {
      return response
    }))
   }

   cadastrarMateria(materia: Materia): Observable<any> {
      const cod = this.user?.getCod()
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.user?.getToken()}`
      })
      return this.http.post<Materia>(`${this.APIURL}/cadastrar/${cod}`,
        {
          nome: materia.nome,
          categoria: materia.categoria
        }
      , {headers}).pipe(tap(response => {
        console.log("Matéria cadastrada.", response)
      }), map(response =>{
        return response
      }))
   }

   atualizarMateria(nome: string, categoria: string, cod: string): Observable<Materia> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    })
    return this.http.put<Materia>(`${this.APIURL}/editar`, {
      cod: cod,
      nome: nome,
      categoria: categoria
    }, { headers: headers });
  }
   excluirMateria(cod: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.user?.getToken()}`
    })
    return this.http.delete(`${this.APIURL}/excluir/${cod}`, { headers: headers });
   }
}
