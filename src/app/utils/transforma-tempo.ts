import { Rees } from '../models/rees';

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

    public static getTempoDeEstudos(item: Rees[], tempoDeEstudo: number, tempoDeEstudoFormatado: string): string {
      tempoDeEstudo = 0;
      item.forEach((item) => {
        const tempo = item.tempo.split(':');
        tempoDeEstudo += parseInt(tempo[0]) * 3600 + parseInt(tempo[1]) * 60 + parseInt(tempo[2]);
      })
      return tempoDeEstudoFormatado = TransformaTempo.transformaTempo(tempoDeEstudo);
    }
}
