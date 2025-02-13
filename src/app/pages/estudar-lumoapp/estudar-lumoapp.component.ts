import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { InputComponent } from "../../shared/input/input.component";
import { ButtonComponent } from "../../shared/button/button.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PomodoroConfiguration } from '../../models/pomodoro.form';
import { Materia } from '../../models/materia';
import { MateriaService } from '../../service/materia.service';
import { ReesService } from '../../service/rees.service';
import { ReesForm } from '../../models/rees.form';
import { Pontuacao } from '../../utils/pontuacao';
import { ToastrService } from 'ngx-toastr';
import { Cronograma } from '../../models/cronograma';
import { CronogramaService } from '../../service/cronograma.service';
import { TransformaTempo } from '../../utils/transforma-tempo';
import { NavComponent } from "../../components/nav/nav.component";
import { CardComponent } from "../../components/card/card.component";
import { Estudar } from '../../utils/estudar';
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-estudar-lumoapp',
  standalone: true,
  imports: [
    HeaderLumoappComponent,
    MenuLumoappComponent,
    InputComponent,
    ButtonComponent,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    NavComponent,
    CardComponent,
    FooterComponent
],
  providers: [MateriaService, ReesService, CronogramaService],
  templateUrl: './estudar-lumoapp.component.html',
  styleUrl: './estudar-lumoapp.component.css'
})
export class EstudarLumoappComponent implements OnInit, OnDestroy {


  itensCronograma!: Cronograma[];
  pomodoroForm!: FormGroup<PomodoroConfiguration>;
  reesForm!: FormGroup<ReesForm>;

  tempoPomodoroSegundos: number = 0;
  tempoIntervaloCurto: number = 0;
  tempoIntervaloLongo: number = 0;
  ciclos: number = 0;
  tempoTotalEstudoSegundos: number = 0;
  tempoRestanteIntervalo: number = 0;

  isBreak: boolean = false;
  isCicloConcluido: boolean = false;
  b: boolean = false;
  isEstudando: boolean = false;
  isSessaoAtiva: boolean = false;
  isEstudosAtrasados: boolean = false;
  isNovoConteudo: boolean = false;
  isEstudarAtivo: boolean = true; // para mostrar a aba de estudar
  isConfiguracoesAtivo: boolean = false;
  isMateriaSelecionada: boolean = false // selecionar a materia pra liberar o cronometro

  btAtivos: boolean[] = [false, false] // iniciar e pausar

  workerBreakEnd: string = 'breakEnd';
  workerBreak: string = 'break';
  workerStop: string = 'stop';
  workerStart: string = 'start';
  workerStartBreak: string = 'startBreak';
  workerStopStudy: string = 'stopStudy';
  workerResumeBreak: string = 'resumeBreak';
  workerPassarSessao: string = 'passarSessao';
  workerFinalizarSessao: string = 'finalizarSessao';


  tempoTotal: string = '';
  tempoPomodoro: string = '';
  pomodoroAtual: string = `Sessão do Pomodoro #${this.ciclos + 1}`;
  audioPath: string = '/app/timer.mp3'
  clickPath: string = '/app/click.mp3'
  materias!: { value: string, label: string }[];
  conteudo!: { value: string, label: string }[];




  page: number = 1;
  pomodoroConfiguration: number[] = []; //configuracao do timer, shortBreak, longBreak, cycles
  qtdeItensCronograma: number = 0;
  private audio = new Audio(this.audioPath);
  private audioCick = new Audio(this.clickPath);
  private worker: Worker | null = null;

  constructor(
    private materiaService: MateriaService,
    private reesService: ReesService,
    private toastr: ToastrService,
    private cronogramaService: CronogramaService) {
    this.pomodoroForm = new FormGroup({
      timer: new FormControl('', Validators.required),
      shortBreak: new FormControl('', Validators.required),
      longBreak: new FormControl('', Validators.required),
      cycles: new FormControl('', Validators.required)
    });
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
    this.getMaterias();
    this.getCronogramaDoDia();
    if (localStorage.getItem('pomodoroConfiguration')) {
      this.pomodoroConfiguration = JSON.parse(localStorage.getItem('pomodoroConfiguration') as string);
    } else {
      this.pomodoroConfiguration = this.defaultPomodoro(this.pomodoroConfiguration);
      localStorage.setItem('pomodoroConfiguration', JSON.stringify(this.pomodoroConfiguration));
    }
    this.setPomodoroForm();

    // configura o worker para o timer (serve para o cronometro rodar mesmo em segundo plano)
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../../workers/timer.worker', import.meta.url));
      this.worker.onmessage = ({ data }) => {
        if (data === this.workerBreak) {
          this.isBreak = true;
          this.audio.play();
          this.startBreak();
        } else if (data === this.workerBreakEnd) {
          this.tempoTotalEstudoSegundos += 1;
          if (this.isCicloConcluido) {
            this.pomodoroAtual = `Sessão do Pomodoro #${this.pomodoroConfiguration[3]}: Intervalo concluído!`;
            this.isCicloConcluido = false;
          } else {
            this.pomodoroAtual = `Sessão do Pomodoro #${this.ciclos}: Intervalo concluído!`;
          }
          this.audio.play();
          this.isBreak = false;
          this.isEstudando = false;
          this.btAtivos = [false, false];
          this.tempoPomodoroSegundos = this.pomodoroConfiguration[0] * 60;
          // this.tempoPomodoro = this.transofrmarTempo(this.tempoPomodoroSegundos);
          this.tempoPomodoro = TransformaTempo.transformaTempo(this.tempoPomodoroSegundos);
        } else {
          if (data.tempoPomodoroSegundos !== undefined) {
            this.tempoPomodoroSegundos = data.tempoPomodoroSegundos;
            this.tempoTotalEstudoSegundos = data.tempoTotalEstudoSegundos;
            //this.tempoPomodoro = this.transofrmarTempo(this.tempoPomodoroSegundos);
            this.tempoPomodoro = TransformaTempo.transformaTempo(this.tempoPomodoroSegundos);
            //this.tempoTotal = this.transofrmarTempo(this.tempoTotalEstudoSegundos);
            this.tempoTotal = TransformaTempo.transformaTempo(this.tempoTotalEstudoSegundos);
          } else if (data.tempoIntervalo !== undefined) {
            // this.tempoPomodoro = this.transofrmarTempo(data.tempoIntervalo);
            this.tempoPomodoro = TransformaTempo.transformaTempo(data.tempoIntervalo);
            this.tempoRestanteIntervalo = data.tempoIntervalo;
          }
        }
      };
    }
  }

  ngOnDestroy(): void { // encerra o worker ao sair da página
    if (this.worker) {
      this.worker.terminate();
    }
  }

  @HostListener('window:beforeunload', ['$event']) // mensagem de confirmação ao sair da página com uma sessão de estudo ativa
  unloadNotification($event: any): void {
    if (this.isEstudando || this.isBreak || this.isSessaoAtiva) {
      $event.returnValue = 'Você tem uma sessão de estudo em andamento. Tem certeza de que deseja sair?';
    }
  }

  getCronogramaDoDia(): void { // lista os itens do cronograma do dia
    this.cronogramaService.listarCronogramaDeHoje(this.page - 1).subscribe((cronograma: Cronograma[]) => {
      this.itensCronograma = cronograma
      this.qtdeItensCronograma = cronograma.length;
    })
  }

  getMaterias(): void {
    this.materiaService.getMaterias().subscribe((materias: Materia[]) => {
      this.materias = [{ value: '', label: 'Selecione a Matéria' }, ...materias.map(materia => ({
        value: materia.cod,
        label: materia.nome
      }))];
    });
  }

  getCronogramaAtrasados(): void { // lista os itens do cronograma atrasados
    this.cronogramaService.listarCronogramaAtrasados(this.page - 1).subscribe((cronograma: Cronograma[]) => {
      this.itensCronograma = cronograma
      this.qtdeItensCronograma = cronograma.length;
    })
  }

  trocarAbaCronograma(): void { // troca a aba do cronograma entre o dia atual e os atrasados
    if (this.isEstudosAtrasados) {
      this.isEstudosAtrasados = false;
      this.getCronogramaDoDia();
    } else {
      this.isEstudosAtrasados = true;
      this.getCronogramaAtrasados();
    }
  }


  // navegacao entre as paginas do cronograma
  voltarPagina(): void {
    if (this.page > 1) {
      this.page--;
      this.abaEscolhida();
    }
  }

  abaEscolhida(): void { // carrega de acordo com a aba escolhida
    if (this.isEstudosAtrasados) {
      this.getCronogramaAtrasados();
    } else {
      this.getCronogramaDoDia();
    }
  }

  proximaPagina(): void {
    if (this.qtdeItensCronograma == 5) {
      this.page++;
      this.abaEscolhida();
    }
  }
  // fim da navegacao entre as paginas do cronograma

  concluirEstudo(item: Cronograma) { // altera o status de concluido do estudo
    this.cronogramaService.concluirItemCronograma(item.cod, !item.concluido).subscribe(() => {
      this.getCronogramaDoDia();
      this.toastr.success('Estudo atualizado!');

    })
    this.isEstudosAtrasados = false;
  }

  alterarConteudoPorMateria(): void { // altera o conteúdo de acordo com a matéria selecionada no input
    if (this.reesForm.get('codMateria')?.value === '') {
      this.isMateriaSelecionada = false;
      this.reesForm.get('conteudo')?.setValue('');
      this.reesForm.get('conteudoTexto')?.setValue('');
      this.conteudo = [];
      return;
    } else {
      this.isMateriaSelecionada = true;
      this.reesService.listarConteudo(this.reesForm.get('codMateria')?.value).subscribe((conteudo: string[]) => {
        this.conteudo = [{ value: '', label: 'Selecione o Conteúdo' }, ...conteudo.map(c => ({
          value: c,
          label: c
        }))];
      });
    }
  }

  // transofrmarTempo(tempo: number): string {
  //   const horas = Math.floor(tempo / 3600);
  //   const minutos = Math.floor((tempo % 3600) / 60);
  //   const segundos = tempo % 60;
  //   return `${this.formatarNumero(horas)}:${this.formatarNumero(minutos)}:${this.formatarNumero(segundos)}`;
  // }

  // formatarNumero(numero: number): string {
  //   return numero < 10 ? `0${numero}` : `${numero}`;
  // }

  defaultPomodoro(pomodoroConfiguration: number[]): number[] { // configuração padrão do pomodoro
    pomodoroConfiguration[0] = 50;
    pomodoroConfiguration[1] = 10;
    pomodoroConfiguration[2] = 15;
    pomodoroConfiguration[3] = 4;
    return pomodoroConfiguration;
  }

  setPomodoroForm(): void {  // seta as configurações do pomodoro
    this.tempoPomodoroSegundos = this.pomodoroConfiguration[0] * 60;
    this.tempoIntervaloCurto = this.pomodoroConfiguration[1] * 60;
    this.tempoIntervaloLongo = this.pomodoroConfiguration[2] * 60;
    this.pomodoroForm.get('timer')?.setValue(this.pomodoroConfiguration[0]);
    this.pomodoroForm.get('shortBreak')?.setValue(this.pomodoroConfiguration[1]);
    this.pomodoroForm.get('longBreak')?.setValue(this.pomodoroConfiguration[2]);
    this.pomodoroForm.get('cycles')?.setValue(this.pomodoroConfiguration[3]);
    // this.tempoPomodoro = this.transofrmarTempo(this.tempoPomodoroSegundos);
    // this.tempoTotal = this.transofrmarTempo(this.tempoTotalEstudoSegundos);
    this.tempoPomodoro = TransformaTempo.transformaTempo(this.tempoPomodoroSegundos);
    this.tempoTotal = TransformaTempo.transformaTempo(this.tempoTotalEstudoSegundos);

  }

  configurarPomodoro(): void { // atualiza as configurações do pomodoro
    this.reesForm.reset();
    if (this.pomodoroForm.valid) {
      this.pomodoroConfiguration[0] = this.pomodoroForm.get('timer')?.value;
      this.pomodoroConfiguration[1] = this.pomodoroForm.get('shortBreak')?.value;
      this.pomodoroConfiguration[2] = this.pomodoroForm.get('longBreak')?.value;
      this.pomodoroConfiguration[3] = this.pomodoroForm.get('cycles')?.value;
      localStorage.removeItem('pomodoroConfiguration');
      localStorage.setItem('pomodoroConfiguration', JSON.stringify(this.pomodoroConfiguration));
      this.toastr.success('Configuração salva com sucesso!');
      this.isConfiguracoesAtivo = false;
      this.isEstudarAtivo = true;
      this.ngOnInit();
    } else {
      this.toastr.error('Todos os campos da configuração do Pomodoro devem ser preenchidos!');
    }
  }

  iniciarPomodoro(): void { // inicia o pomodoro de acordo se está estudando ou em intervalo
    this.isSessaoAtiva = true;
    this.btAtivos = [true, false];
    if (!this.isEstudando && !this.isBreak) {
      this.audioCick.play();
      this.pomodoroAtual = `Sessão do Pomodoro #${this.ciclos + 1}`;
      this.isEstudando = true;
      if (this.worker) {
        this.worker.postMessage({
          action: this.workerStart,
          tempoPomodoroSegundos: this.tempoPomodoroSegundos,
          tempoTotalEstudoSegundos: this.tempoTotalEstudoSegundos
        });
      }
    } else {
      if (this.b) {
        this.audioCick.play();
        this.b = false;
        this.despausarIntervalo();
        console.log(this.tempoIntervaloCurto);
      }
    }
  }

  despausarIntervalo(): void { // despausa o intervalo
    if (this.isBreak) {
      if (this.worker) {
        this.worker.postMessage({
          action: this.workerResumeBreak,
          tempoIntervalo: this.tempoRestanteIntervalo
        });
      }
    }
  }

  passarSessao(): void { // passa a sessão do timer para o próximo ciclo ou intervalo
    if (!this.isSessaoAtiva) {
      return
    }
    if (confirm("Deseja passar a sessão do Timer?")) {
      this.iniciarPomodoro();
      if (this.worker) {
        this.worker.postMessage({ action: this.workerPassarSessao });
      }
    }

  }

  pausarPomodoro(): void { // pausa o pomodoro de acordo se está estudando (workerStopStudy) ou em intervalo (workerStop)
    this.btAtivos = [false, true];
    if (!this.isSessaoAtiva) {
      return
    }
    if (this.isEstudando) {
      this.isEstudando = false;
      if (this.worker) {
        this.worker.postMessage({ action: this.workerStopStudy });
      }
    } else {
      this.b = true;
      if (this.worker) {
        this.worker.postMessage({ action: this.workerStop });
      }
    }
  }

  resetarPomodoro(): void { // reiniciar o timer do pomodoro
    this.btAtivos = [false, false];
    if (!this.isSessaoAtiva || this.isBreak) {
      return
    }
    if (confirm("Deseja reiniciar o Timer?")) {
      this.isEstudando = false
      if (this.worker) {
        this.worker.postMessage({ action: this.workerStop });
      }
      this.tempoPomodoroSegundos = this.pomodoroConfiguration[0] * 60;
      // this.tempoPomodoro = this.transofrmarTempo(this.tempoPomodoroSegundos);
      this.tempoPomodoro = TransformaTempo.transformaTempo(this.tempoPomodoroSegundos);
    }
  }

  startBreak(): void { // inicia o intervalo de acordo com o tipo de intervalo
    this.b = false;
    this.isEstudando = false;
    if (this.ciclos == this.pomodoroConfiguration[3] - 1) {
      this.pomodoroAtual = `Sessão do Pomodoro #${this.ciclos + 1} Concluída! Iniciando Intervalo Longo`;
      this.ciclos = 0;
      if (this.worker) {
        this.worker.postMessage({
          action: this.workerStartBreak,
          tempoIntervalo: this.tempoIntervaloLongo
        });
      }
      this.isCicloConcluido = true;
    } else {
      this.pomodoroAtual = `Sessão do Pomodoro #${this.ciclos + 1} Concluída! Iniciando Intervalo Curto`;
      this.ciclos++;
      if (this.worker) {
        this.worker.postMessage({
          action: this.workerStartBreak,
          tempoIntervalo: this.tempoIntervaloCurto
        });
      }
    }
  }

  registrarEstudo() { // finaliza a sessão e registra o estudo
    if (!this.isSessaoAtiva) {
      this.toastr.info("Inicie uma sessão de estudo para registrar um estudo!");
      return;
    }

    if (this.reesForm.valid) {
      if (this.reesForm.get('isNovoConteudo')?.value == false && this.reesForm.get('conteudo')?.value == '') {
        this.toastr.error("Selecione um conteúdo ou adicione um novo!");
        return;
      }
      if (confirm("Deseja finalizar e registrar o estudo?")) {
        if (!this.isNovoConteudo) {
          this.reesForm.get('conteudoTexto')?.setValue(this.reesForm.get('conteudo')?.value);
        }
        //this.transofrmarTempo(this.tempoTotalEstudoSegundos),
        const data: any = {
          tempo: TransformaTempo.transformaTempo(this.tempoTotalEstudoSegundos),
          conteudo: this.reesForm.get('conteudoTexto')?.value,
          descricao: this.reesForm.get('descricao')?.value,
          codMateria: this.reesForm.get('codMateria')?.value,
          pontuacao: Pontuacao.calcularPontuacao(this.tempoTotalEstudoSegundos)
        }
        this.reesService.registrarEstudo(data).subscribe(() => {
          this.isNovoConteudo = false;
          this.reesForm.reset();
          this.alterarConteudoPorMateria();
          this.toastr.success("Estudo registrado com sucesso!");
          this.btAtivos = [false, false];
          if (this.worker) {
            this.worker.postMessage({
              action: this.workerFinalizarSessao,
              tempoPomodoroSegundos: this.pomodoroConfiguration[0] * 60
            });
          }
          this.isSessaoAtiva = false;
          this.ciclos = 0;
        });
      }
    } else {
      this.toastr.error("Preencha todos os campos obrigatórios!");
      console.log(this.reesForm.value);
    }
  }

  trocarAba(): void { // alternar entre as abas de estudar e configurações -- pomodoro fica desativada enquanto a sessão está ativa
    if (!this.isSessaoAtiva) {
      if (this.isEstudarAtivo) {
        this.isEstudarAtivo = false;
        this.isConfiguracoesAtivo = true;
      } else {
        this.isEstudarAtivo = true;
        this.isConfiguracoesAtivo = false;
      }
    } else {
      this.toastr.warning("As configurações não podem ser alteradas durante uma sessão ativa!");
    }
  }

  novoConteudo(): void { // habilita o input de novo conteúdo (texto)
    if (this.isNovoConteudo) {
      this.isNovoConteudo = false;
    }
    else {
      this.isNovoConteudo = true
    }
  }
}
