export class User {
  private cod: string;
  private nome: string;
  private email: string;
  private token: string;

    constructor(cod: string, nome: string, email: string, token: string) {
        this.cod = cod;
        this.nome = nome;
        this.email = email;
        this.token = token;
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

}