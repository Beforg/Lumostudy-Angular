import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  titleIco: string = '/app/card-title-ico.png'
  titleIcoDone: string = '/app/card-title-done.png'
  descIco: string = '/app/card-desc-ico.png'
  @Input() item: any;
  @Output() concluir = new EventEmitter<any>();


  onConcluirEstudo() {
    this.concluir.emit(this.item);
  }

  verificaItemCronogramaAtrasado(item: any): boolean {
      // verifica se o item do cronograma está atrasado
      const dataItem = new Date(item.data);
      const hoje = new Date();
      if (
        new Date(item.data).toISOString().split('T')[0] ===
        hoje.toISOString().split('T')[0]
      ) {
        return false;
      } else if (dataItem < hoje && item.concluido) {
        return false;
      } else {
        return dataItem < hoje && !item.concluido;
      }
    }
}
