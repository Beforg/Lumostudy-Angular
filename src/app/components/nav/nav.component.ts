import { Component, Input, Output, EventEmitter
 } from '@angular/core';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent {
  @Input() page!: number;
  @Input() type: string = '';
  @Output() nextPageEvent = new EventEmitter<string>();
  @Output() previousPageEvent = new EventEmitter<string>();

  nextPage(type: string): void {
    this.nextPageEvent.emit(type);
  }

  previousPage(type: string): void {
    this.previousPageEvent.emit(type);
  }
}
