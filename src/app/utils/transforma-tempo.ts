export class TransformaTempo {
    public static transformaTempo(tempo: number): string {
        const horas = Math.floor(tempo / 3600);
        const minutos = Math.floor((tempo % 3600) / 60);
        const segundos = Math.floor(tempo % 60);
        return `${this.formatarNumero(horas)}:${this.formatarNumero(minutos)}:${this.formatarNumero(segundos)}`;
    }

    private static formatarNumero(numero: number): string {
        return numero < 10 ? `0${numero}` : `${numero}`;
      }
}
