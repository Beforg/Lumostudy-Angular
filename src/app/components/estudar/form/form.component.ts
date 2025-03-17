import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {
  @Input() reesForm!: FormGroup;
  @Input() materias!: any[];
  @Input() conteudo!: any[];
  @Input() isNovoConteudo!: boolean;
  @Output() alterarConteudoPorMateria = new EventEmitter<any>();
  @Output() novoConteudo = new EventEmitter<any>();
  @Output() registrarEstudo = new EventEmitter<any>();

  handleAlterarConteudoPorMateria(): void {
    this.alterarConteudoPorMateria.emit();
  }

  handleNovoConteudo(): void {
    this.novoConteudo.emit();
  }

  handleRegistrarEstudo(): void {
    this.registrarEstudo.emit();
  }
}
