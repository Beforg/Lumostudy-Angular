import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { InputComponent } from "../../shared/input/input.component";
import { ButtonComponent } from "../../shared/button/button.component";
import { RouterModule } from '@angular/router';
import { CommonModule, Time } from '@angular/common';
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
    ReactiveFormsModule],
  providers: [MateriaService, ReesService, CronogramaService],
  templateUrl: './estudar-lumoapp.component.html',
  styleUrl: './estudar-lumoapp.component.css'
})
export class EstudarLumoappComponent implements OnInit, OnDestroy{
  audioPath: string = '/app/timer.mp3'
  materias!: { value: string, label: string }[];
  conteudo!: { value: string, label: string }[];
  itensCronograma!: Cronograma[];
  pomodoroForm!: FormGroup<PomodoroConfiguration>;
  reesForm!: FormGroup<ReesForm>;
  tempoPomodoro: string = '';
  tempoPomodoroSegundos: number = 0;
  tempoIntervaloCurto: number = 0;
  tempoIntervaloLongo: number = 0;
  isBreak: boolean = false;
  isCicloConcluido: boolean = false;
  b: boolean = false;
  isEstudando: boolean = false;
  isSessaoAtiva: boolean = false;
  ciclos: number = 0;
  tempoTotal: string = '';
  pomodoroAtual: string = `Sessão do Pomodoro #${this.ciclos + 1}`;
  tempoTotalEstudoSegundos: number = 0;
  interval: any;
  tempoRestanteIntervalo: number = 0;

  isEstudosAtrasados: boolean = false;
  isNovoConteudo: boolean = false;
  isEstudarAtivo: boolean = true;
  isConfiguracoesAtivo: boolean = false; 
  firstValueInput: boolean = true;

  page: number = 1;
  pomodoroConfiguration: number[] = []; //timer, shortBreak, longBreak, cycles
  tempoFora: number = 0;
  qtdeItensCronograma: number = 0;
  private audio = new Audio(this.audioPath);
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
  ngOnDestroy(): void {
    clearInterval(this.interval);
    if (this.worker) {
      this.worker.terminate();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isEstudando || this.isBreak) {
      $event.returnValue = 'Você tem uma sessão de estudo em andamento. Tem certeza de que deseja sair?';
    }
  }

  getCronogramaDoDia(): void {
    this.cronogramaService.listarCronogramaDeHoje(this.page - 1).subscribe((cronograma: Cronograma[]) => {
      this.itensCronograma = cronograma
      this.qtdeItensCronograma = cronograma.length;
    } )
  }

  getCronogramaAtrasados(): void {
    this.cronogramaService.listarCronogramaAtrasados(this.page - 1).subscribe((cronograma: Cronograma[]) => {
      this.itensCronograma = cronograma
      this.qtdeItensCronograma = cronograma.length;
    })
  }

  trocarAbaCronograma(): void {
    if (this.isEstudosAtrasados) {
      this.isEstudosAtrasados = false;
      this.getCronogramaDoDia();
    } else {
      this.isEstudosAtrasados = true;
      this.getCronogramaAtrasados();
    }
  }

    voltarPagina(): void {
    if (this.page > 1) {
      this.page--;
      this.abaEscolhida();
    }
  }

  abaEscolhida(): void {
    if (this.isEstudosAtrasados) { 
      this.getCronogramaAtrasados();
    } else {
      this.getCronogramaDoDia();
    }
  }

  proximaPagina(): void {
    if (this.qtdeItensCronograma == 4) {
      this.page++;
      this.abaEscolhida();
    }
  }

  concluirEstudo(item: Cronograma) {
      this.cronogramaService.concluirItemCronograma(item.cod, !item.concluido).subscribe(() => {
        this.getCronogramaDoDia();
        this.toastr.success('Estudo atualizado!');
        
      })
      this.isEstudosAtrasados = false;
  }

  ngOnInit(): void {
    this.materiaService.getMaterias().subscribe((materias: Materia[]) => {
      this.materias = [{ value: '', label: 'Selecione a Matéria' }, ...materias.map(materia => ({
        value: materia.cod,
        label: materia.nome
      }))];
    });
    this.getCronogramaDoDia();
    if (localStorage.getItem('pomodoroConfiguration')) {
      this.pomodoroConfiguration = JSON.parse(localStorage.getItem('pomodoroConfiguration') as string);
    } else {
      this.pomodoroConfiguration = this.defaultPomodoro(this.pomodoroConfiguration);
      localStorage.setItem('pomodoroConfiguration', JSON.stringify(this.pomodoroConfiguration));
    }
    this.setPomodoroForm();

    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../../workers/timer.worker', import.meta.url));
      this.worker.onmessage = ({ data }) => {
        if (data === 'break') {
          this.isBreak = true;
          this.audio.play();
          this.startBreak();
        } else if (data === 'breakEnd') {
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
          this.tempoPomodoroSegundos = this.pomodoroConfiguration[0] * 60;
          this.tempoPomodoro = this.transofrmarTempo(this.tempoPomodoroSegundos);
        } else {
          if (data.tempoPomodoroSegundos !== undefined) {
            this.tempoPomodoroSegundos = data.tempoPomodoroSegundos;
            this.tempoTotalEstudoSegundos = data.tempoTotalEstudoSegundos;
            this.tempoPomodoro = this.transofrmarTempo(this.tempoPomodoroSegundos);
            this.tempoTotal = this.transofrmarTempo(this.tempoTotalEstudoSegundos);
          } else if (data.tempoIntervalo !== undefined) {
            this.tempoPomodoro = this.transofrmarTempo(data.tempoIntervalo);
            this.tempoRestanteIntervalo = data.tempoIntervalo; 
          }
        }
      };
    }
  }

      

  alterarConteudoPorMateria(): void {
    if(this.reesForm.get('codMateria')?.value === '') {
      this.reesForm.get('conteudo')?.setValue('');
      this.reesForm.get('conteudoTexto')?.setValue('');
      this.conteudo = [];
      return;
    } else {
      this.reesService.listarConteudo(this.reesForm.get('codMateria')?.value).subscribe((conteudo: string[]) => {
        this.conteudo = conteudo.map(c => ({
          value: c,
          label: c
        }));
      })
    }
  }

  transofrmarTempo(tempo: number): string {
    const horas = Math.floor(tempo / 3600);
    const minutos = Math.floor((tempo % 3600) / 60);
    const segundos = tempo % 60;
    return `${this.formatarNumero(horas)}:${this.formatarNumero(minutos)}:${this.formatarNumero(segundos)}`;
  }

  formatarNumero(numero: number): string {
    return numero < 10 ? `0${numero}` : `${numero}`;
  }

  defaultPomodoro(pomodoroConfiguration: number[]): number[] {
    pomodoroConfiguration[0] = 50;
    pomodoroConfiguration[1] = 10;
    pomodoroConfiguration[2] = 15;
    pomodoroConfiguration[3] = 4;
    return pomodoroConfiguration;
  }

  setPomodoroForm(): void {
    this.tempoPomodoroSegundos = this.pomodoroConfiguration[0] * 60;
    this.tempoIntervaloCurto = this.pomodoroConfiguration[1] * 60;
    this.tempoIntervaloLongo = this.pomodoroConfiguration[2] * 60;
    this.pomodoroForm.get('timer')?.setValue(this.pomodoroConfiguration[0]);
    this.pomodoroForm.get('shortBreak')?.setValue(this.pomodoroConfiguration[1]);
    this.pomodoroForm.get('longBreak')?.setValue(this.pomodoroConfiguration[2]);
    this.pomodoroForm.get('cycles')?.setValue(this.pomodoroConfiguration[3]);
    this.tempoPomodoro = this.transofrmarTempo(this.tempoPomodoroSegundos);
    this.tempoTotal = this.transofrmarTempo(this.tempoTotalEstudoSegundos);
    
  }

  configurarPomodoro(): void {
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
    }
  }

  iniciarPomodoro(): void {
    this.isSessaoAtiva = true;
    if (!this.isEstudando && !this.isBreak) {
      this.pomodoroAtual = `Sessão do Pomodoro #${this.ciclos + 1}`;
      this.isEstudando = true;
      if (this.worker) {
        this.worker.postMessage({
          action: 'start',
          tempoPomodoroSegundos: this.tempoPomodoroSegundos,
          tempoTotalEstudoSegundos: this.tempoTotalEstudoSegundos
        });
      }
    } else {
      if (this.b) {
        this.b = false;
        this.despausarBreak();
        console.log(this.tempoIntervaloCurto);
      }
    }
  }

  despausarBreak(): void {
    if (this.isBreak) {
      if (this.worker) {
        this.worker.postMessage({
          action: 'resumeBreak',
          tempoIntervalo: this.tempoRestanteIntervalo
        });
      }
    }
  }

  passarSessao(): void {
    if (confirm("Deseja passar a sessão do Timer?")) {
      this.iniciarPomodoro();
      if (this.worker) {
        this.worker.postMessage({ action: 'passarSessao' });
      }
  }
}

  pausarPomodoro(): void { 
    if (this.isEstudando) {
      this.isEstudando = false;
      if (this.worker) {
        this.worker.postMessage({ action: 'stopStudy' });
      }
      console.log("StopStudy");
    } else {
      this.b = true;
      if (this.worker) {
        this.worker.postMessage({ action: 'stop' });
      }
      console.log("StopBreak");
    }
  }

  resetarPomodoro(): void {
    if (confirm("Deseja reiniciar o Timer?")) {
      this.isEstudando = false
      if (this.worker) {
        this.worker.postMessage({ action: 'stop' });
      }
      this.tempoPomodoroSegundos = this.pomodoroConfiguration[0] * 60;
      this.tempoPomodoro = this.transofrmarTempo(this.tempoPomodoroSegundos);
    }
  }

  startBreak(): void {
    this.b = false;
    this.isEstudando = false;
    if (this.ciclos == this.pomodoroConfiguration[3] - 1) {
      this.pomodoroAtual = `Sessão do Pomodoro #${this.ciclos + 1} Concluída! Iniciando Intervalo Longo`;
      this.ciclos = 0;
      if (this.worker) {
        this.worker.postMessage({
          action: 'startBreak',
          tempoIntervalo: this.tempoIntervaloLongo
        });
      }
      this.isCicloConcluido = true;
    } else {
      this.pomodoroAtual = `Sessão do Pomodoro #${this.ciclos + 1} Concluída! Iniciando Intervalo Curto`;
      this.ciclos++;
      if (this.worker) {
        this.worker.postMessage({
          action: 'startBreak',
          tempoIntervalo: this.tempoIntervaloCurto
        });
      }
    }
  }

  trocarAba(): void {
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

  novoConteudo(): void {
    if (this.isNovoConteudo) {
      this.isNovoConteudo = false;
    }
    else {
      this.isNovoConteudo = true
    }
    console.log(this.isNovoConteudo);
  }

  registrarEstudo() {
    if (this.reesForm.valid && confirm("Deseja finalizar e registrar o estudo?")) {
      if (!this.isNovoConteudo) {
        this.reesForm.get('conteudoTexto')?.setValue(this.reesForm.get('conteudo')?.value);
      }
      const data: any = {
        tempo: this.transofrmarTempo(this.tempoTotalEstudoSegundos),
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
        if (this.worker) {
          this.worker.postMessage({ 
            action: 'finalizarSessao',
            tempoPomodoroSegundos: this.pomodoroConfiguration[0] * 60 
          });
        }
        this.isSessaoAtiva = false;
        this.ciclos = 0;
      });
    } else {
      this.toastr.error("Preencha todos os campos obrigatórios!");
      console.log(this.reesForm.value);
    } 
  }
}
