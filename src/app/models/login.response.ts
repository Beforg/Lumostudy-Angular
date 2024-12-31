export interface LoginResponse {
    token: string;
    cod: string;
    email: string;
    nome: string;
    username: string;
    foto: Uint8Array | null;
}