import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css'
})
export class TimerComponent {
  @Input() pomodoroAtual: any;
  @Input() tempoPomodoro: any;
  @Input() tempoTotal: any;
  @Input() btAtivos!: any[];
  @Input() isMateriaSelecionada: any;
  @Input() isSessaoAtiva: any;
  @Output() iniciarSessao = new EventEmitter<any>();
  @Output() pausarSessao = new EventEmitter<any>();
  @Output() passarSessao = new EventEmitter<any>();


  handlePassarSessao(): void {
    this.passarSessao.emit();
  }

  handlePausarSessao(): void {
    this.pausarSessao.emit();
  }

  handleIniciarSessao(): void {
    this.iniciarSessao.emit();
  }

}
