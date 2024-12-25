export class Pontuacao {
    static calcularPontuacao(tempo: number) : number {
        return (tempo / 1800) * 10;
    }
}
