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
}
