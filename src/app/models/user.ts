export class User {
  private cod: string;
  private nome: string;
  private email: string;
  private token: string;
  private username: string; 
  private pontuacao: number;
  private dataCriacao: string;

    constructor(cod: string, nome: string, email: string, token: string, username: string, pontuacao: number, dataCriacao: string) {
        this.cod = cod;
        this.nome = nome;
        this.email = email;
        this.token = token;
        this.username = username;
        this.pontuacao = pontuacao;
        this.dataCriacao = dataCriacao;
    }

    public getCod(): string {
        return this.cod;
    }

    public setCod(cod: string): void {
        this.cod = cod;
    }

    public getNome(): string {
        return this.nome;
    }

    public setNome(nome: string): void {
        this.nome = nome;
    }

    public getEmail(): string {
        return this.email;
    }

    public setEmail(email: string): void {
        this.email = email;
    }
    public getToken(): string {
        return this.token;
    }

    public setToken(token: string): void {
        this.token = token;
    }

    public getUsername(): string {
        return this.username;
    }

    public getPontuacao(): number {
        return this.pontuacao;
    }

    public getDataCriacao(): string {
        return this.dataCriacao;
    }
}