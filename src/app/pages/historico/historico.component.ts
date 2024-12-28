import { Component, NgModule, OnInit } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { ReesService } from '../../service/rees.service';
import { Rees } from '../../models/rees';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe } from '@angular/common';
import { map } from 'rxjs/operators';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReesForm } from '../../models/rees.form';
import { Validators } from '@angular/forms';
import { InputComponent } from '../../shared/input/input.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { MateriaService } from '../../service/materia.service';
import { Materia } from '../../models/materia';
import { TransformaTempo } from '../../utils/transforma-tempo';



@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [HeaderLumoappComponent, MenuLumoappComponent, CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  providers: [ReesService, DatePipe, MateriaService, FormsModule],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.css'
})
export class HistoricoComponent implements OnInit {
  registros!: Rees[]; 
  reesForm!: FormGroup<ReesForm>;
  isEditarOpen: boolean = false;
  isNovoConteudo: boolean = false;
  materias: { value: string, label: string }[] = [];
  conteudo: { value: string, label: string }[] = [];
  codRegistroSelecionado!: string;
  readingImg: string = '/app/reading.png';
  totalSessoes: number = 0;
  tempoEstudadoString: string = '';
  tempoTotalEstudado: number = 0;
  page: number = 1
  itensPageSize: number = 0;
  x: string = '/app/x.png';
  constructor(
    private reesService: ReesService, 
    private toastrService: ToastrService,
    private datePipe: DatePipe, 
    private materiaService: MateriaService) { 
    this.reesForm = new FormGroup({
      codMateria: new FormControl('', Validators.required),
      conteudo: new FormControl(''),
      conteudoTexto: new FormControl(''),
      descricao: new FormControl(''),
      isNovoConteudo: new FormControl(false)
  
    })
    this.reesForm.get('isNovoConteudo')?.valueChanges.subscribe((value: boolean) => {
      if (value) {
        this.reesForm.get('conteudoTexto')?.setValidators(Validators.required);
        this.reesForm.get('conteudo')?.clearValidators();
      } else {
        this.reesForm.get('conteudo')?.setValidators(Validators.required);
        this.reesForm.get('conteudoTexto')?.clearValidators();
      }
      this.reesForm.get('conteudo')?.updateValueAndValidity(); 
      this.reesForm.get('conteudoTexto')?.updateValueAndValidity();
    })
  }

  ngOnInit(): void {  
    this.getHistorico();
    this.getHistoricoTotal();
  }

  voltarPagina() {
    if (this.page > 1){
      this.page--;
      this.getHistorico();
    }
    
  }

  proximaPagina() {
    if (this.itensPageSize == 10) 
    {
      this.page++
      this.getHistorico();
    }

  }

  
  getMaterias(): void{
        this.materiaService.getMaterias().subscribe((materias: Materia[]) => {
          this.materias = [{ value: '', label: 'Selecione a Matéria' }, ...materias.map(materia => ({
            value: materia.cod,
            label: materia.nome
          }))];
        });
  }

  alterarConteudoPorMateria(): void {
    if(this.reesForm.get('codMateria')?.value === '') {
      this.reesForm.get('conteudo')?.setValue('');
      this.reesForm.get('conteudoTexto')?.setValue('');
      this.conteudo = [];
      return;
    } else {
      this.reesService.listarConteudo(this.reesForm.get('codMateria')?.value).subscribe((conteudo: string[]) => {
        this.conteudo = [{ value: '', label: 'Selecione o Conteúdo' }, ...conteudo.map(c => ({
          value: c,
          label: c
        }))];
      });
    }
  }

  
  novoConteudo() {
    if (this.isNovoConteudo) {
      this.isNovoConteudo = false;
    } else {
      this.isNovoConteudo = true;
    }
  }
  excluirRegistroDeEstudo(item: Rees, event: Event): void {   
    event.stopPropagation();
    if (confirm("Deseja realmente excluir este registro de estudo?")) {
      this.reesService.excluirRegistroDeEstudo(item.codRegistro).subscribe(() => {
        this.toastrService.success("Registro de estudo excluído com sucesso.");
        this.getHistorico();
      });
    }
  }

  abrirEdicaoRegistroEstudo(item: Rees): void {
      this.getMaterias();
      this.codRegistroSelecionado = item.codRegistro;
      this.reesForm.get('descricao')?.setValue(item.descricao);
      this.isEditarOpen = true;

  }

  fecharEdicaoRegistroEstudo(): void {
    this.isEditarOpen = false;
    this.reesForm.reset();
  }

  editarRegistroDeEstudos(): void {
    let conteudo = this.reesForm.get('conteudo')?.value;
    if (this.reesForm.invalid) {
      this.toastrService.error("Preencha todos os campos corretamente.");
      return;
    }

    if (this.reesForm.get('isNovoConteudo')?.value == false && this.reesForm.get('conteudo')?.value === '') { 
      this.toastrService.error("Selecione um conteúdo.");
      return;
    }

    if (this.reesForm.get('isNovoConteudo')?.value) {
      conteudo = this.reesForm.get('conteudoTexto')?.value;
    }
    const rees: Rees = {
      tempo: '',
      conteudo: conteudo,
      descricao: this.reesForm.get('descricao')?.value,
      codMateria: this.reesForm.get('codMateria')?.value,
      codRegistro: this.codRegistroSelecionado,
      nomeMateria: '',
      data: null
  }
  this.reesService.editarRegistroDeEstudo(rees).subscribe(() => {
    this.toastrService.success("Registro de estudo editado com sucesso.");
    this.getHistorico();
    this.isEditarOpen = false;
    this.isNovoConteudo = false;
    this.reesForm.reset();
  });

}
  

  getHistorico(): void {
    this.reesService.listarRegistrosDeEstudo(this.page - 1).pipe(
      map(dados => dados.map(registro => ({
        ...registro,
        data: this.datePipe.transform(registro.data, 'dd/MM/yyyy')
        
      })))
    ).subscribe(dados => {
      this.registros = dados;
      this.itensPageSize = dados.length;
    });
  }

  getHistoricoTotal(): void {
    this.reesService.listarTodosRegistrosDeEstudo().pipe().subscribe(dados => {
      this.registros = dados;
      this.tempoEstudadoString = TransformaTempo.getTempoDeEstudos(this.registros, this.tempoTotalEstudado, this.tempoEstudadoString);
      dados.forEach((item) => {
        this.totalSessoes++;
      })
    });
  }

}
