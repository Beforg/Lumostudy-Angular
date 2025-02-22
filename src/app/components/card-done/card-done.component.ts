import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-done',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-done.component.html',
  styleUrl: './card-done.component.css'
})
export class CardDoneComponent {
  @Input() registrosEstudo: any;
  titleIcoDone: string = '/app/card-title-done.png'
}
