export class StringFormatter {
    static materiaFormatter(string: string): string {
        const stringSeparada = string.split(" |");
        const materia = stringSeparada[0] ? stringSeparada[0].trim() : "";
        return materia;
    }
    static conteudoFormatter(string: string): string {
        const stringSeparada = string.split(" |");
        const conteudo = stringSeparada[1] ? stringSeparada[1].trim() : "";
        return conteudo;
    }
}
