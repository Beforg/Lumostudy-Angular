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
import { StringFormatter } from '../../utils/string-formatter';
import { CardComponent } from "../../components/card/card.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-cronograma',
  standalone: true,
  imports: [
    HeaderLumoappComponent,
    MenuLumoappComponent,
    ButtonComponent,
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    CardComponent,
    FooterComponent
],
  providers: [CronogramaService, MateriaService, ReesService],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
  templateUrl: './cronograma.component.html',
  styleUrl: './cronograma.component.css',
})
export class CronogramaComponent implements OnInit {
  cronogramaForm!: FormGroup<CronogramaForm>;

  edit: string = '/app/edit.png';
  x: string = '/app/trash.png';
  xWhite: string = '/app/trash-w.png';
  cronogramImg: string = '/app/cronogram-img.png';
  materiaIcon: string = '/app/card-title-ico.png';
  removerConcluidoIcon: string = '/app/circle.png';
  removerConcluidoIconWhite: string = '/app/circle-w.png';
  editWhite: string = '/app/edit-w.png';
  concluidoIcon: string = '/app/circle-check.png';
  concluidoIconWhite: string = '/app/circle-check-w.png';
  materiaIconConcluido: string = '/app/card-title-done.png';

  hoje = new Date();
  semana: Date[] = [];
  itens: Cronograma[] = [];
  itensCronogramaDia: Cronograma[] = [];
  materias: { value: string; label: string }[] = [];
  conteudo: { value: string; label: string }[] = [];
  itemSelecionado: Cronograma | null = null;

  isNovoConteudo: boolean = false;
  isAdicionarAtivo: boolean = false;
  isEditarItem: boolean = false;
  isContinuarAdicionando: boolean = false;
  isVisualizarItemAtivo: boolean = false;
  isVerTodosItens: boolean = false;

  constructor(
    private cronogramaService: CronogramaService,
    private toastr: ToastrService,
    private materiaService: MateriaService,
    private reesService: ReesService
  ) {
    this.cronogramaForm = new FormGroup<CronogramaForm>({
      data: new FormControl('', Validators.required),
      conteudo: new FormControl('', Validators.required),
      descricao: new FormControl(''),
      materiaCod: new FormControl('', Validators.required),
      isNovoConteudo: new FormControl(false),
      conteudoNovo: new FormControl(''),
    });
    this.cronogramaForm
      .get('isNovoConteudo')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.cronogramaForm.get('conteudo')?.clearValidators();
          this.cronogramaForm
            .get('conteudoNovo')
            ?.setValidators([Validators.required]);
        } else {
          this.cronogramaForm.get('conteudoNovo')?.clearValidators();
          this.cronogramaForm
            .get('conteudo')
            ?.setValidators([Validators.required]);
        }
        this.cronogramaForm.get('conteudo')?.updateValueAndValidity();
        this.cronogramaForm.get('conteudoNovo')?.updateValueAndValidity();
      });
  }

  getMateriaCard(string: string): string {
    return StringFormatter.materiaFormatter(string);
  }

  getConteudoCard(string: string): string {
    return StringFormatter.conteudoFormatter(string);
  }

  ngOnInit(): void {
    this.materiaService.getMaterias().subscribe((materias: Materia[]) => {
      this.materias = [
        { value: '', label: 'Selecione a Matéria' },
        ...materias.map((materia) => ({
          value: materia.cod,
          label: materia.nome,
        })),
      ];
    });
    this.getItensCronograma();
    this.setSemanaAtual(new Date());
  }

  exibirNovoConteudo(): void {
    // abre o input para colocar um novo conteúdo
    if (this.isNovoConteudo) {
      this.isNovoConteudo = false;
    } else {
      this.isNovoConteudo = true;
    }
  }

  switchClassCronograma(item: Cronograma): string {
    // alterna a classe do item do cronograma de acordo com o status de conclusão
    const dataItem = new Date(item.data);
    if (
      new Date(item.data).toISOString().split('T')[0] ===
      this.hoje.toISOString().split('T')[0] && !item.concluido
    ) {
      return "emdia";
    } else if (dataItem < this.hoje && item.concluido) {
      return "concluido";
    } else if (dataItem < this.hoje && !item.concluido) {
      return "atrasado";
    } else if (item.concluido) {
      return "concluido";
    } else {
      return "emdia";
    }
  }

  verificaItemCronogramaAtrasado(item: Cronograma): boolean {
    // verifica se o item do cronograma está atrasado
    const dataItem = new Date(item.data);
    if (
      new Date(item.data).toISOString().split('T')[0] ===
      this.hoje.toISOString().split('T')[0]
    ) {
      return false;
    } else if (dataItem < this.hoje && item.concluido) {
      return false;
    } else {
      return dataItem < this.hoje && !item.concluido;
    }
  }

  visualizarItem(item: Cronograma): void {
    // abre a janela com informações do item do cronograma
    this.isVisualizarItemAtivo = true;
    this.itemSelecionado = item;
  }

  concluirEstudo(item: Cronograma) { // altera o status de concluido do estudo
    this.cronogramaService.concluirItemCronograma(item.cod, !item.concluido).subscribe(() => {
      this.getItensCronograma();
      this.isVisualizarItemAtivo = false;
      this.toastr.success('Estudo atualizado!');
      if (this.isVerTodosItens) {
        console.log("Teria que atualizar.");
        this.exibirTodosItensDoDia(new Date(item.data));
      }
    })

  }

  exibirTodosItensDoDia(dia: Date): void {
    this.isVerTodosItens = !this.isVerTodosItens;
    if (this.isVerTodosItens) {
      this.getCronogramaPorDia(dia)
    }
  }

  getCronogramaPorDia(dia: Date): void {
    // retorna os itens do cronograma de acordo com a data
    this.itensCronogramaDia = this.itens.filter((item) => {
      const itemData = new Date(item.data + 'T00:00:00');
      return itemData.toISOString().split('T')[0] === dia.toISOString().split('T')[0];
    });
    console.log(this.itensCronogramaDia);
  }

  editarItemSelecionado() {
    // abre para edição do item do cronograma
    this.isVisualizarItemAtivo = false;
    this.isEditarItem = true;
    const conteudo = this.getConteudoCard(this.itemSelecionado?.conteudo || '');
    console.log(this.itemSelecionado);
    console.log(conteudo);
    if (this.itemSelecionado) {
    this.cronogramaForm.patchValue({
      materiaCod: this.itemSelecionado.materiaCod,
      conteudo: conteudo,
      data: this.itemSelecionado.data,
      descricao: this.itemSelecionado.descricao
    });
  }
    // this.cronogramaForm.get('materiaCod')?.setValue(this.itemSelecionado?.materiaCod);
    // this.cronogramaForm.get('conteudo')?.setValue(conteudo);
    // this.cronogramaForm.get('data')?.setValue(this.itemSelecionado?.data);
    // this.cronogramaForm
    //   .get('descricao')
    //   ?.setValue(this.itemSelecionado?.descricao);
  }

  fecharItem() {
    this.isVisualizarItemAtivo = false;
    this.itemSelecionado = null;
  }

  continuarAdicionando(): void {
    if (this.isContinuarAdicionando) {
      this.isContinuarAdicionando = false;
    } else {
      this.isContinuarAdicionando = true;
    }
  }

  cadastrarAoCronograma(): void {
    // cadastra um novo item no cronograma
    let conteudo =
      this.getMateriaLabel(this.cronogramaForm.get('materiaCod')?.value) +
      ' | ' +
      this.cronogramaForm.get('conteudo')?.value;
    if (
      !this.cronogramaForm.get('conteudo')?.hasValidator(Validators.required)
    ) {
      conteudo =
        this.getMateriaLabel(this.cronogramaForm.get('materiaCod')?.value) +
        ' | ' +
        this.cronogramaForm.get('conteudoNovo')?.value;
    }

    if (this.cronogramaForm.valid) {
      const cronograma = {
        cod: '',
        data: this.cronogramaForm.get('data')?.value,
        conteudo: conteudo,
        descricao: this.cronogramaForm.get('descricao')?.value,
        materiaCod: this.cronogramaForm.get('materiaCod')?.value,
        concluido: false,
      };
      this.cronogramaService.cadastrar(cronograma).subscribe({
        next: () => {
          this.toastr.success('Item cadastrado com sucesso.');
          this.getItensCronograma();
          console.log(this.isContinuarAdicionando);
          if (!this.isContinuarAdicionando) {
            this.isNovoConteudo = false;
            this.cronogramaForm.reset();
          }
        },
        error: (error) => {
          this.toastr.error('Erro ao cadastrar cronograma.', error);
        },
      });
    } else {
      this.toastr.error('Preencha todos os campos!');
    }
  }

  editarItemCronograma() {
    // edita um item do cronograma
    let conteudo =
      this.getMateriaLabel(this.cronogramaForm.get('materiaCod')?.value) +
      ' | ' +
      this.cronogramaForm.get('conteudo')?.value;
    if (
      !this.cronogramaForm.get('conteudo')?.hasValidator(Validators.required)
    ) {
      conteudo =
        this.getMateriaLabel(this.cronogramaForm.get('materiaCod')?.value) +
        ' | ' +
        this.cronogramaForm.get('conteudoNovo')?.value;
    }
    console.log(conteudo);
    if (this.itemSelecionado && this.cronogramaForm.valid) {
      const cronograma = {
        cod: this.itemSelecionado.cod,
        data: this.cronogramaForm.get('data')?.value,
        conteudo: conteudo,
        descricao: this.cronogramaForm.get('descricao')?.value,
        materiaCod: this.cronogramaForm.get('materiaCod')?.value,
        concluido: this.itemSelecionado.concluido,
      };
      this.cronogramaService.editar(cronograma).subscribe({
        next: () => {
          this.toastr.success('Cronograma editado com sucesso.');
          this.getItensCronograma();
          this.isEditarItem = false;
          this.isVisualizarItemAtivo = false;
          this.isNovoConteudo = false;
          this.cronogramaForm.reset();
          this.itemSelecionado = null;
        },
        error: (error) => {
          this.toastr.error('Erro ao editar cronograma.', error);
        },
      });
    } else {
      this.toastr.error('Preencha todos os campos!');
    }
  }

  excluirDoCronograma() {
    if (
      this.itemSelecionado &&
      confirm('Deseja realmente excluir este item do cronograma?')
    ) {
      this.cronogramaService.excluir(this.itemSelecionado.cod).subscribe({
        next: () => {
          this.toastr.success('Item excluído com sucesso.');
          this.getItensCronograma();
          this.isVisualizarItemAtivo = false;
        },
        error: (error) => {
          this.toastr.error('Erro ao excluir cronograma.', error);
        },
      });
    }
  }

  alterarConteudoPorMateria(): void {
    // altera o conteúdo de acordo com a matéria selecionada
    if (this.cronogramaForm.get('materiaCod')?.value === '') {
      this.cronogramaForm.get('conteudo')?.setValue('');
      this.conteudo = [];
      return;
    } else {
      this.reesService
        .listarConteudo(this.cronogramaForm.get('materiaCod')?.value)
        .subscribe((conteudo: string[]) => {
          this.conteudo = [
            { value: '', label: 'Selecione o Conteúdo' },
            ...conteudo.map((c) => ({
              value: c,
              label: c,
            })),
          ];
        });
    }
  }

  getMateriaLabel(value: string) {
    // retorna o nome da matéria de acordo com o código
    const materia = this.materias.find((materia) => materia.value === value);
    return materia ? materia.label : '';
  }

  adicionarAoCronograma(): void {
    // abre a janela para adicionar um item ao cronograma
    if (this.isAdicionarAtivo) {
      this.isAdicionarAtivo = false;
    } else {
      this.isAdicionarAtivo = true;
    }
    this.cronogramaForm.reset();
  }

  setSemanaAtual(data: Date): void {
    // cria um array com os dias da semana ( 86400000 ms = 1 dia)
    const inicioDaSemana = this.getInicioDaSemana(data);
    this.semana = Array.from(
      { length: 7 },
      (_, i) => new Date(inicioDaSemana.getTime() + i * 86400000)
    );
    //                           7 dias, a partir do início da semana
  }
  getInicioDaSemana(data: Date): Date {
    // retorna o início da semana
    const dia = data.getDay();
    const diferenca = data.getDate() - dia;
    const inicioDaSemana = new Date(data.setDate(diferenca));
    if (inicioDaSemana.getDay() !== 0) {
      inicioDaSemana.setDate(
        inicioDaSemana.getDate() - inicioDaSemana.getDay()
      );
    }
    return inicioDaSemana;
  }
  getItensCronograma(): void {
    // busca os itens do cronograma
    this.cronogramaService.listar().subscribe({
      next: (response) => {
        this.itens = response;
        console.log(this.itens);
      },
      error: (error) => {
        this.toastr.error('Erro ao buscar cronograma.', error);
      },
    });
  }

  getItensPorDia(data: Date): Cronograma[] {
    // retorna os itens do cronograma de acordo com a data para distribuir no cronograma
    let dataFormatada = new Date(
      Date.UTC(data.getFullYear(), data.getMonth(), data.getDate())
    );
    dataFormatada.setDate(dataFormatada.getDate());
    const dataFormatadaStr = dataFormatada.toISOString().split('T')[0];
    return this.itens.filter((item) => {
      const itemDataFormatada = new Date(item.data + 'T00:00:00')
        .toISOString()
        .split('T')[0];
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
