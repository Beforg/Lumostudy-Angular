import { CommonModule, NgClass } from '@angular/common';
import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() isDisabled: boolean = false;
  @Input() typeClass: string = "";
  @Input() customClass: string = "";
  @Input() texto: string = "";
  @Input() ico: string = "";

}
