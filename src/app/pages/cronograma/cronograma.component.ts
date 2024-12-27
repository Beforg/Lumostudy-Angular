import { Component, OnInit } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { CronogramaService } from '../../service/cronograma.service';
import { Cronograma } from '../../models/cronograma';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from "../../shared/button/button.component";
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CronogramaForm } from '../../models/cronograma.form';
import { InputComponent } from "../../shared/input/input.component";
import { MateriaService } from '../../service/materia.service';
import { ReesService } from '../../service/rees.service';
import { Materia } from '../../models/materia';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-cronograma',
  standalone: true,
  imports: [HeaderLumoappComponent, MenuLumoappComponent, ButtonComponent, CommonModule, ReactiveFormsModule, InputComponent],
  providers: [CronogramaService, MateriaService, ReesService],
    animations: [
      trigger('fadeInOut', [
          transition(':enter', [
              style({ opacity: 0 }),
              animate('300ms', style({ opacity: 1 }))
          ]),
          transition(':leave', [
              animate('300ms', style({ opacity: 0 }))
          ])
      ])
  ],
  templateUrl: './cronograma.component.html',
  styleUrl: './cronograma.component.css'
})
export class CronogramaComponent implements OnInit {
  cronogramaForm!: FormGroup<CronogramaForm>;
  isVisualizarItemAtivo: boolean = false;
  edit: string = '/app/edit.png';
  x: string = '/app/x.png';
  itemSelecionado: Cronograma | null = null;
  hoje = new Date();
  semana: Date[] = [];
  cronogramImg: string = '/app/cronogram-img.png';
  itens: Cronograma[] = [];
  materias: { value: string, label: string }[] = [];
  conteudo: { value: string, label: string }[] = [];
  isNovoConteudo: boolean = false;
  isAdicionarAtivo: boolean = false;
  isEditarItem: boolean = false;
  constructor(private cronogramaService: CronogramaService, private toastr: ToastrService, private materiaService: MateriaService, private reesService: ReesService) {
    this.cronogramaForm = new FormGroup<CronogramaForm>({
      data: new FormControl('', Validators.required),
      conteudo: new FormControl('', Validators.required),
      descricao: new FormControl(''),
      materiaCod: new FormControl('', Validators.required),
      isNovoConteudo: new FormControl(false),
      conteudoNovo: new FormControl('')
    })
    this.cronogramaForm.get('isNovoConteudo')?.valueChanges.subscribe((value) => {
      if (value) {
        this.cronogramaForm.get('conteudo')?.clearValidators();
        this.cronogramaForm.get('conteudoNovo')?.setValidators([Validators.required]);
      } else {
        this.cronogramaForm.get('conteudoNovo')?.clearValidators();
        this.cronogramaForm.get('conteudo')?.setValidators([Validators.required]);
      }
      this.cronogramaForm.get('conteudo')?.updateValueAndValidity();
      this.cronogramaForm.get('conteudoNovo')?.updateValueAndValidity();
    });
  }

  exibirNovoConteudo(): void {
    if (this.isNovoConteudo) {
      this.isNovoConteudo = false;
    } else {
      this.isNovoConteudo = true;
    }
    console.log(this.isNovoConteudo);
  }

  ngOnInit(): void {
    this.materiaService.getMaterias().subscribe((materias: Materia[]) => {
      this.materias = [{ value: '', label: 'Selecione a Matéria' }, ...materias.map(materia => ({
        value: materia.cod,
        label: materia.nome
      }))];
    });
    this.getItensCronograma();
    this.setSemanaAtual(new Date());
  }

  visualizarItem(item: Cronograma): void {
    this.isVisualizarItemAtivo = true;
    this.itemSelecionado = item;
  }

  editarItemSelecionado() {
    this.isVisualizarItemAtivo = false;
    this.isEditarItem = true;
    this.cronogramaForm.get('data')?.setValue(this.itemSelecionado?.data);
    this.cronogramaForm.get('descricao')?.setValue(this.itemSelecionado?.descricao);
  }

  fecharItem() {
    this.isVisualizarItemAtivo = false;
    this.itemSelecionado = null;
  }

  cadastrarAoCronograma(): void {
    let conteudo = this.getMateriaLabel(this.cronogramaForm.get('materiaCod')?.value) + ' | ' + this.cronogramaForm.get('conteudo')?.value
    if (!this.cronogramaForm.get('conteudo')?.hasValidator(Validators.required)) {
      conteudo = this.getMateriaLabel(this.cronogramaForm.get('materiaCod')?.value) + ' | ' + this.cronogramaForm.get('conteudoNovo')?.value
    }

    if (this.cronogramaForm.valid) {
      const cronograma = {
        cod: '',
        data: this.cronogramaForm.get('data')?.value,
        conteudo: conteudo,
        descricao: this.cronogramaForm.get('descricao')?.value,
        materiaCod: this.cronogramaForm.get('materiaCod')?.value,
        concluido: false
      }
      this.cronogramaService.cadastrar(cronograma).subscribe({
        next: () => {
          this.toastr.success('Cronograma cadastrado com sucesso.');
          this.getItensCronograma();
          this.cronogramaForm.reset();
        },
        error: (error) => {
          this.toastr.error('Erro ao cadastrar cronograma.', error);
        }
      })
    } else {
      this.toastr.error("Preencha todos os campos!");
    }

  }

  editarItemCronograma() {
    let conteudo = this.getMateriaLabel(this.cronogramaForm.get('materiaCod')?.value) + ' | ' + this.cronogramaForm.get('conteudo')?.value
    if (!this.cronogramaForm.get('conteudo')?.hasValidator(Validators.required)) {
      conteudo = this.getMateriaLabel(this.cronogramaForm.get('materiaCod')?.value) + ' | ' + this.cronogramaForm.get('conteudoNovo')?.value
    }
    console.log(conteudo)
    if (this.itemSelecionado && this.cronogramaForm.valid) {
      const cronograma = {
        cod: this.itemSelecionado.cod,
        data: this.cronogramaForm.get('data')?.value,
        conteudo: conteudo,
        descricao: this.cronogramaForm.get('descricao')?.value,
        materiaCod: this.cronogramaForm.get('materiaCod')?.value,
        concluido: this.itemSelecionado.concluido
      }
      this.cronogramaService.editar(cronograma).subscribe({
        next: () => {
          this.toastr.success('Cronograma editado com sucesso.');
          this.getItensCronograma();
          this.isEditarItem = false;
          this.isVisualizarItemAtivo = false;
          this.cronogramaForm.reset();
        },
        error: (error) => {
          this.toastr.error('Erro ao editar cronograma.', error);
        }
      })
    } else {
      this.toastr.error("Preencha todos os campos!");
    }
  }

  excluirDoCronograma() {
    if (this.itemSelecionado && confirm('Deseja realmente excluir este item do cronograma?')) {
      this.cronogramaService.excluir(this.itemSelecionado.cod).subscribe({
        next: () => {
          this.toastr.success('Item excluído com sucesso.');
          this.getItensCronograma();
          this.isVisualizarItemAtivo = false;
        },
        error: (error) => {
          this.toastr.error('Erro ao excluir cronograma.', error);
        }
      })
    }
  }

  alterarConteudoPorMateria(): void {
    if (this.cronogramaForm.get('materiaCod')?.value === '') {
      this.cronogramaForm.get('conteudo')?.setValue('');
      this.conteudo = [];
      return;
    } else {
      this.reesService.listarConteudo(this.cronogramaForm.get('materiaCod')?.value).subscribe((conteudo: string[]) => {
        this.conteudo = [{ value: '', label: 'Selecione o Conteúdo' }, ...conteudo.map(c => ({
          value: c,
          label: c
        }))];
      })
    }
  }

  getMateriaLabel(value: string) {
    const materia = this.materias.find(materia => materia.value === value);
    return materia ? materia.label : '';
  }

  adicionarAoCronograma(): void {
    if (this.isAdicionarAtivo) {
      this.isAdicionarAtivo = false;
    } else {
      this.isAdicionarAtivo = true;
    }
  }

  setSemanaAtual(data: Date): void {
    const inicioDaSemana = this.getInicioDaSemana(data);
    this.semana = Array.from({ length: 7 }, (_, i) => new Date(inicioDaSemana.getTime() + i * 86400000));
  }
  getInicioDaSemana(data: Date): Date {
    const dia = data.getDay();
    const diferenca = data.getDate() - dia;
    const inicioDaSemana = new Date(data.setDate(diferenca));
    if (inicioDaSemana.getDay() !== 0) {
      inicioDaSemana.setDate(inicioDaSemana.getDate() - inicioDaSemana.getDay());
    }
    return inicioDaSemana;
  }
  getItensCronograma(): void {
    this.cronogramaService.listar().subscribe({
      next: (response) => {
        this.itens = response;
        console.log(this.itens);
      },
      error: (error) => {
        this.toastr.error('Erro ao buscar cronograma.', error);
      }
    })
  }

  getItensPorDia(data: Date): Cronograma[] {
    let dataFormatada = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
    dataFormatada.setDate(dataFormatada.getDate());
    const dataFormatadaStr = dataFormatada.toISOString().split('T')[0];
    return this.itens.filter(item => {
      const itemDataFormatada = new Date(item.data + 'T00:00:00').toISOString().split('T')[0];
      return itemDataFormatada === dataFormatadaStr;
    });
  }

  proximaSemana(): void {
    const proximaSemana = new Date(this.semana[0].getTime() + 7 * 86400000);
    this.setSemanaAtual(proximaSemana);
  }
  semanaAnterior(): void {

    const semanaAnterior = new Date(this.semana[0].getTime() - 7 * 86400000);
    this.setSemanaAtual(semanaAnterior);
  }
}
